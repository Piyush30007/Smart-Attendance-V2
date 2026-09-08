import { useState } from "react";

export default function RecentAttendanceTable({ records = [], isDemoData = false }) {
  const [filter, setFilter] = useState("all");

  const filteredRecords = records.filter((rec) => {
    if (filter === "all") return true;
    return rec.status?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="dashboard-card recent-attendance-card">
      <div className="card-header-bar">
        <div className="header-title-group">
          <div className="title-with-pill">
            <h2 className="card-heading">Recent Attendance Activity</h2>
            {isDemoData && (
              <span className="demo-data-badge" title="Live database records will replace this automatically">
                Sample Preview
              </span>
            )}
          </div>
          <p className="card-subheading">Latest verified student check-ins</p>
        </div>

        {/* Filter controls */}
        <div className="filter-button-group" role="group" aria-label="Filter Attendance Status">
          <button
            type="button"
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "present" ? "active" : ""}`}
            onClick={() => setFilter("present")}
          >
            Present
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "absent" ? "active" : ""}`}
            onClick={() => setFilter("absent")}
          >
            Absent
          </button>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="recent-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject / Course</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-table-cell">
                  <div className="empty-state-mini">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>No attendance records found matching this filter</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((row) => {
                const isPresent = row.status?.toLowerCase() === "present";
                const initials = row.studentName
                  ? row.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "ST";

                return (
                  <tr key={row.id}>
                    <td>
                      <div className="student-cell">
                        <div
                          className="student-avatar"
                          style={{
                            background: isPresent
                              ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                              : "linear-gradient(135deg, #f43f5e, #be123c)",
                          }}
                          aria-hidden="true"
                        >
                          {initials}
                        </div>
                        <div className="student-details">
                          <span className="student-name">{row.studentName}</span>
                          <span className="student-code">{row.studentCode || `ID #${row.id}`}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="subject-text">{row.subject || "General"}</span>
                    </td>

                    <td>
                      <div className="datetime-cell">
                        <span className="date-text">{row.date}</span>
                        {row.time && <span className="time-text">{row.time}</span>}
                      </div>
                    </td>

                    <td>
                      <span className={`status-pill ${isPresent ? "present" : "absent"}`}>
                        <span className={`status-dot ${isPresent ? "present" : "absent"}`}></span>
                        {row.status}
                      </span>
                    </td>

                    <td>
                      {row.confidenceScore ? (
                        <span className="confidence-badge" title="Facial Recognition Confidence">
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <span>{row.confidenceScore}</span>
                        </span>
                      ) : (
                        <span className="manual-badge">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
