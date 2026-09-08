import { useState, useMemo } from "react";
import DataTable from "../../components/tables/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function ReportTable({
  records = [],
  studentMap = {},
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"

  // Process rows with student lookup
  const rows = useMemo(() => {
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

  // Filter & Sort
  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          row.student_name.toLowerCase().includes(query) ||
          row.student_code.toLowerCase().includes(query) ||
          row.course.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          row.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === "desc") {
          return b.date.localeCompare(a.date);
        }
        return a.date.localeCompare(b.date);
      });
  }, [rows, search, statusFilter, sortOrder]);

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
    <div className="report-table-card">
      <div className="table-toolbar-bar">
        <div className="search-input-wrapper" style={{ maxWidth: "380px" }}>
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
            placeholder="Search report by student name, code, or course..."
            aria-label="Search report records"
          />
        </div>

        <div className="table-controls-right">
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

          {/* Sort Toggle */}
          <button
            type="button"
            className="btn-sort-toggle"
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            title={`Sort Date: currently ${sortOrder === "desc" ? "Newest First" : "Oldest First"}`}
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
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
          </button>
        </div>
      </div>

      <div className="history-meta-bar" style={{ marginBottom: "12px" }}>
        <span>
          Showing <strong>{filteredRows.length}</strong> of {rows.length} records
        </span>
      </div>

      {loading ? (
        <div className="page-loading-state">
          <LoadingSpinner />
          <p>Compiling attendance report records...</p>
        </div>
      ) : filteredRows.length === 0 ? (
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
            </svg>
          </div>
          <h4 className="empty-title">No Attendance Records Found</h4>
          <p className="empty-description">
            No attendance records match your active date range or search filter.
            Try picking a broader date range or adjusting search keywords.
          </p>
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <DataTable columns={columns} data={filteredRows} />
        </div>
      )}
    </div>
  );
}
