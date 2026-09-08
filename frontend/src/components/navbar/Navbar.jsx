import { useAuth } from "../../contexts/AuthContext";

export default function Navbar({ onToggleSidebar }) {
  const { user, role, isAuthenticated, logout } = useAuth();

  const displayName = user?.username || user?.sub || "User";
  const displayRole = role || user?.role || "user";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="nav-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
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
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="navbar-brand">
          <span className="brand-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
              <path d="M4 19a7 7 0 0 1 14 0" />
              <path d="M3 3h4v4" />
              <path d="M21 3h-4v4" />
              <path d="M3 21h4v-4" />
              <path d="M21 21h-4v-4" />
            </svg>
          </span>
          <span className="brand-title">Smart Attendance</span>
        </div>
      </div>

      <div className="navbar-right">
        {isAuthenticated && (
          <div className="nav-user-section">
            <div className="user-profile-chip">
              <div className="user-avatar">{initial}</div>
              <div className="user-meta">
                <span className="user-name">{displayName}</span>
                <span className={`user-role-badge role-${displayRole.toLowerCase()}`}>
                  {displayRole.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-logout"
              onClick={logout}
              title="Sign Out"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
