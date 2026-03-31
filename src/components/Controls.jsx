// src/components/Controls.jsx
import { Search, Download, Plus } from "lucide-react";

export default function Controls({
  isEdit,
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
      <label className="search" htmlFor="map-search">
        <Search className="icon" aria-hidden="true" />
        <span className="sr-only">Search campus locations</span>
      </label>

      <input
        id="map-search"
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search buildings, parking…"
      />

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
        <button className="btn zoomBtn" onClick={onZoomIn} aria-label="Zoom in" title="Zoom in">
          +
        </button>
        <button className="btn zoomBtn" onClick={onZoomOut} aria-label="Zoom out" title="Zoom out">
          −
        </button>
      </div>
    </div>
  );
}