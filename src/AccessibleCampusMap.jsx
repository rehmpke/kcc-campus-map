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
import PopupArrival from "./components/PopupArrival";
import PopupResources from "./components/PopupResources";

const IMG_SRC = "/maps/kcc-campus.png";
const isEdit = new URLSearchParams(window.location.search).has("edit");
const DEFAULT_VISIBLE_RESULTS = 8;

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

function scoreFeature(feature, query) {
  const q = query.toLowerCase();
  const name = (feature?.name || "").toLowerCase();
  const desc = (feature?.desc || "").toLowerCase();
  const category = (feature?.category || "").toLowerCase();
  const glyph = (feature?.glyph || "").toLowerCase();

  const links = Array.isArray(feature?.resources?.links)
    ? feature.resources.links
    : [];

  const notes = Array.isArray(feature?.resources?.notes)
    ? feature.resources.notes
    : [];

  const arrivalFields = [
    feature?.arrival?.parking || "",
    feature?.arrival?.entrance || "",
    feature?.arrival?.route || "",
    feature?.arrival?.elevator || "",
    feature?.arrival?.restroom || "",
    feature?.arrival?.serviceNote || "",
    ...(Array.isArray(feature?.arrival?.access) ? feature.arrival.access : []),
  ].map((item) => String(item).toLowerCase());

  if (!q) return null;

  if (name === q) {
    return { score: 100, matchReason: "Matched on building name" };
  }

  if (name.startsWith(q)) {
    return { score: 90, matchReason: "Matched on building name" };
  }

  if (name.includes(q)) {
    return { score: 80, matchReason: "Matched on building name" };
  }

  for (const link of links) {
    const label = (link?.label || "").toLowerCase();

    if (label === q) {
      return {
        score: 75,
        matchReason: `Matched on destination: ${link.label}`,
      };
    }

    if (label.startsWith(q)) {
      return {
        score: 72,
        matchReason: `Matched on destination: ${link.label}`,
      };
    }

    if (label.includes(q)) {
      return {
        score: 70,
        matchReason: `Matched on destination: ${link.label}`,
      };
    }
  }

  if (desc.startsWith(q)) {
    return { score: 62, matchReason: "Matched on description" };
  }

  if (desc.includes(q)) {
    return { score: 60, matchReason: "Matched on description" };
  }

  for (const arrivalText of arrivalFields) {
    if (arrivalText.startsWith(q)) {
      return {
        score: 55,
        matchReason: "Matched on arrival guidance",
      };
    }

    if (arrivalText.includes(q)) {
      return {
        score: 53,
        matchReason: "Matched on arrival guidance",
      };
    }
  }

  for (const note of notes) {
    const noteText = (note || "").toLowerCase();

    if (noteText.startsWith(q)) {
      return {
        score: 52,
        matchReason: `Matched on note: ${note}`,
      };
    }

    if (noteText.includes(q)) {
      return {
        score: 50,
        matchReason: `Matched on note: ${note}`,
      };
    }
  }

  if (category.includes(q)) {
    return { score: 30, matchReason: "Matched on category" };
  }

  if (glyph.includes(q)) {
    return { score: 20, matchReason: "Matched on marker glyph" };
  }

  return null;
}

