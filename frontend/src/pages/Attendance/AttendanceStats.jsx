export default function AttendanceStats({ stats, loading }) {
  const totalStudents = stats?.students || 0;
  const presentCount = stats?.present || 0;
  const absentCount = stats?.absent || 0;
  const attendanceRate =
    totalStudents > 0
      ? ((presentCount / totalStudents) * 100).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="attendance-stats-grid">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    );
  }

  return (
    <div className="attendance-stats-grid">
      {/* 1. Total Students */}
      <div className="att-stat-card">
        <div className="att-stat-content">
          <span className="att-stat-label">Total Students</span>
          <span className="att-stat-value">{totalStudents.toLocaleString()}</span>
          <span className="att-stat-hint">Active institution enrollment</span>
        </div>
        <div className="att-stat-icon student" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
      </div>

      {/* 2. Present Today */}
      <div className="att-stat-card">
        <div className="att-stat-content">
          <span className="att-stat-label">Present Today</span>
          <span className="att-stat-value text-green">
            {presentCount.toLocaleString()}
          </span>
          <span className="att-stat-hint">
            {attendanceRate}% of total students
          </span>
        </div>
        <div className="att-stat-icon present" aria-hidden="true">
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

      {/* 3. Absent Today */}
      <div className="att-stat-card">
        <div className="att-stat-content">
          <span className="att-stat-label">Absent Today</span>
          <span className="att-stat-value text-red">
            {absentCount.toLocaleString()}
          </span>
          <span className="att-stat-hint">Unverified or absent</span>
        </div>
        <div className="att-stat-icon absent" aria-hidden="true">
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
      <div className="att-stat-card">
        <div className="att-stat-content">
          <span className="att-stat-label">Attendance Rate</span>
          <span className="att-stat-value text-amber">{attendanceRate}%</span>
          <span className="att-stat-hint">Institutional threshold: 75%</span>
        </div>
        <div className="att-stat-icon rate" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
