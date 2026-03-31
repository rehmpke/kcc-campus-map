// src/utils/mapIcons.js
import L from "leaflet";

const COLORS = {
  building: "#004b87",
  parking: "#00695c",
  entrance: "#0079c1",
  landmark: "#ff6f00",
  service: "#6d4c41",
  emergency: "#b71c1c",
  assembly: "#33691e",
  campus: "#283593",
  wifi: "#1e88e5",
  other: "#555",
};

function getGlyph(feature) {
  if (feature?.glyph) return feature.glyph;
  const c = feature?.name?.trim()?.[0];
  return c ? c.toUpperCase() : "•";
}

function buildSvg(category, glyph, isSelected = false) {
  const fill = COLORS[category] || COLORS.other;

  const size = isSelected ? 54 : 46;
  const center = size / 2;
  const outerRadius = isSelected ? 24 : 20;
  const innerRadius = isSelected ? 21 : 17.5;
  const fontSize = isSelected ? 20 : 17;
  const shadowOpacity = isSelected ? 0.32 : 0.2;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true" focusable="false">
      <defs>
        <filter id="markerShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000" flood-opacity="${shadowOpacity}" />
        </filter>
      </defs>

      ${
        isSelected
          ? `<circle cx="${center}" cy="${center}" r="26" fill="rgba(255,255,255,0.55)" />`
          : ""
      }

      <circle
        cx="${center}"
        cy="${center}"
        r="${outerRadius}"
        fill="#ffffff"
        filter="url(#markerShadow)"
      />
      <circle
        cx="${center}"
        cy="${center}"
        r="${innerRadius}"
        fill="${fill}"
      />

      <text
        x="50%"
        y="52%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        fill="#ffffff"
      >
        ${glyph}
      </text>
    </svg>
  `;
}

export function getIcon(category = "building", feature = null, isSelected = false) {
  const glyph = getGlyph(feature);
  const size = isSelected ? 54 : 46;

  return L.divIcon({
    className: `customMarker${isSelected ? " isSelected" : ""}`,
    html: buildSvg(category, glyph, isSelected),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}