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
            <div className="searchResults">
              <div className="searchResultsHeader">
                <span className="searchResultsTitle">
                  Top {searchResults.length} of {totalSearchResults} result
                  {totalSearchResults === 1 ? "" : "s"}
                </span>
              </div>

              <ul className="searchResultsList">
                {searchResults.map((feature) => (
                  <li key={feature.id}>
                    <button
                      type="button"
                      className={`searchResultItem ${selected === feature.id ? "isSel" : ""}`}
                      onClick={() => onSelectSearchResult(feature)}
                    >
                      <span className="searchResultName">{feature.name}</span>
                      <span className="searchResultMeta">
                        {feature.matchReason}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

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
          <button onClick={onAddPoint} className="btn" type="button">
            <Plus className="icon" /> Admin » Add point
          </button>

          <button onClick={onExport} className="btn" type="button">
            <Download className="icon" /> Export JSON
          </button>

          <button onClick={onDownloadCSV} className="btn" type="button">
            <Download className="icon" /> Download CSV
          </button>

          <button onClick={onImportClick} className="btn" type="button">
            <Download className="icon" /> Import CSV
          </button>
        </div>
      )}
    </div>
  );
}