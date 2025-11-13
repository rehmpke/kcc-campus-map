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
  { id: "bldg-g", name: "Building G – Activities Center", xy: [600, 830], desc: "Gym / Student Activities", category: "building" },
  { id: "bldg-t", name: "Building T – ATEC", xy: [520, 520], desc: "Advanced Technology Education Center", category: "building" },
  { id: "riverfront", name: "Riverfront", xy: [310, 240], desc: "Kankakee Riverfront", category: "landmark" },
  { id: "parking-5", name: "Parking Lot 5", xy: [760, 620], desc: "Visitor & Staff Parking", category: "parking" },
];

// ---------- Category Icons (accessible inline SVG) ----------
const ICONS = {
  building: `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='38' viewBox='0 0 26 38' aria-hidden='true' focusable='false'>
    <path d='M13 0C5.82 0 0 5.82 0 13c0 9.34 13 25 13 25s13-15.66 13-25C26 5.82 20.18 0 13 0z' fill='#1a237e'/>
    <rect x='8' y='8' width='10' height='10' fill='white'/>
  </svg>`,
  parking: `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='38' viewBox='0 0 26 38' aria-hidden='true' focusable='false'>
    <path d='M13 0C5.82 0 0 5.82 0 13c0 9.34 13 25 13 25s13-15.66 13-25C26 5.82 20.18 0 13 0z' fill='#0d47a1'/>
    <text x='13' y='17' font-size='10' fill='white' text-anchor='middle' font-family='Arial' font-weight='bold'>P</text>
  </svg>`,
  entrance: `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='38' viewBox='0 0 26 38' aria-hidden='true' focusable='false'>
    <path d='M13 0C5.82 0 0 5.82 0 13c0 9.34 13 25 13 25s13-15.66 13-25C26 5.82 20.18 0 13 0z' fill='#2e7d32'/>
    <text x='13' y='17' font-size='12' fill='white' text-anchor='middle' font-family='Arial'>♿</text>
  </svg>`,
  landmark: `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='38' viewBox='0 0 26 38' aria-hidden='true' focusable='false'>
    <path d='M13 0C5.82 0 0 5.82 0 13c0 9.34 13 25 13 25s13-15.66 13-25C26 5.82 20.18 0 13 0z' fill='#ff6f00'/>
    <circle cx='13' cy='13' r='4' fill='white'/>
  </svg>`,
  service: `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='38' viewBox='0 0 26 38' aria-hidden='true' focusable='false'>
    <path d='M13 0C5.82 0 0 5.82 0 13c0 9.34 13 25 13 25s13-15.66 13-25C26 5.82 20.18 0 13 0z' fill='#4e342e'/>
    <rect x='10' y='8' width='6' height='10' fill='white'/>
  </svg>`,
};
function getIcon(category = "building") {
  const svg = ICONS[category] || ICONS.building;
  return new L.Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    popupAnchor: [0, -36],
  });
}
// ------------------------------------------------------------

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
  return <div aria-live="polite" aria-atomic="true" className="sr-only">{message}</div>;
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

