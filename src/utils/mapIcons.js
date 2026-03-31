// src/utils/mapIcons.js
import L from "leaflet";

export const CATEGORY_STYLES = {
  building: { color: "#004b87", glyph: "B" },
  parking: { color: "#00695c", glyph: "P" },
  entrance: { color: "#0079c1", glyph: "♿" },
  landmark: { color: "#ff6f00", glyph: "L" },
  service: { color: "#6d4c41", glyph: "S" },
  emergency: { color: "#b71c1c", glyph: "E" },
  assembly: { color: "#33691e", glyph: "A" },
  campus: { color: "#283593", glyph: "C" },
  wifi: { color: "#1e88e5", glyph: "W" },
  other: { color: "#424242", glyph: "•" },
};

export function getGlyphForFeature(feature) {
  if (feature?.glyph) return feature.glyph;

  if (feature?.category && CATEGORY_STYLES[feature.category]) {
    return CATEGORY_STYLES[feature.category].glyph;
  }

  const c = feature?.name?.trim()?.[0];
  return c ? c.toUpperCase() : "•";
}

export function makeMarkerSvg(bgColor, glyphText) {
  return `
    <svg xmlns='http://www.w3.org/2000/svg'
         width='44' height='44' viewBox='0 0 44 44'
         aria-hidden='true' focusable='false'>
      <circle cx='22' cy='22' r='20' fill='white'/>
      <circle cx='22' cy='22' r='18' fill='${bgColor}'/>
      <text x='22' y='27'
        text-anchor='middle'
        font-family='Arial, sans-serif'
        font-weight='700'
        font-size='18'
        fill='white'>
        ${glyphText}
      </text>
    </svg>
  `;
}

export function getIcon(category = "building", feature = null) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.building;
  const glyph = getGlyphForFeature(feature || { category, name: "" });
  const svg = makeMarkerSvg(style.color, glyph);

  return new L.Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -32],
  });
}