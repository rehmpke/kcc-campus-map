// src/AccessibleCampusMap.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { INITIAL_FEATURES, DIRECTORY_SECTIONS } from "./data/mapData";
import { getIcon } from "./utils/mapIcons";
import { featuresToCSV, parseCSV } from "./utils/mapUtils";
import Announcer from "./components/Announcer";
import Controls from "./components/Controls";
import DirectoryFlyTo from "./components/DirectoryFlyTo";
import FeatureEditor from "./components/FeatureEditor";
import PopupResources from "./components/PopupResources";

const IMG_SRC = "/maps/kcc-campus.png";
const isEdit = new URLSearchParams(window.location.search).has("edit");

function useImageDimensions(src) {
  const [dims, setDims] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () =>
      setDims({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = src;
  }, [src]);

  return dims;
}

export default function AccessibleCampusMap() {
  const dims = useImageDimensions(IMG_SRC);
  const [features, setFeatures] = useState(INITIAL_FEATURES);
  const [announce, setAnnounce] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [directoryAction, setDirectoryAction] = useState(null);
  const [openSections, setOpenSections] = useState(["buildings"]);

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
  const markerRefs = useRef({});
  const openPopupIdRef = useRef(null);

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
      {
        id,
        name: "New point",
        xy,
        desc: "",
        category: "building",
        resources: {
          heading: "Available Services & Resources",
          links: [],
          notes: [],
        },
      },
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

  const onImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const next = parseCSV(text, dims);

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
      prev.map((f) => (f.id === id ? { ...f, xy: [latlng.lat, latlng.lng] } : f))
    );
  };

  const onSelectList = (f) => {
    setSelected(f.id);
    setAnnounce(`Moved to ${f.name}`);
    focusShell();

    if (!f.xy) return;

    setDirectoryAction({
      id: f.id,
      xy: f.xy,
      nonce: Date.now(),
    });
  };

  const handleFieldChange = (id, field, value) => {
    if (!isEdit) return;
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

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
        if (bounds) map.fitBounds(bounds);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const listener = (e) => handleKeyNav(e);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [bounds]);

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
          <h1 className="h1">Campus Map</h1>

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
            isEdit={isEdit}
            onAddPoint={dropPoint}
            filter={filter}
            setFilter={setFilter}
            onExport={exportJson}
            onDownloadCSV={downloadCSV}
            onImportClick={triggerImport}
          />

          <label htmlFor="map-import" className="sr-only">
            Import CSV of map points
          </label>
          <input
            id="map-import"
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onImportFile}
            tabIndex={-1}
            aria-hidden="true"
            aria-label="Import CSV of map points"
          />

         {isEdit && (
          <div className="modeTag">
            Editor mode – unsaved changes; use Export JSON to persist
          </div>
          )}

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
                whenCreated={(m) => {
                  mapRef.current = m;
                }}
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

                <DirectoryFlyTo
                  action={directoryAction}
                  markerRefs={markerRefs}
                  openPopupIdRef={openPopupIdRef}
                  setSelected={setSelected}
                />

                {features.map((f) => (
                  <Marker
                    key={f.id}
                    position={f.xy}
                    icon={getIcon(f.category, f, selected === f.id)}
                    draggable={isEdit}
                    eventHandlers={{
                      dragend: (e) => onMarkerDrag(f.id, e),
                      popupopen: () => {
                        openPopupIdRef.current = f.id;
                        setSelected(f.id);
                      },
                      popupclose: () => {
                        if (openPopupIdRef.current === f.id) {
                          openPopupIdRef.current = null;
                        }
                      },
                    }}
                    title={f.name}
                    ref={(ref) => {
                      if (ref) markerRefs.current[f.id] = ref;
                    }}
                  >
                    <Popup maxWidth={340}>
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

                        {f.desc && <div className="popupDesc">{f.desc}</div>}

                        <PopupResources resources={f.resources} />

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

                        {isEdit && (
                          <div className="popupCoords">
                            [{Math.round(f.xy[0])}, {Math.round(f.xy[1])}]
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="loading">Loading map image…</div>
            )}
          </div>

          <p id="kbd-help" className="muted" aria-live="polite">
            Keyboard: Tab to directory, Enter to focus item on map. Arrow keys
            pan; + / − zoom. Home centers; End fits bounds.
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
                              className={`listItem ${selected === f.id ? "isSel" : ""}`}
                              onClick={() => onSelectList(f)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onSelectList(f);
                                }
                              }}
                              aria-label={`Focus ${f.name} on map`}
                            >
                              <div className="listName">{f.name}</div>
                              <div className="listCat">{f.category || "location"}</div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="muted small">No locations in this category yet.</div>
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
              Keyboard: Tab/Shift+Tab to move through sections and items; Enter to
              expand a section or move the map to the selected item.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}