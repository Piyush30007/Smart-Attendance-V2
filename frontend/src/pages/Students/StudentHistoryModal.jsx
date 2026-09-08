import { useState, useEffect } from "react";
import attendanceService from "../../services/attendanceService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DataTable from "../../components/tables/DataTable";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function StudentHistoryModal({ student, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch student's attendance records from real API GET /attendance?student_id={id}
  useEffect(() => {
    if (!student?.id) return;

    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await attendanceService.list(student.id);
        if (isMounted) {
          setRecords(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [student?.id]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Calculate real metrics
  const totalSessions = records.length;
  const presentCount = records.filter((r) => r.status?.toLowerCase() === "present").length;
  const absentCount = records.filter((r) => r.status?.toLowerCase() === "absent").length;
  const attendanceRate =
    totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : "0.0";

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) => <strong>{row.date}</strong>,
    },
    {
      key: "check_in_time",
      label: "Time",
      render: (row) => (
        <span>
          {row.check_in_time
            ? new Date(row.check_in_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Attendance Status",
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
      label: "Match Score",
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
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-history-title"
    >
      <div className="modal-card" style={{ maxWidth: "680px" }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-titles">
            <h3 id="student-history-title" className="modal-title">
              Attendance History
            </h3>
            <p className="modal-subtitle">
              {student.name} • <span className="code-pill">#{student.student_code}</span> •{" "}
              {student.course || "General Course"}
            </p>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ gap: "20px" }}>
          {/* Summary Mini-Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                Total Sessions
              </span>
              <p style={{ margin: "4px 0 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
                {totalSessions}
              </p>
            </div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 600 }}>
                Present
              </span>
              <p style={{ margin: "4px 0 0", fontSize: "1.3rem", fontWeight: 800, color: "#15803d" }}>
                {presentCount}
              </p>
            </div>

            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#991b1b", fontWeight: 600 }}>
                Absent
              </span>
              <p style={{ margin: "4px 0 0", fontSize: "1.3rem", fontWeight: 800, color: "#dc2626" }}>
                {absentCount}
              </p>
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#1e40af", fontWeight: 600 }}>
                Rate
              </span>
              <p style={{ margin: "4px 0 0", fontSize: "1.3rem", fontWeight: 800, color: "#2563eb" }}>
                {attendanceRate}%
              </p>
            </div>
          </div>

          {/* Body Content: Loading / Error / Empty / Table */}
          {loading ? (
            <div className="page-loading-state" style={{ padding: "32px 0" }}>
              <LoadingSpinner />
              <p>Fetching attendance history...</p>
            </div>
          ) : error ? (
            <div className="auth-alert error" role="alert">
              <span>{error}</span>
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <div className="empty-state-icon-circle" aria-hidden="true">
                <svg
                  width="28"
                  height="28"
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
              <h4 className="empty-title">No Attendance Records Yet</h4>
              <p className="empty-description">
                This student has not logged any attendance records at the live terminal yet.
              </p>
            </div>
          ) : (
            <div className="table-responsive-wrapper" style={{ maxHeight: "360px", overflowY: "auto" }}>
              <DataTable columns={columns} data={records} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