export default function AccessibleCampusMap() {
  const dims = useImageDimensions(IMG_SRC);
  const [features, setFeatures] = useState(INITIAL_FEATURES);
  const [announce, setAnnounce] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [directoryAction, setDirectoryAction] = useState(null);
  const [openSections, setOpenSections] = useState(["buildings"]);
  const [showAllSearchResults, setShowAllSearchResults] = useState(false);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [selectedSearchResultId, setSelectedSearchResultId] = useState(null);

  const trimmedFilter = filter.trim().toLowerCase();
  const isDirectoryInSearchMode = Boolean(trimmedFilter) && isSearchResultsOpen;

  const rankedSearchResults = useMemo(() => {
    if (!trimmedFilter) return [];

    return features
      .map((feature) => {
        const match = scoreFeature(feature, trimmedFilter);
        if (!match) return null;

        return {
          ...feature,
          searchScore: match.score,
          matchReason: match.matchReason,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.searchScore !== a.searchScore) {
          return b.searchScore - a.searchScore;
        }

        return (a.name || "").localeCompare(b.name || "");
      });
  }, [features, trimmedFilter]);

  const visibleSearchResults = useMemo(() => {
    if (showAllSearchResults) return rankedSearchResults;
    return rankedSearchResults.slice(0, DEFAULT_VISIBLE_RESULTS);
  }, [rankedSearchResults, showAllSearchResults]);

  const filteredDirectoryItems = useMemo(() => {
    if (!isDirectoryInSearchMode) return features;
    return rankedSearchResults;
  }, [features, rankedSearchResults, isDirectoryInSearchMode]);

  const selectedSearchResult = useMemo(() => {
    if (!selectedSearchResultId) return null;

    return (
      rankedSearchResults.find((item) => item.id === selectedSearchResultId) ||
      features.find((item) => item.id === selectedSearchResultId) ||
      null
    );
  }, [rankedSearchResults, features, selectedSearchResultId]);

  const selectedFeature = useMemo(() => {
    if (!selected) return null;
    return features.find((item) => item.id === selected) || null;
  }, [features, selected]);

  const visibleDirectorySections = useMemo(() => {
    if (isEdit) return DIRECTORY_SECTIONS;

    return DIRECTORY_SECTIONS.filter((section) =>
      filteredDirectoryItems.some((feature) =>
        section.categories.includes(feature.category)
      )
    );
  }, [filteredDirectoryItems]);

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
  const pendingFocusIdRef = useRef(null);

  const focusShell = () => shellRef.current?.focus();

  useEffect(() => {
    if (dims && shellRef.current) shellRef.current.focus();
  }, [dims]);

  useEffect(() => {
    setShowAllSearchResults(false);

    if (!trimmedFilter) {
      setIsSearchResultsOpen(false);
      return;
    }

    setIsSearchResultsOpen(true);
    setSelectedSearchResultId(null);
  }, [trimmedFilter]);

  useEffect(() => {
    if (!trimmedFilter || !isSearchResultsOpen) return;

    setAnnounce(
      `${rankedSearchResults.length} result${
        rankedSearchResults.length === 1 ? "" : "s"
      } found for ${filter.trim()}`
    );
  }, [trimmedFilter, rankedSearchResults.length, filter, isSearchResultsOpen]);

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
        arrival: {
          heading: "Arrival & Access",
          parking: "",
          entrance: "",
          route: "",
          elevator: "",
          restroom: "",
          serviceNote: "",
          access: [],
        },
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

  const focusFeatureOnMap = (f, source = "directory") => {
    setSelected(f.id);

    if (source === "marker") {
      pendingFocusIdRef.current = f.id;
    }

    if (source === "search" || selectedSearchResultId !== null) {
      setSelectedSearchResultId(f.id);
    }

    if (source === "search" || isSearchResultsOpen) {
      setIsSearchResultsOpen(false);
    }

    setAnnounce(
      source === "search"
        ? `Showing ${f.name} on map`
        : source === "marker"
          ? `Focused ${f.name}`
          : `Moved to ${f.name}`
    );

    focusShell();

    if (!f.xy) return;

    setDirectoryAction({
      id: f.id,
      xy: f.xy,
      nonce: Date.now(),
    });
  };

  const onSelectList = (f) => {
    focusFeatureOnMap(f, "directory");
  };

  const onSelectSearchResult = (f) => {
    focusFeatureOnMap(f, "search");
  };

  const onSelectMarker = (f) => {
    focusFeatureOnMap(f, "marker");
  };

  const clearSearch = () => {
    setFilter("");
    setShowAllSearchResults(false);
    setIsSearchResultsOpen(false);
    setSelectedSearchResultId(null);
    setAnnounce("Search cleared");
  };

  const handleSearchChange = (value) => {
    setFilter(value);
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
        if (dims) {
          map.setView([dims.height / 2, dims.width / 2], map.getZoom());
        }
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
  }, [bounds, dims]);

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
            setFilter={handleSearchChange}
            onExport={exportJson}
            onDownloadCSV={downloadCSV}
            onImportClick={triggerImport}
            onClearSearch={clearSearch}
            hasActiveSearch={Boolean(trimmedFilter)}
            isSearchResultsOpen={isSearchResultsOpen}
            selectedSearchResult={selectedFeature || selectedSearchResult}
            searchResults={visibleSearchResults}
            totalSearchResults={rankedSearchResults.length}
            canShowMore={
              rankedSearchResults.length > DEFAULT_VISIBLE_RESULTS &&
              !showAllSearchResults &&
              isSearchResultsOpen
            }
            onShowAllResults={() => setShowAllSearchResults(true)}
            selected={selected}
            onSelectSearchResult={onSelectSearchResult}
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
                center={[dims.height / 2, dims.width / 2]}
                zoom={-0.5}
                maxBounds={bounds}
                maxZoom={3}
                minZoom={-2.5}
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
                  pendingFocusIdRef={pendingFocusIdRef}
                  setSelected={setSelected}
                />

                {features.map((f) => (
                  <Marker
                    key={f.id}
                    position={f.xy}
                    icon={getIcon(f.category, f, selected === f.id)}
                    draggable={isEdit}
                    eventHandlers={{
                      click: () => {
                        onSelectMarker(f);
                      },
                      dragend: (e) => onMarkerDrag(f.id, e),
                      popupopen: (e) => {
                        if (pendingFocusIdRef.current === f.id) {
                          e.target.closePopup();
                          return;
                        }

                        openPopupIdRef.current = f.id;
                        setSelected(f.id);
                      },
                      popupclose: () => {
                        if (openPopupIdRef.current === f.id) {
                          openPopupIdRef.current = null;
                        }

                        setSelected((prevSelected) =>
                          prevSelected === f.id ? null : prevSelected
                        );

                        setSelectedSearchResultId((prevId) =>
                          prevId === f.id ? null : prevId
                        );
                      },
                    }}
                    title={f.name}
                    ref={(ref) => {
                      if (ref) markerRefs.current[f.id] = ref;
                    }}
                  >
                    <Popup maxWidth={340} autoPan={false}>
                      <div className="popup">
                        {f.img ? (
                          <img
                            src={f.img}
                            alt={f.imgAlt || `${f.name} photo`}
                            className="popupImg"
                            width="220"
                            height="124"
                            loading="lazy"
                          />
                        ) : null}

                        <div className="popupTitle">{f.name}</div>

                        {f.desc && <div className="popupDesc">{f.desc}</div>}

                        <PopupArrival arrival={f.arrival} />
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
            {visibleDirectorySections.map((section) => {
              const items = filteredDirectoryItems.filter((f) =>
                section.categories.includes(f.category)
              );

              const isOpen = isDirectoryInSearchMode
                ? items.length > 0
                : openSections.includes(section.id);

              return (
                <div key={section.id}>
                  <button
                    className="accordionHeader"
                    onClick={() => {
                      if (!isDirectoryInSearchMode) toggleSection(section.id);
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`section-${section.id}`}
                    aria-disabled={isDirectoryInSearchMode ? "true" : undefined}
                    type="button"
                  >
                    <span>{section.label}</span>
                    <span aria-hidden="true">
                      {isDirectoryInSearchMode
                        ? items.length
                          ? "•"
                          : ""
                        : isOpen
                          ? "−"
                          : "+"}
                    </span>
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
                              type="button"
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
              Use search to directly find destinations and services, or use the
              directory accordion to browse locations by category. All buildings
              and landmarks are listed with names and descriptions. Keyboard:
              Tab/Shift+Tab to move through search, sections, and items; Enter
              to move the map to the selected item and open its popup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}