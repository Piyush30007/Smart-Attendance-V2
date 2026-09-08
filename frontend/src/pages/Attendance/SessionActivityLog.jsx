export default function SessionActivityLog({ logs = [] }) {
  return (
    <div className="session-activity-card">
      <div className="activity-card-header">
        <div className="activity-title-group">
          <h4 className="activity-title">Live Session Log</h4>
          <p className="activity-subtitle">Students checked in during this terminal session</p>
        </div>
        <span className="session-count-badge">{logs.length} Marked</span>
      </div>

      {logs.length === 0 ? (
        <div className="session-empty-state">
          <div className="empty-state-icon" aria-hidden="true">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="empty-text">No scans recorded in this session yet.</p>
          <span className="empty-subtext">
            Mark attendance above or enable Auto-Scan to start logging.
          </span>
        </div>
      ) : (
        <div className="session-logs-list">
          {logs.map((log) => {
            const initials = log.student_name
              ? log.student_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "ST";

            const isAlreadyMarked = Boolean(log.already_marked);

            return (
              <div key={log.id} className="session-log-item">
                <div
                  className={`session-avatar ${isAlreadyMarked ? "warning" : "success"}`}
                  aria-hidden="true"
                >
                  {initials}
                </div>

                <div className="session-log-info">
                  <div className="session-log-name-row">
                    <span className="session-name">{log.student_name}</span>
                    <span className="session-code">({log.student_code})</span>
                  </div>

                  <div className="session-meta-row">
                    {log.course && <span>{log.course}</span>}
                    {log.course && <span>•</span>}
                    <span>{log.time}</span>
                    {log.confidence_score !== null &&
                      log.confidence_score !== undefined && (
                        <>
                          <span>•</span>
                          <span className="session-score">
                            Match score: {log.confidence_score}
                          </span>
                        </>
                      )}
                  </div>
                </div>

                <div className="session-status-badge">
                  <span className={`status-pill ${isAlreadyMarked ? "absent" : "present"}`}>
                    <span className={`status-dot ${isAlreadyMarked ? "absent" : "present"}`} />
                    {isAlreadyMarked ? "Checked-in" : "Present"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
