// src/components/Controls.jsx
import { Search, Download, Plus, X } from "lucide-react";

export default function Controls({
  isEdit,
  onAddPoint,
  filter,
  setFilter,
  onExport,
  onImportClick,
  onDownloadCSV,
  onClearSearch,
  hasActiveSearch,
  searchResults,
  totalSearchResults,
  canShowMore,
  onShowAllResults,
  selected,
  onSelectSearchResult,
}) {
  const isSingleResult = totalSearchResults === 1;

  return (
    <div className="controls" role="group" aria-label="Map and data controls">
      <div className="searchWrap">
        <div className="searchBlock">
          <label className="search" htmlFor="map-search">
            <Search className="icon" aria-hidden="true" />
            <span className="sr-only">Search campus locations</span>
            <input
              id="map-search"
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search buildings, services, destinations…"
              autoComplete="off"
            />
            {hasActiveSearch && (
              <button
                type="button"
                className="searchClear"
                onClick={onClearSearch}
                aria-label="Clear search"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </label>

          {hasActiveSearch && (
            <div
              className={`searchResults ${isSingleResult ? "isCompact" : ""}`}
              role="region"
              aria-label="Search results"
            >
              <div className="searchResultsHeader">
                <span className="searchResultsTitle">
                  {isSingleResult ? "Best match" : `${totalSearchResults} results`}
                </span>
              </div>

              {searchResults.length ? (
                <ul className="searchResultsList">
                  {searchResults.map((feature) => (
                    <li key={feature.id}>
                      <button
                        type="button"
                        className={`searchResultItem ${selected === feature.id ? "isSel" : ""} ${
                          isSingleResult ? "isCompact" : ""
                        }`}
                        onClick={() => onSelectSearchResult(feature)}
                        aria-label={`Open ${feature.name} on map`}
                      >
                        <span className="searchResultName">{feature.name}</span>
                        <span className="searchResultMeta">
                          {feature.matchReason}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="searchNoResults">
                  No matching destinations found.
                </div>
              )}

              {canShowMore && (
                <button
                  type="button"
                  className="showMoreResults"
                  onClick={onShowAllResults}
                >
                  Show all {totalSearchResults} results
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isEdit && (
        <div className="editorActions">
          <button
            onClick={onAddPoint}
            className="btn"
            aria-label="Admin: Add point"
            type="button"
          >
            <Plus className="icon" /> Admin » Add point
          </button>

          <button
            onClick={onExport}
            className="btn"
            aria-label="Export points JSON"
            type="button"
          >
            <Download className="icon" /> Export JSON
          </button>

          <button
            onClick={onDownloadCSV}
            className="btn"
            aria-label="Download CSV template"
            type="button"
          >
            <Download className="icon" /> Download CSV
          </button>

          <button
            onClick={onImportClick}
            className="btn"
            aria-label="Import CSV of points"
            type="button"
          >
            <Download className="icon" /> Import CSV
          </button>
        </div>
      )}
    </div>
  );
}