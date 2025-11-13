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
      1015.605204985727,
      1469.8784305005684
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
      856.1241775669636,
      1165.2379263025714
    ],
    "desc": "Advanced Technology Education Center.",
    "category": "building"
  },
  {
    "id": "riverfront",
    "name": "Riverfront",
    "glyph": "R",
    "xy": [
      960.6515954334849,
      1274.8286616268279
    ],
    "desc": "Kankakee Riverfront with accessible paths.",
    "category": "landmark"
  },
  {
    "id": "parking-5",
    "name": "Parking Lot 5",
    "xy": [
      703.9823289686334,
      1174.9482376994472
    ],
    "desc": "Visitor lot with 6 accessible spaces near Building T.",
    "category": "parking"
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
    "glyph": ""
  },
  {
    "id": "pt-1763070064102",
    "name": "Building L",
    "xy": [
      1216.0922236366691,
      1165.2713741969803
    ],
    "desc": "",
    "category": "building"
  },
  {
    "id": "pt-1763070140472",
    "name": "Building R – Arts & Sciences",
    "xy": [
      1194.8856585851227,
      951.7864340883023
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
