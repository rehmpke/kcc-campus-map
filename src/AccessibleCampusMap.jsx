// src/AccessibleCampusMap.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Download, Plus } from "lucide-react";

const IMG_SRC = "/maps/kcc-campus.png";
// Toggle edit mode: add ?edit=true to URL for admin tools
const isEdit = new URLSearchParams(window.location.search).has("edit");

// Seed data (replace with your exported JSON)
const INITIAL_FEATURES = [
  {
    "id": "bldg-g",
    "name": "Building G – Activities Center",
    "glyph": "G",
    "xy": [
      1038.7249795479927,
      1455.223528045635
    ],
    "desc": "Gymnasium and student activities center. Accessible restrooms at north entrance.",
    "category": "entrance",
    "url": "/facilities/activities-center",
    "img": "/images/map/building-g.jpg",
    "imgAlt": "Building G entry facing Parking Lot 5"
  },
  {
    "id": "bldg-t",
    "name": "Building T – ATEC",
    "glyph": "T",
    "xy": [
      886.003469149934,
      1151.8783675948316
    ],
    "desc": "Advanced Technology Education Center.",
    "category": "building"
  },
  {
    "id": "riverfront",
    "name": "Riverfront Campus",
    "glyph": "RC",
    "xy": [
      1192.3184882251576,
      1575.7534551964682
    ],
    "desc": "Kankakee Riverfront with accessible paths.",
    "category": "landmark"
  },
  {
    "id": "parking-5",
    "name": "Parking Lot 5",
    "xy": [
      673.1602440477584,
      1139.8561312727145
    ],
    "desc": "Visitor lot with 6 accessible spaces near Building T. Open Parking",
    "category": "parking",
    "glyph": "P5"
  },
  {
    "id": "pt-1763069975175",
    "name": "Building V – Technology",
    "xy": [
      944.6481909768765,
      1022.4768116077321
    ],
    "desc": "",
    "category": "building",
    "url": "",
    "img": "",
    "imgAlt": "",
    "glyph": "V"
  },
  {
    "id": "pt-1763070064102",
    "name": "Building L",
    "xy": [
      1216.0922236366691,
      1165.2713741969803
    ],
    "desc": "",
    "category": "building",
    "glyph": "L"
  },
  {
    "id": "pt-1763070140472",
    "name": "Building R – Arts & Sciences",
    "xy": [
      1216.921300048837,
      1081.8921510069179
    ],
    "desc": "",
    "category": "building",
    "glyph": "R"
  },
  {
    "id": "pt-1763070268994",
    "name": "Building D – WDC",
    "xy": [
      944.6481909768765,
      1367.4458539025493
    ],
    "desc": "Workforce Development Center",
    "category": "building",
    "glyph": "D"
  },
  {
    "id": "pt-1763071079282",
    "name": "Parking Lot 13",
    "xy": [
      845.6970044781933,
      848.528137423857
    ],
    "desc": "Staff Parking lot",
    "category": "parking",
    "glyph": "P13"
  },
  {
    "id": "pt-1763071338295",
    "name": "Parking Lot 8",
    "xy": [
      1125.0019281961152,
      925.6026704952725
    ],
    "desc": "Circle Drive by R and M building",
    "category": "parking",
    "glyph": "P8"
  },
  {
    "id": "pt-1763071429919",
    "name": "Parking Lot 7",
    "xy": [
      1048.634395827968,
      1062.0743853421943
    ],
    "desc": "",
    "category": "parking",
    "glyph": "P7"
  },
  {
    "id": "pt-1763071463190",
    "name": "Building W",
    "xy": [
      1031.6521078555156,
      1198.5444029424268
    ],
    "desc": "",
    "category": "building",
    "glyph": "W"
  },
  {
    "id": "pt-1763071535071",
    "name": "Building M – Health Careers Center For Excelence",
    "xy": [
      1127.1074645843232,
      1205.6170619230634
    ],
    "desc": "",
    "category": "building",
    "glyph": "M"
  },
  {
    "id": "pt-1763071843209",
    "name": "Parking Lot 6",
    "xy": [
      763.6712649500953,
      994.1921343482858
    ],
    "desc": "",
    "category": "parking",
    "glyph": "P6"
  },
  {
    "id": "pt-1763072015459",
    "name": "West Campus",
    "xy": [
      1042.6341896618696,
      373.54486448851696
    ],
    "desc": "",
    "category": "landmark",
    "glyph": "WC"
  },
  {
    "id": "pt-1763072112804",
    "name": "Parking Lot 14",
    "xy": [
      893.7865791810192,
      210.71760863775486
    ],
    "desc": "",
    "category": "parking",
    "glyph": "P14"
  },
  {
    "id": "pt-1763072316063",
    "name": "Prairie Acre",
    "xy": [
      1064.1663926258154,
      149.9058950661214
    ],
    "desc": "",
    "category": "landmark",
    "glyph": "PA"
  },
  {
    "id": "pt-1763072485335",
    "name": "Green House",
    "xy": [
      547.5820948414481,
      465.5724447105801
    ],
    "desc": "",
    "category": "building",
    "url": "",
    "img": "",
    "imgAlt": "",
    "glyph": "GH"
  },
  {
    "id": "pt-1763072531800",
    "name": "Parking Lot 11",
    "xy": [
      770.9955356232549,
      355
    ],
    "desc": "",
    "category": "parking",
    "glyph": "P11"
  },
  {
    "id": "pt-1763072564256",
    "name": "Parking Lot 10",
    "xy": [
      713.9948978551483,
      456.000300033661
    ],
    "desc": "",
    "category": "parking",
    "glyph": "P10"
  },
  {
    "id": "pt-1763072771898",
    "name": "Parking Lot 4",
    "xy": [
      460.99298455082896,
      1048.9996999663392
    ],
    "desc": "",
    "category": "parking",
    "glyph": "P4"
  },
  {
    "id": "pt-1763072796818",
    "name": "Parking Lot 12",
    "xy": [
      712.7699490181803,
      239.00209204105306
    ],
    "desc": "",
    "category": "parking",
    "glyph": "P12"
  },
  {
    "id": "pt-1763072852899",
    "name": "Building 5",
    "xy": [
      596.7764767541069,
      249.25492821242187
    ],
    "desc": "",
    "category": "building",
    "glyph": "5"
  },
  {
    "id": "pt-1763072892251",
    "name": "Building 4",
    "xy": [
      449.4422406003043,
      242.59804813192954
    ],
    "desc": "",
    "category": "building",
    "glyph": "4"
  },
  {
    "id": "pt-1763072937355",
    "name": "Building A",
    "xy": [
      722.2932843642988,
      322.89810524960245
    ],
    "desc": "",
    "category": "building",
    "glyph": "A"
  },
  {
    "id": "pt-1763072989292",
    "name": "Golf Course",
    "xy": [
      128.20904153203196,
      408.17684979772935
    ],
    "desc": "",
    "category": "landmark",
    "glyph": "GC"
  },
  {
    "id": "pt-1763222088162",
    "name": "Building VA",
    "xy": [
      593.28694180377,
      458.1897068328429
    ],
    "desc": "",
    "category": "building",
    "url": "",
    "img": "",
    "imgAlt": "",
    "glyph": "VA"
  },
  {
    "id": "pt-1763222202968",
    "name": "P9",
    "xy": [
      256.4717977616396,
      950.2128230880825
    ],
    "desc": "",
    "category": "parking",
    "glyph": "P9"
  },
  {
    "id": "pt-1763222289152",
    "name": "PM",
    "xy": [
      847.1094141599549,
      1364.7160876900366
    ],
    "desc": "",
    "category": "parking",
    "glyph": "PM"
  },
  {
    "id": "pt-1763222541246",
    "name": "P1",
    "xy": [
      847.081454010475,
      1523.8901105450932
    ],
    "desc": "",
    "category": "parking",
    "glyph": "P1"
  }
];

