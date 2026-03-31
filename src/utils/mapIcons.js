// src/utils/mapIcons.js
import L from "leaflet";

const COLORS = {
  building: "#004b87",
  parking: "#00695c",
  entrance: "#0079c1",
  landmark: "#ff6f00",
  service: "#6d4c41",
  other: "#555",
};

function buildSvg(category, glyph, isSelected = false) {
  const fill = COLORS[category] || COLORS.other;

  const size = isSelected ? 54 : 46;
  const radius = isSelected ? 24 : 20;
  const stroke = isSelected ? 4 : 3;
  const fontSize = isSelected ? 20 : 17;
  const shadowOpacity = isSelected ? 0.35 : 0.22;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="${shadowOpacity}" />
        </filter>
      </defs>
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="${fill}"
        stroke="#fff"
        stroke-width="${stroke}"
        filter="url(#shadow)"
      />
      <text
        x="50%"
        y="52%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        fill="#fff"
      >
        ${glyph || "•"}
      </text>
    </svg>
  `;
}

export function getIcon(category, feature, isSelected = false) {
  const glyph = feature?.glyph || feature?.name?.charAt(0) || "•";
  const size = isSelected ? 54 : 46;

  return L.divIcon({
    className: "customMarker",
    html: buildSvg(category, glyph, isSelected),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}