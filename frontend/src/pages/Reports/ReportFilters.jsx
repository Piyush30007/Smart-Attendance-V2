export default function ReportFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetSelect,
  activePreset,
  onGenerate,
  onExport,
  loading,
  exporting,
  validationError,
}) {
  return (
    <div className="report-filters-card">
      <div className="filters-top-row">
        {/* Preset Chips */}
        <div className="preset-chips-group" role="group" aria-label="Date Range Presets">
          <button
            type="button"
            className={`preset-chip ${activePreset === "today" ? "active" : ""}`}
            onClick={() => onPresetSelect("today")}
            disabled={loading}
          >
            Today
          </button>
          <button
            type="button"
            className={`preset-chip ${activePreset === "7days" ? "active" : ""}`}
            onClick={() => onPresetSelect("7days")}
            disabled={loading}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            className={`preset-chip ${activePreset === "30days" ? "active" : ""}`}
            onClick={() => onPresetSelect("30days")}
            disabled={loading}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className={`preset-chip ${activePreset === "thisMonth" ? "active" : ""}`}
            onClick={() => onPresetSelect("thisMonth")}
            disabled={loading}
          >
            This Month
          </button>
        </div>

        {/* Export CSV Action */}
        <button
          type="button"
          className="btn-export-csv"
          onClick={onExport}
          disabled={loading || exporting}
          title="Download attendance report as CSV"
        >
          {exporting ? (
            <span className="btn-loading-content">
              <span className="btn-spinner" aria-hidden="true" />
              <span>Exporting CSV...</span>
            </span>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export CSV</span>
            </>
          )}
        </button>
      </div>

      {/* Date Pickers Bar */}
      <div className="filters-bottom-row">
        <div className="date-input-group">
          <label htmlFor="report-start-date" className="date-input-label">
            Start Date
          </label>
          <input
            id="report-start-date"
            type="date"
            className={`report-date-field ${validationError ? "has-error" : ""}`}
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="date-input-group">
          <label htmlFor="report-end-date" className="date-input-label">
            End Date
          </label>
          <input
            id="report-end-date"
            type="date"
            className={`report-date-field ${validationError ? "has-error" : ""}`}
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button
          type="button"
          className="btn-generate-report"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? (
            <span className="btn-loading-content">
              <span className="btn-spinner" aria-hidden="true" />
              <span>Generating...</span>
            </span>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Generate Report</span>
            </>
          )}
        </button>
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="date-validation-alert" role="alert">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