// ---------- Category Icons (large circular markers with standard wheelchair) ----------

// Base visual for each category.
const CATEGORY_STYLES = {
  building: { color: "#004b87", glyph: "B" }, // buildings
  parking: { color: "#00695c", glyph: "P" },
  entrance: { color: "#0079c1", glyph: "♿" }, // standard accessibility icon
  landmark: { color: "#ff6f00", glyph: "L" },
  service: { color: "#6d4c41", glyph: "S" },
  emergency: { color: "#b71c1c", glyph: "E" },
  assembly: { color: "#33691e", glyph: "A" },
  campus: { color: "#283593", glyph: "C" },
  wifi: { color: "#1e88e5", glyph: "W" },
  other: { color: "#424242", glyph: "•" },
};

// Optional per-feature override: if a feature has `glyph`, use that.
function getGlyphForFeature(feature) {
  if (feature && feature.glyph) return feature.glyph;

  if (feature && feature.category && CATEGORY_STYLES[feature.category]) {
    return CATEGORY_STYLES[feature.category].glyph;
  }

  // Fallback: first letter of name or dot
  const c = feature?.name?.trim()?.[0];
  return c ? c.toUpperCase() : "•";
}

function makeMarkerSvg(bgColor, glyphText) {
  return `
    <svg xmlns='http://www.w3.org/2000/svg'
         width='44' height='44' viewBox='0 0 44 44'
         aria-hidden='true' focusable='false'>
      <!-- outer halo to preserve contrast over any background -->
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

// Leaflet icon factory – pass category and the feature
function getIcon(category = "building", feature = null) {
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

// ---------- Directory accordion sections ----------
const DIRECTORY_SECTIONS = [
  { id: "buildings", label: "Buildings", categories: ["building"] },
  { id: "parking", label: "Parking", categories: ["parking"] },
  { id: "entrances", label: "Accessible Entrances", categories: ["entrance"] },
  { id: "emergency", label: "Emergency / Safety", categories: ["emergency"] },
  { id: "assembly", label: "Assembly Points", categories: ["assembly"] },
  { id: "campus", label: "Campus Locations", categories: ["campus"] },
  { id: "landmarks", label: "Landmarks", categories: ["landmark"] },
  { id: "services", label: "Services", categories: ["service"] },
  { id: "wifi", label: "Outdoor Wi-Fi", categories: ["wifi"] },
  { id: "other", label: "Other", categories: ["other"] },
];

function useImageDimensions(src) {
  const [dims, setDims] = useState(null);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setDims({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = src;
  }, [src]);
  return dims;
}

function Announcer({ message }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

function FlyTo({ xy, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!xy || !bounds) return;
    const [y, x] = xy;
    map.flyTo(L.latLng(y, x), 0, { duration: 0.4 });
  }, [xy, bounds]);
  return null;
}

function Controls({
  onAddPoint,
  filter,
  setFilter,
  onExport,
  onImportClick,
  onDownloadCSV,
  onZoomIn,
  onZoomOut,
}) {
  return (
    <div className="controls" role="group" aria-label="Map and data controls">
      <label className="search">
        <Search className="icon" aria-hidden="true" />
        <span className="sr-only">Search buildings</span>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search buildings, parking…"
          aria-label="Search buildings"
        />
      </label>

      {isEdit && (
        <>
          <button onClick={onAddPoint} className="btn" aria-label="Admin: Add point">
            <Plus className="icon" /> Admin » Add point
          </button>
          <button onClick={onExport} className="btn" aria-label="Export points JSON">
            <Download className="icon" /> Export JSON
          </button>
          <button onClick={onDownloadCSV} className="btn" aria-label="Download CSV template">
            <Download className="icon" /> Download CSV
          </button>
          <button onClick={onImportClick} className="btn" aria-label="Import CSV of points">
            <Download className="icon" /> Import CSV
          </button>
        </>
      )}

      <div className="zoomGroup" role="group" aria-label="Map zoom">
        <button
          className="btn zoomBtn"
          onClick={onZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
        <button
          className="btn zoomBtn"
          onClick={onZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
      </div>
    </div>
  );
}

export default function AccessibleCampusMap() {
  const dims = useImageDimensions(IMG_SRC);
  const [features, setFeatures] = useState(INITIAL_FEATURES);
  const [focusId, setFocusId] = useState(null);
  const [announce, setAnnounce] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [openSections, setOpenSections] = useState(["buildings"]); // default open

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return features;
    return features.filter((f) =>
      `${f.name} ${f.category} ${f.desc || ""}`.toLowerCase().includes(q)
    );
  }, [features, filter]);

  const bounds = useMemo(() => {
    if (!dims) return null;
    return [
      [0, 0],
      [dims.height, dims.width],
    ];
  }, [dims]);

  const mapRef = useRef(null);
  const shellRef = useRef(null);
  const fileRef = useRef(null);

  const focusShell = () => shellRef.current?.focus();

  useEffect(() => {
    if (dims && shellRef.current) shellRef.current.focus();
  }, [dims]);

  const dropPoint = () => {
    if (!dims) return;
    const xy = [dims.height / 2, dims.width / 2];
    const id = `pt-${Date.now()}`;
    setFeatures((prev) => [
      ...prev,
      { id, name: "New point", xy, desc: "", category: "building" },
    ]);
    setSelected(id);
    setAnnounce("Added a new point at map center");
    focusShell();
  };

  const exportJson = async () => {
    const data = JSON.stringify(features, null, 2);
    await navigator.clipboard.writeText(data).catch(() => {});
    alert("JSON copied to clipboard. Paste into INITIAL_FEATURES to persist.");
  };

  const featuresToCSV = (rows) => {
    const header = [
      "id",
      "name",
      "category",
      "desc",
      "y",
      "x",
      "url",
      "img",
      "imgAlt",
      "glyph",
    ];
    const body = rows.map((r) => [
      r.id,
      r.name,
      r.category || "",
      String(r.desc || "").replace(/\r?\n/g, " "),
      Math.round(r.xy[0]),
      Math.round(r.xy[1]),
      r.url || "",
      r.img || "",
      r.imgAlt || "",
      r.glyph || "",
    ]);
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    return [header.join(","), ...body.map((a) => a.map(esc).join(","))].join("\n");
  };

  const downloadCSV = () => {
    const blob = new Blob([featuresToCSV(features)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kcc-map-points.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const header = lines[0]
      .split(",")
      .map((h) => h.replace(/"/g, "").trim().toLowerCase());
    const idx = {
      id: header.indexOf("id"),
      name: header.indexOf("name"),
      category: header.indexOf("category"),
      desc: header.indexOf("desc"),
      y: header.indexOf("y"),
      x: header.indexOf("x"),
      url: header.indexOf("url"),
      img: header.indexOf("img"),
      imgAlt: header.indexOf("imgalt"),
      glyph: header.indexOf("glyph"),
    };
    return lines.slice(1).map((line) => {
      const cols =
        line
          .match(/"([^"]|"")*"|[^,]+/g)
          ?.map((s) => s.replace(/^"|"$/g, "").replace(/""/g, '"')) || [];
      const id = cols[idx.id] || `pt-${crypto.randomUUID?.() || Date.now()}`;
      const name = cols[idx.name] || "Untitled";
      const category = cols[idx.category] || "building";
      const desc = cols[idx.desc] || "";
      const y = parseFloat(cols[idx.y]);
      const x = parseFloat(cols[idx.x]);
      const xy =
        Number.isFinite(y) && Number.isFinite(x)
          ? [y, x]
          : [dims?.height / 2 || 0, dims?.width / 2 || 0];
      const url = idx.url >= 0 ? cols[idx.url] : "";
      const img = idx.img >= 0 ? cols[idx.img] : "";
      const imgAlt = idx.imgAlt >= 0 ? cols[idx.imgAlt] : "";
      const glyph = idx.glyph >= 0 ? cols[idx.glyph] : "";
      return { id, name, category, desc, xy, url, img, imgAlt, glyph };
    });
  };

  const onImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const next = parseCSV(text);
    if (!next.length) {
      setAnnounce("No valid rows found in CSV.");
      alert("Import error: no valid rows found.");
      e.target.value = "";
      return;
    }
    setFeatures(next);
    setAnnounce(`Imported ${next.length} points from CSV`);
    e.target.value = "";
    focusShell();
  };

  const triggerImport = () => fileRef.current?.click();

  const onMarkerDrag = (id, e) => {
    if (!isEdit) return;
    const latlng = e.target.getLatLng();
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, xy: [latlng.lat, latlng.lng] } : f
      )
    );
  };

  const onSelectList = (f) => {
    setFocusId(f.id);
    setAnnounce(`Moved to ${f.name}`);
    focusShell();
  };

  const handleFieldChange = (id, field, value) => {
    if (!isEdit) return;
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const zoomIn = () => {
    focusShell();
    mapRef.current?.zoomIn();
  };
  const zoomOut = () => {
    focusShell();
    mapRef.current?.zoomOut();
  };

  // Keyboard navigation: arrows pan, + / - zoom, Home/End reset
  const handleKeyNav = (e) => {
    if (!shellRef.current || document.activeElement !== shellRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    const key = e.key;
    const step = 120 * Math.pow(1.3, map.getZoom() || 0);

    switch (key) {
      case "ArrowUp":
        e.preventDefault();
        map.panBy([0, -step]);
        break;
      case "ArrowDown":
        e.preventDefault();
        map.panBy([0, step]);
        break;
      case "ArrowLeft":
        e.preventDefault();
        map.panBy([-step, 0]);
        break;
      case "ArrowRight":
        e.preventDefault();
        map.panBy([step, 0]);
        break;
      case "+":
      case "=":
        e.preventDefault();
        map.zoomIn();
        break;
      case "-":
        e.preventDefault();
        map.zoomOut();
        break;
      case "Home":
        e.preventDefault();
        map.setView(map.getCenter(), 0);
        break;
      case "End":
        e.preventDefault();
        bounds && map.fitBounds(bounds);
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    const listener = (e) => handleKeyNav(e);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [dims, bounds]);

  const toggleSection = (id) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="wrap">
      <a href="#directory" className="focus-reveal">
        Skip to directory
      </a>
      <a href="#map-region" className="focus-reveal">
        Skip to map
      </a>
      <Announcer message={announce} />

      <div className="grid">
        <div className="main">
          <h1 className="h1">KCC Campus Map (Accessible Interactive)</h1>

          {/* Legend */}
          <div className="legend" aria-label="Map legend">
            <span>
              <span className="dot" style={{ background: "#004b87" }}></span>
              Building
            </span>
            <span>
              <span className="dot" style={{ background: "#00695c" }}></span>
              Parking
            </span>
            <span>
              <span className="dot" style={{ background: "#0079c1" }}></span>
              Accessible Entrance
            </span>
            <span>
              <span className="dot" style={{ background: "#ff6f00" }}></span>
              Landmark
            </span>
            <span>
              <span className="dot" style={{ background: "#6d4c41" }}></span>
              Service
            </span>
          </div>

          <Controls
            onAddPoint={dropPoint}
            filter={filter}
            setFilter={setFilter}
            onExport={exportJson}
            onDownloadCSV={downloadCSV}
            onImportClick={triggerImport}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
          />
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onImportFile}
            aria-hidden="true"
          />

          <div className="modeTag">
            {isEdit
              ? "Editor mode – unsaved changes; use Export JSON to persist"
              : "Viewer mode – read-only"}
          </div>

          <div
            id="map-region"
            ref={shellRef}
            className="mapShell"
            role="region"
            aria-label="KCC interactive campus map"
            tabIndex={0}
            onMouseDown={focusShell}
            aria-describedby="kbd-help"
          >
            {dims && bounds ? (
              <MapContainer
                whenCreated={(m) => (mapRef.current = m)}
                crs={L.CRS.Simple}
                bounds={bounds}
                maxBounds={bounds}
                maxZoom={3}
                minZoom={-4}
                zoomSnap={0.25}
                wheelPxPerZoomLevel={120}
                style={{ height: "70vh", width: "100%" }}
                keyboard={true}
                attributionControl={false}
              >
                <ImageOverlay url={IMG_SRC} bounds={bounds} />
                {features.map((f) => (
                  <Marker
                    key={f.id}
                    position={f.xy}
                    icon={getIcon(f.category, f)}
                    draggable={isEdit}
                    eventHandlers={{ dragend: (e) => onMarkerDrag(f.id, e) }}
                    title={f.name}
                  >
                    <Popup>
                      <div className="popup">
                        {f.img && (
                          <img
                            src={f.img}
                            alt={f.imgAlt || `${f.name} photo`}
                            className="popupImg"
                            width="220"
                            height="124"
                            loading="lazy"
                          />
                        )}
                        <div className="popupTitle">{f.name}</div>
                        {f.desc && (
                          <div className="popupDesc">{f.desc}</div>
                        )}
                        {f.url && (
                          <a
                            className="linkBtn"
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            More details
                            <span className="sr-only"> about {f.name}</span>
                          </a>
                        )}
                        <div className="popupCoords">
                          [{Math.round(f.xy[0])}, {Math.round(f.xy[1])}]
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {focusId && (
                  <FlyTo
                    xy={features.find((f) => f.id === focusId)?.xy}
                    bounds={bounds}
                  />
                )}
              </MapContainer>
            ) : (
              <div className="loading">Loading map image…</div>
            )}
          </div>

          <p id="kbd-help" className="muted" aria-live="polite">
            Keyboard: Tab to directory, Enter to focus item on map. Arrow keys pan; + / −
            zoom. Home centers; End fits bounds.
          </p>
        </div>

        <div id="directory" className="side">
          <h2 className="h2">Directory</h2>

          <div
            className="accordion"
            role="navigation"
            aria-label="Campus locations directory"
          >
            {DIRECTORY_SECTIONS.map((section) => {
              const items = filtered.filter((f) =>
                section.categories.includes(f.category)
              );
              const isOpen = openSections.includes(section.id);

              return (
                <div key={section.id}>
                  <button
                    className="accordionHeader"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    aria-controls={`section-${section.id}`}
                  >
                    <span>{section.label}</span>
                    <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                  <div
                    id={`section-${section.id}`}
                    className={`accordionPanel ${isOpen ? "isOpen" : ""}`}
                    hidden={!isOpen}
                  >
                    {items.length ? (
                      <ul className="list">
                        {items.map((f) => (
                          <li key={f.id}>
                            <button
                              className={`listItem ${
                                selected === f.id ? "isSel" : ""
                              }`}
                              onClick={() => {
                                setSelected(f.id);
                                onSelectList(f);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelected(f.id);
                                  onSelectList(f);
                                }
                              }}
                              aria-label={`Focus ${f.name} on map`}
                            >
                              <div className="listName">{f.name}</div>
                              <div className="listCat">
                                {f.category || "location"}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="muted small">
                        No locations in this category yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isEdit && selected && (
            <div className="editor">
              <h3 className="h3">Edit selected</h3>
              <FeatureEditor
                feature={features.find((f) => f.id === selected)}
                onChange={handleFieldChange}
              />
            </div>
          )}

          <div className="altText">
            <p className="bold">Text alternative (WCAG):</p>
            <p>
              Use the directory accordion to focus items on the map. All buildings and
              landmarks are listed under their categories with names and descriptions.
              Keyboard: Tab/Shift+Tab to move through sections and items; Enter to expand
              a section or move the map to the selected item.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureEditor({ feature, onChange }) {
  if (!feature) return null;
  const [name, setName] = useState(feature.name);
  const [desc, setDesc] = useState(feature.desc || "");
  const [category, setCategory] = useState(feature.category || "building");
  const [url, setUrl] = useState(feature.url || "");
  const [img, setImg] = useState(feature.img || "");
  const [imgAlt, setImgAlt] = useState(feature.imgAlt || "");
  const [glyph, setGlyph] = useState(feature.glyph || "");

  useEffect(() => {
    setName(feature.name);
    setDesc(feature.desc || "");
    setCategory(feature.category || "building");
    setUrl(feature.url || "");
    setImg(feature.img || "");
    setImgAlt(feature.imgAlt || "");
    setGlyph(feature.glyph || "");
  }, [feature.id]);

  useEffect(() => {
    onChange(feature.id, "name", name);
  }, [name]);
  useEffect(() => {
    onChange(feature.id, "desc", desc);
  }, [desc]);
  useEffect(() => {
    onChange(feature.id, "category", category);
  }, [category]);
  useEffect(() => {
    onChange(feature.id, "url", url);
  }, [url]);
  useEffect(() => {
    onChange(feature.id, "img", img);
  }, [img]);
  useEffect(() => {
    onChange(feature.id, "imgAlt", imgAlt);
  }, [imgAlt]);
  useEffect(() => {
    onChange(feature.id, "glyph", glyph);
  }, [glyph]);

  return (
    <div className="form">
      <label className="lb">
        Name
        <input
          className="txt"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="lb">
        Description
        <textarea
          className="txt"
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </label>
      <label className="lb">
        Category
        <select
          className="txt"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="building">Building</option>
          <option value="parking">Parking</option>
          <option value="entrance">Accessible Entrance</option>
          <option value="landmark">Landmark</option>
          <option value="service">Service</option>
          <option value="emergency">Emergency / Safety</option>
          <option value="assembly">Assembly Point</option>
          <option value="campus">Campus Location</option>
          <option value="wifi">Outdoor Wi-Fi</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="lb">
        Marker glyph (optional – letter/number)
        <input
          className="txt"
          value={glyph}
          onChange={(e) => setGlyph(e.target.value)}
        />
      </label>
      <label className="lb">
        Facility page URL
        <input
          className="txt"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <label className="lb">
        Image URL
        <input
          className="txt"
          value={img}
          onChange={(e) => setImg(e.target.value)}
        />
      </label>
      <label className="lb">
        Image alt text
        <input
          className="txt"
          value={imgAlt}
          onChange={(e) => setImgAlt(e.target.value)}
        />
      </label>
      <div className="help">
        Drag the marker on the map to reposition. Coordinates are saved automatically.
      </div>
    </div>
  );
}
