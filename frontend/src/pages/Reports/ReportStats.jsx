export default function ReportStats({
  totalRecords = 0,
  presentCount = 0,
  absentCount = 0,
  attendanceRate = "0.0",
  uniqueStudentsCount = 0,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="report-stats-grid">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    );
  }

  return (
    <div className="report-stats-grid">
      {/* 1. Total Records */}
      <div className="rep-stat-card">
        <div className="rep-stat-info">
          <span className="rep-stat-label">Total Logged Records</span>
          <span className="rep-stat-val">{totalRecords.toLocaleString()}</span>
          <span className="rep-stat-sub">
            Across {uniqueStudentsCount} unique students
          </span>
        </div>
        <div className="rep-stat-icon total" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
      </div>

      {/* 2. Present Count */}
      <div className="rep-stat-card">
        <div className="rep-stat-info">
          <span className="rep-stat-label">Verified Present</span>
          <span className="rep-stat-val text-green">
            {presentCount.toLocaleString()}
          </span>
          <span className="rep-stat-sub">Confirmed biometric check-ins</span>
        </div>
        <div className="rep-stat-icon present" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      {/* 3. Absent Count */}
      <div className="rep-stat-card">
        <div className="rep-stat-info">
          <span className="rep-stat-label">Recorded Absent</span>
          <span className="rep-stat-val text-red">
            {absentCount.toLocaleString()}
          </span>
          <span className="rep-stat-sub">Unverified or missed sessions</span>
        </div>
        <div className="rep-stat-icon absent" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
      </div>

      {/* 4. Overall Attendance % */}
      <div className="rep-stat-card">
        <div className="rep-stat-info">
          <span className="rep-stat-label">Attendance Rate</span>
          <span className="rep-stat-val text-blue">{attendanceRate}%</span>
          <span className="rep-stat-sub">For selected date range</span>
        </div>
        <div className="rep-stat-icon rate" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
      </div>
    </div>
  );
}
