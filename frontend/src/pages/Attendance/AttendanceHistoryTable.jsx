import { useState, useMemo } from "react";
import DataTable from "../../components/tables/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AttendanceHistoryTable({
  records = [],
  studentMap = {},
  loading = false,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Map and filter records
  const processedRecords = useMemo(() => {
    return records.map((rec) => {
      const student = studentMap[rec.student_id];
      return {
        id: rec.id,
        student_id: rec.student_id,
        student_name: student?.name || `Student #${rec.student_id}`,
        student_code: student?.student_code || `ST-${rec.student_id}`,
        course: student?.course || "General",
        date: rec.date,
        check_in_time: rec.check_in_time
          ? new Date(rec.check_in_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
        status: rec.status,
        confidence_score: rec.confidence_score,
      };
    });
  }, [records, studentMap]);

  const filteredRecords = useMemo(() => {
    return processedRecords.filter((rec) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        rec.student_name.toLowerCase().includes(query) ||
        rec.student_code.toLowerCase().includes(query) ||
        rec.course.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        rec.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesDate = !dateFilter || rec.date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [processedRecords, search, statusFilter, dateFilter]);

  const columns = [
    {
      key: "id",
      label: "Log ID",
      render: (row) => <span className="code-pill">#{row.id}</span>,
    },
    {
      key: "student_name",
      label: "Student",
      render: (row) => {
        const initials = row.student_name
          ? row.student_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "ST";

        return (
          <div className="person-name-cell">
            <div className="person-avatar student" aria-hidden="true">
              {initials}
            </div>
            <div className="person-meta">
              <span className="person-name">{row.student_name}</span>
              <span className="person-sub">{row.course}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "student_code",
      label: "Student Code",
      render: (row) => <span className="student-code-tag">{row.student_code}</span>,
    },
    {
      key: "date",
      label: "Date & Time",
      render: (row) => (
        <div className="datetime-cell">
          <span className="date-text">{row.date}</span>
          <span className="time-text">{row.check_in_time}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const isPresent = row.status?.toLowerCase() === "present";
        return (
          <span className={`status-pill ${isPresent ? "present" : "absent"}`}>
            <span className={`status-dot ${isPresent ? "present" : "absent"}`} />
            {row.status ? row.status.toUpperCase() : "RECORDED"}
          </span>
        );
      },
    },
    {
      key: "confidence_score",
      label: "Verification Score",
      render: (row) => (
        <span className="confidence-score-badge">
          {row.confidence_score !== null && row.confidence_score !== undefined
            ? `Score: ${row.confidence_score}`
            : "Standard"}
        </span>
      ),
    },
  ];

  return (
    <div className="attendance-history-section">
      {/* Header & Controls Bar */}
      <div className="history-toolbar">
        <div className="history-search-box">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, code, or course..."
              aria-label="Search attendance records"
            />
          </div>
        </div>

        <div className="history-filters-group">
          {/* Status Filter */}
          <div className="filter-button-group" role="group" aria-label="Filter status">
            <button
              type="button"
              className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-btn ${statusFilter === "present" ? "active" : ""}`}
              onClick={() => setStatusFilter("present")}
            >
              Present
            </button>
            <button
              type="button"
              className={`filter-btn ${statusFilter === "absent" ? "active" : ""}`}
              onClick={() => setStatusFilter("absent")}
            >
              Absent
            </button>
          </div>

          {/* Date Filter Input */}
          <input
            type="date"
            className="filter-date-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Filter by specific date"
            aria-label="Filter by date"
          />

          {dateFilter && (
            <button
              type="button"
              className="btn-clear-date"
              onClick={() => setDateFilter("")}
              title="Clear date filter"
            >
              Clear Date
            </button>
          )}

          {/* Refresh Action */}
          {onRefresh && (
            <button
              type="button"
              className="btn-refresh-history"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh records"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={loading ? "spinning" : ""}
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Record Counter */}
      <div className="history-meta-bar">
        <span>
          Showing <strong>{filteredRecords.length}</strong> of{" "}
          {processedRecords.length} total attendance records
        </span>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="page-loading-state">
          <LoadingSpinner />
          <p>Loading attendance database records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        /* Empty State */
        <div className="attendance-empty-container">
          <div className="empty-state-icon-circle" aria-hidden="true">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          <h4 className="empty-title">No Attendance Records Found</h4>
          <p className="empty-description">
            {search || statusFilter !== "all" || dateFilter
              ? "No attendance check-ins match your active filters. Try adjusting your search criteria."
              : "Attendance records will appear here after students are marked present via the terminal scanner."}
          </p>
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <DataTable columns={columns} data={filteredRecords} />
        </div>
      )}
    </div>
  );
}
