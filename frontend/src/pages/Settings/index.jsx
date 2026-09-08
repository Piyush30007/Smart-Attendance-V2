import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import teacherService from "../../services/teacherService";

import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import "./Settings.css";

const PREF_STORAGE_KEY = "smart_attendance_terminal_preferences";

const DEFAULT_PREFERENCES = {
  matchThreshold: "0.80",
  autoScanInterval: "3000",
  audioFeedback: true,
  defaultCamera: "user",
};

export default function Settings() {
  const { user, role, logout } = useAuth();

  // Toast feedback
  const [toast, setToast] = useState(null);

  // Teacher details (if logged in user is a faculty member)
  const [teacherProfile, setTeacherProfile] = useState(null);

  // System telemetry from real /health endpoint
  const [healthInfo, setHealthInfo] = useState({
    status: "checking...",
    env: "unknown",
  });

  // Terminal preferences
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(PREF_STORAGE_KEY);
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [savingPrefs, setSavingPrefs] = useState(false);

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    isDanger: true,
    action: null,
  });

  // Fetch telemetry & teacher details if applicable
  const fetchSettingsData = useCallback(async () => {
    // 1. Fetch live system health
    try {
      const { data } = await api.get("/health");
      setHealthInfo({
        status: data.status || "ok",
        env: data.env || "development",
      });
    } catch {
      setHealthInfo({
        status: "offline",
        env: "unknown",
      });
    }

    // 2. Fetch teacher profile if applicable
    if (role === "teacher" && user?.username) {
      try {
        const { data } = await teacherService.list();
        const list = data.teachers || data || [];
        const match = list.find(
          (t) =>
            t.username?.toLowerCase() === user.username.toLowerCase() ||
            t.email?.toLowerCase() === user.username.toLowerCase() ||
            String(t.id) === String(user.sub)
        );
        if (match) {
          setTeacherProfile(match);
        }
      } catch (err) {
        console.warn("Could not load teacher profile:", err);
      }
    }
  }, [role, user]);

  useEffect(() => {
    fetchSettingsData();
  }, [fetchSettingsData]);

  // Handle preference input changes
  const handlePrefChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save preferences to localStorage
  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(preferences));
      setTimeout(() => {
        setSavingPrefs(false);
        setToast({
          type: "success",
          message: "Attendance terminal preferences saved successfully.",
        });
      }, 250);
    } catch {
      setSavingPrefs(false);
      setToast({
        type: "error",
        message: "Failed to save preferences to browser storage.",
      });
    }
  };

  // Trigger reset preferences confirmation
  const handlePromptResetPrefs = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Terminal Preferences",
      message:
        "Are you sure you want to reset all attendance terminal preferences to institutional factory defaults?",
      confirmText: "Reset Defaults",
      isDanger: true,
      action: () => {
        localStorage.removeItem(PREF_STORAGE_KEY);
        setPreferences(DEFAULT_PREFERENCES);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({
          type: "success",
          message: "Terminal preferences have been reset to defaults.",
        });
      },
    });
  };

  // Trigger logout confirmation
  const handlePromptLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: "Sign Out of Current Session",
      message:
        "Are you sure you want to end your active session? You will be redirected to the login terminal.",
      confirmText: "Sign Out",
      isDanger: true,
      action: () => {
        logout();
      },
    });
  };

  const usernameDisplay = user?.username || "Authenticated User";
  const userInitials = usernameDisplay
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="settings-page">
      {/* Toast Feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="System Settings"
        subtitle="Manage user account details, biometric terminal preferences, and institutional telemetry."
      />

      <div className="settings-grid">
        {/* SECTION 1: ACCOUNT & IDENTITY PROFILE */}
        <section className="settings-card" aria-labelledby="section-account-title">
          <div className="settings-card-header">
            <div className="settings-card-title-group">
              <h2 id="section-account-title" className="settings-card-title">
                Account &amp; Identity Profile
              </h2>
              <p className="settings-card-description">
                Active session identity and institutional role privileges.
              </p>
            </div>
            <span className={`role-chip ${role === "admin" ? "admin" : "teacher"}`}>
              {role === "admin" ? "Administrator" : "Faculty / Teacher"}
            </span>
          </div>

          <div className="profile-overview-row">
            <div className="profile-avatar-large" aria-hidden="true">
              {userInitials}
            </div>

            <div className="profile-meta-details">
              <span className="profile-username">
                {teacherProfile?.name || usernameDisplay}
              </span>
              <div className="profile-badge-row">
                <span className="session-status-chip">
                  <span className="status-dot-green" />
                  Active Institutional Session
                </span>
                {teacherProfile?.teacher_code && (
                  <span className="code-pill">#{teacherProfile.teacher_code}</span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-fields-grid">
            <div className="profile-readonly-field">
              <span className="profile-field-label">Username / Login ID</span>
              <span className="profile-field-value">{usernameDisplay}</span>
            </div>

            <div className="profile-readonly-field">
              <span className="profile-field-label">User Reference ID (SUB)</span>
              <span className="profile-field-value">{user?.sub || "1"}</span>
            </div>

            <div className="profile-readonly-field">
              <span className="profile-field-label">Department / Faculty</span>
              <span className="profile-field-value">
                {teacherProfile?.department || (role === "admin" ? "Administration" : "Academics")}
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 2: ATTENDANCE TERMINAL PREFERENCES */}
        <section className="settings-card" aria-labelledby="section-terminal-title">
          <div className="settings-card-header">
            <div className="settings-card-title-group">
              <h2 id="section-terminal-title" className="settings-card-title">
                Attendance Terminal Configuration
              </h2>
              <p className="settings-card-description">
                Customize local camera behavior, scanning frequency, and facial match confidence thresholds.
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences}>
            <div className="preferences-form-grid">
              {/* Match Threshold */}
              <div className="pref-control-group">
                <label htmlFor="pref-threshold" className="pref-label">
                  Biometric Match Confidence Threshold
                </label>
                <select
                  id="pref-threshold"
                  value={preferences.matchThreshold}
                  onChange={(e) => handlePrefChange("matchThreshold", e.target.value)}
                  className="pref-select"
                >
                  <option value="0.75">Relaxed (0.75) — Higher tolerance for lighting variations</option>
                  <option value="0.80">Standard (0.80) — Recommended institutional baseline</option>
                  <option value="0.85">High Confidence (0.85) — Enhanced precision</option>
                  <option value="0.90">Strict Verification (0.90) — Maximum security threshold</option>
                </select>
                <span className="pref-helper">
                  Specifies minimum cosine similarity required for biometric check-in confirmation.
                </span>
              </div>

              {/* Auto Scan Interval */}
              <div className="pref-control-group">
                <label htmlFor="pref-interval" className="pref-label">
                  Continuous Auto-Scan Frequency
                </label>
                <select
                  id="pref-interval"
                  value={preferences.autoScanInterval}
                  onChange={(e) => handlePrefChange("autoScanInterval", e.target.value)}
                  className="pref-select"
                >
                  <option value="0">Manual Capture Only (Auto-scan disabled)</option>
                  <option value="2000">Rapid Continuous (Every 2 seconds)</option>
                  <option value="3000">Standard Interval (Every 3 seconds)</option>
                  <option value="5000">Relaxed Interval (Every 5 seconds)</option>
                </select>
                <span className="pref-helper">
                  Frequency of video frame extraction sent to facial verification pipeline when auto-scan is active.
                </span>
              </div>

              {/* Camera Selection */}
              <div className="pref-control-group">
                <label htmlFor="pref-camera" className="pref-label">
                  Default Optical Sensor / Camera
                </label>
                <select
                  id="pref-camera"
                  value={preferences.defaultCamera}
                  onChange={(e) => handlePrefChange("defaultCamera", e.target.value)}
                  className="pref-select"
                >
                  <option value="user">Front-Facing Camera (User / Kiosk mode)</option>
                  <option value="environment">Rear / Classroom Camera (Environment mode)</option>
                </select>
                <span className="pref-helper">
                  Preferred video input feed selected when opening the live attendance terminal.
                </span>
              </div>

              {/* Audio Feedback */}
              <div className="pref-control-group">
                <label className="pref-label">Acoustic Feedback</label>
                <label htmlFor="pref-audio" className="pref-checkbox-row">
                  <input
                    id="pref-audio"
                    type="checkbox"
                    checked={preferences.audioFeedback}
                    onChange={(e) => handlePrefChange("audioFeedback", e.target.checked)}
                    className="pref-checkbox"
                  />
                  <div>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b" }}>
                      Audio Chime on Verified Match
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "#64748b" }}>
                      Plays an audible confirmation beep when an authorized student check-in is logged.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary" disabled={savingPrefs}>
                {savingPrefs ? (
                  <span className="btn-loading-content">
                    <span className="btn-spinner" aria-hidden="true" />
                    <span>Saving Preferences...</span>
                  </span>
                ) : (
                  "Save Preferences"
                )}
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 3: SYSTEM ENVIRONMENT & TELEMETRY */}
        <section className="settings-card" aria-labelledby="section-telemetry-title">
          <div className="settings-card-header">
            <div className="settings-card-title-group">
              <h2 id="section-telemetry-title" className="settings-card-title">
                System Environment &amp; Telemetry
              </h2>
              <p className="settings-card-description">
                Real-time API health diagnostics and institutional backend infrastructure.
              </p>
            </div>
          </div>

          <div className="telemetry-grid">
            <div className="telemetry-item">
              <span className="telemetry-label">FastAPI Backend Health</span>
              <div className="telemetry-value-row">
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: healthInfo.status === "ok" ? "#10b981" : "#ef4444",
                  }}
                />
                <span>{healthInfo.status === "ok" ? "Operational (200 OK)" : "Disconnected"}</span>
              </div>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">Environment Mode</span>
              <div className="telemetry-value-row">
                <span className="status-badge-healthy">
                  {healthInfo.env.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">Platform Version</span>
              <div className="telemetry-value-row">
                <span>v2.0.0 (Production)</span>
              </div>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">Biometric Recognition Model</span>
              <div className="telemetry-value-row">
                <span>InsightFace (ArcFace 512-d)</span>
              </div>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">Face Detection &amp; Liveness</span>
              <div className="telemetry-value-row">
                <span>SCRFD + Multi-Frame Anti-Spoof</span>
              </div>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">Database Architecture</span>
              <div className="telemetry-value-row">
                <span>PostgreSQL (SQLAlchemy Engine)</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DANGER ZONE */}
        <section className="settings-card danger-zone" aria-labelledby="section-danger-title">
          <div className="settings-card-header">
            <div className="settings-card-title-group">
              <h2 id="section-danger-title" className="settings-card-title danger-zone-title">
                Session &amp; Terminal Maintenance
              </h2>
              <p className="settings-card-description">
                Destructive operations affecting local cache, terminal preferences, and active credentials.
              </p>
            </div>
          </div>

          <div className="danger-actions-list">
            <div className="danger-action-item">
              <div className="danger-action-info">
                <span className="danger-action-title">Reset Terminal Preferences</span>
                <span className="danger-action-desc">
                  Restores local camera options, confidence strictness, and auto-scan frequency to system defaults.
                </span>
              </div>
              <button
                type="button"
                className="btn-danger-outline"
                onClick={handlePromptResetPrefs}
              >
                Reset Preferences
              </button>
            </div>

            <div className="danger-action-item">
              <div className="danger-action-info">
                <span className="danger-action-title">Terminate Active Session</span>
                <span className="danger-action-desc">
                  Safely clears your JWT authentication token from browser storage and logs you out immediately.
                </span>
              </div>
              <button
                type="button"
                className="btn-danger-outline"
                onClick={handlePromptLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.action}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