function Controls({ onAddPoint, filter, setFilter, onExport, onImportClick, onDownloadCSV, onZoomIn, onZoomOut }) {
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
        <button className="btn zoomBtn" onClick={onZoomIn} aria-label="Zoom in" title="Zoom in">+</button>
        <button className="btn zoomBtn" onClick={onZoomOut} aria-label="Zoom out" title="Zoom out">−</button>
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

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return features;
    return features.filter(f => `${f.name} ${f.category}`.toLowerCase().includes(q));
  }, [features, filter]);

  const bounds = useMemo(() => {
    if (!dims) return null;
    return [[0, 0], [dims.height, dims.width]];
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
    setFeatures(prev => [...prev, { id, name: "New point", xy, desc: "", category: "building" }]);
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
    const header = ["id", "name", "category", "desc", "y", "x"];
    const body = rows.map(r => [
      r.id,
      r.name,
      r.category || "",
      String(r.desc || "").replace(/\r?\n/g, " "),
      Math.round(r.xy[0]),
      Math.round(r.xy[1])
    ]);
    const esc = v => `"${String(v).replace(/"/g, '""')}"`;
    return [header.join(","), ...body.map(a => a.map(esc).join(","))].join("\n");
  };

  const downloadCSV = () => {
    const blob = new Blob([featuresToCSV(features)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "kcc-map-points.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    const idx = { id: header.indexOf("id"), name: header.indexOf("name"), category: header.indexOf("category"), desc: header.indexOf("desc"), y: header.indexOf("y"), x: header.indexOf("x") };
    return lines.slice(1).map(line => {
      const cols = line.match(/"([^"]|"")*"|[^,]+/g)?.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
      const id = cols[idx.id] || `pt-${crypto.randomUUID?.() || Date.now()}`;
      const name = cols[idx.name] || "Untitled";
      const category = cols[idx.category] || "building";
      const desc = cols[idx.desc] || "";
      const y = parseFloat(cols[idx.y]);
      const x = parseFloat(cols[idx.x]);
      const xy = (Number.isFinite(y) && Number.isFinite(x)) ? [y, x] : [dims?.height / 2 || 0, dims?.width / 2 || 0];
      return { id, name, category, desc, xy };
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
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, xy: [latlng.lat, latlng.lng] } : f));
  };

  const onSelectList = (f) => {
    setFocusId(f.id);
    setAnnounce(`Moved to ${f.name}`);
    focusShell();
  };

  const handleFieldChange = (id, field, value) => {
    if (!isEdit) return;
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const zoomIn = () => { focusShell(); mapRef.current?.zoomIn(); };
  const zoomOut = () => { focusShell(); mapRef.current?.zoomOut(); };

  // Keyboard navigation: arrows pan, + / - zoom, Home/End reset
  const handleKeyNav = (e) => {
    if (!shellRef.current || document.activeElement !== shellRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    const key = e.key;
    const step = 120 * Math.pow(1.3, map.getZoom() || 0);

    switch (key) {
      case "ArrowUp": e.preventDefault(); map.panBy([0, -step]); break;
      case "ArrowDown": e.preventDefault(); map.panBy([0,  step]); break;
      case "ArrowLeft": e.preventDefault(); map.panBy([-step, 0]); break;
      case "ArrowRight": e.preventDefault(); map.panBy([ step, 0]); break;
      case "+": case "=": e.preventDefault(); map.zoomIn(); break;
      case "-": e.preventDefault(); map.zoomOut(); break;
      case "Home": e.preventDefault(); map.setView(map.getCenter(), 0); break;
      case "End": e.preventDefault(); bounds && map.fitBounds(bounds); break;
      default: break;
    }
  };
  useEffect(() => {
    const listener = (e) => handleKeyNav(e);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [dims]);

  return (
    <div className="wrap">
      <a href="#directory" className="sr-only focus-reveal">Skip to directory</a>
      <a href="#map-region" className="sr-only focus-reveal">Skip to map</a>
      <Announcer message={announce} />

      <div className="grid">
        <div className="main">
          <h1 className="h1">KCC Campus Map (Accessible Interactive)</h1>

          {/* Legend */}
          <div className="legend" aria-label="Map legend">
            <span><span className="dot" style={{background:'#1a237e'}}></span>Building</span>
            <span><span className="dot" style={{background:'#0d47a1'}}></span>Parking</span>
            <span><span className="dot" style={{background:'#2e7d32'}}></span>Accessible Entrance</span>
            <span><span className="dot" style={{background:'#ff6f00'}}></span>Landmark</span>
            <span><span className="dot" style={{background:'#4e342e'}}></span>Service</span>
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
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onImportFile} aria-hidden="true" />

          <div className="modeTag">
            {isEdit ? "Editor mode – unsaved changes; use Export JSON to persist" : "Viewer mode – read-only"}
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
                    icon={getIcon(f.category)}
                    draggable={isEdit}
                    eventHandlers={{ dragend: (e) => onMarkerDrag(f.id, e) }}
                    title={f.name}
                  >
                    <Popup>
                      <div className="popup">
                        <div className="popupTitle">{f.name}</div>
                        {f.desc && <div className="popupDesc">{f.desc}</div>}
                        <div className="popupCoords">[{Math.round(f.xy[0])}, {Math.round(f.xy[1])}]</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {focusId && <FlyTo xy={features.find(f => f.id === focusId)?.xy} bounds={bounds} />}
              </MapContainer>
            ) : (
              <div className="loading">Loading map image…</div>
            )}
          </div>

          <p id="kbd-help" className="muted" aria-live="polite">
            Keyboard: Tab to directory, Enter to focus item on map. Arrow keys pan; + / − zoom. Home centers; End fits bounds.
          </p>
        </div>

        <div id="directory" className="side">
          <h2 className="h2">Directory</h2>
          <div className="listScroll">
            <ul className="list">
              {filtered.map((f) => (
                <li key={f.id}>
                  <button
                    className={`listItem ${selected === f.id ? "isSel" : ""}`}
                    onClick={() => { setSelected(f.id); onSelectList(f); }}
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
                    <div className="listCat">{f.category}</div>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="muted">No matches</li>}
            </ul>
          </div>

          {isEdit && selected && (
            <div className="editor">
              <h3 className="h3">Edit selected</h3>
              <FeatureEditor feature={features.find(f => f.id === selected)} onChange={handleFieldChange} />
            </div>
          )}

          <div className="altText">
            <p className="bold">Text alternative (WCAG):</p>
            <p>Use the directory to focus items on the map. All buildings and landmarks are listed with names and categories. Keyboard: Tab/Shift+Tab to move through the list; Enter to move the map to the selected item.</p>
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

  useEffect(() => { setName(feature.name); setDesc(feature.desc || ""); setCategory(feature.category || "building"); }, [feature.id]);
  useEffect(() => { onChange(feature.id, "name", name); }, [name]);
  useEffect(() => { onChange(feature.id, "desc", desc); }, [desc]);
  useEffect(() => { onChange(feature.id, "category", category); }, [category]);

  return (
    <div className="form">
      <label className="lb">Name
        <input className="txt" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="lb">Description
        <textarea className="txt" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </label>
      <label className="lb">Category
        <select className="txt" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="building">Building</option>
          <option value="parking">Parking</option>
          <option value="entrance">Accessible Entrance</option>
          <option value="landmark">Landmark</option>
          <option value="service">Service</option>
        </select>
      </label>
      <div className="help">Drag the marker on the map to reposition. Coordinates are saved automatically.</div>
    </div>
  );
}
