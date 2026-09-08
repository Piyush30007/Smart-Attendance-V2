import { useAuth } from "../../contexts/AuthContext";

export default function DashboardHeader({ onRefresh, refreshing }) {
  const { user } = useAuth();

  // Safely extract user name or fallback
  const displayName =
    user?.username ||
    user?.sub ||
    (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Administrator");

  // Format today's date
  const todayDateString = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="dashboard-header">
      <div className="header-greeting-section">
        <h1 className="header-title">Hello, {displayName}</h1>
        <p className="header-subtitle">
          Here is your real-time attendance overview and campus analytics for today.
        </p>
      </div>

      <div className="header-meta-section">
        <div className="header-date-badge" title="Current Date">
          <svg
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{todayDateString}</span>
        </div>

        <div className="header-status-pill" title="Live Face Sync Status">
          <span className="live-pulse-dot" aria-hidden="true"></span>
          <span>Live Sync Active</span>
        </div>

        {onRefresh && (
          <button
            type="button"
            className={`btn-refresh ${refreshing ? "spinning" : ""}`}
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Dashboard Data"
            aria-label="Refresh Dashboard Data"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
