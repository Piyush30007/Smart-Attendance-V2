import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login, signup, googleLogin, isAuthenticated } = useAuth();

  // Mode: "login" or "signup" (default to "login" for immediate usability)
  const [mode, setMode] = useState("login");

  // Role: "student", "teacher", or "admin"
  const [role, setRole] = useState("student");

  // Form fields
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Switch between Login and Signup modes
  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError("");
    setSuccessMessage("");
    if (newMode === "signup" && !role) {
      setRole("student");
    }
  };

  // Switch role during signup
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setInviteCode("");
    setError("");
  };

  // Manual Login / Signup
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (mode === "signup" && !role) {
      setError("Please select your role.");
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError("Username and Password are required.");
      return;
    }

    if (mode === "signup" && !email.trim()) {
      setError("Email address is required.");
      return;
    }

    // Signup for Teacher or Admin requires an invitation code
    if (
      mode === "signup" &&
      (role === "teacher" || role === "admin") &&
      !inviteCode.trim()
    ) {
      setError(
        `Please enter the ${role.charAt(0).toUpperCase() + role.slice(1)} invitation code.`
      );
      return;
    }

    setLoading(true);
    let result;

    if (mode === "login") {
      result = await login(username.trim(), password);
    } else {
      result = await signup({
        username: username.trim(),
        email: email.trim(),
        password: password,
        role: role,
        invite_code: inviteCode.trim(),
      });
    }

    setLoading(false);

    if (result.success) {
      if (mode === "signup") {
        setSuccessMessage("Account created successfully! Please sign in with your credentials.");
        setMode("login");
        setPassword("");
        setInviteCode("");
        return;
      }
      navigate("/", { replace: true });
    } else {
      setError(result.message || "Authentication failed. Please check your credentials.");
    }
  }

  // Google OAuth Login / Signup
  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    setSuccessMessage("");

    if (!credentialResponse?.credential) {
      setError("Google authentication failed. No credential received.");
      return;
    }

    if (mode === "signup" && !role) {
      setError("Please select your role first.");
      return;
    }

    if (
      mode === "signup" &&
      (role === "teacher" || role === "admin") &&
      !inviteCode.trim()
    ) {
      setError(
        `Please enter the ${role.charAt(0).toUpperCase() + role.slice(1)} invitation code.`
      );
      return;
    }

    setGoogleLoading(true);

    let result;
    if (mode === "login") {
      result = await googleLogin(
        credentialResponse.credential,
        null,
        "",
        "login"
      );
    } else {
      result = await googleLogin(
        credentialResponse.credential,
        role,
        inviteCode.trim(),
        "signup"
      );
    }

    setGoogleLoading(false);

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.message || "Google authentication failed.");
    }
  }

  function handleGoogleError() {
    setGoogleLoading(false);
    setError("Google authentication was unsuccessful. Please try again.");
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-badge" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1 className="auth-title">Smart Attendance</h1>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Sign in with your credentials to access the portal"
              : "Create an account to access attendance services"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs" role="tablist" aria-label="Authentication Options">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => handleModeChange("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => handleModeChange("signup")}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="auth-alert error" role="alert">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success" role="status">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Role Selection Grid (Signup only) */}
        {mode === "signup" && (
          <div className="role-selector-container">
            <label className="input-label" id="role-select-label">
              Select Your Role
            </label>
            <div
              className="role-grid"
              role="radiogroup"
              aria-labelledby="role-select-label"
            >
              <button
                type="button"
                role="radio"
                aria-checked={role === "student"}
                className={`role-option ${role === "student" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("student")}
              >
                <span className="role-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </span>
                <span className="role-text">Student</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={role === "teacher"}
                className={`role-option ${role === "teacher" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("teacher")}
              >
                <span className="role-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <span className="role-text">Teacher</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={role === "admin"}
                className={`role-option ${role === "admin" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("admin")}
              >
                <span className="role-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <span className="role-text">Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Authentication Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Invitation Code (Signup for Teacher/Admin only) */}
          {mode === "signup" && (role === "teacher" || role === "admin") && (
            <div className="form-group">
              <label className="input-label" htmlFor="auth-invite-code">
                {role.charAt(0).toUpperCase() + role.slice(1)} Invitation Code
              </label>
              <input
                id="auth-invite-code"
                type="password"
                placeholder={`Enter ${role} invitation code`}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          )}

          {/* Username / Identifier */}
          <div className="form-group">
            <label className="input-label" htmlFor="auth-username">
              {mode === "login" ? "Username or Email" : "Username"}
            </label>
            <input
              id="auth-username"
              type="text"
              placeholder={
                mode === "login"
                  ? "Enter your username or email"
                  : "Choose a username"
              }
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          {/* Email (Signup only) */}
          {mode === "signup" && (
            <div className="form-group">
              <label className="input-label" htmlFor="auth-email">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                placeholder="name@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label className="input-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              placeholder={
                mode === "login"
                  ? "Enter your password"
                  : "Create a secure password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="btn-spinner" aria-hidden="true"></span>
                <span>{mode === "login" ? "Signing In..." : "Creating Account..."}</span>
              </span>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider" aria-hidden="true">
          <span>OR CONTINUE WITH</span>
        </div>

        {/* Google Authentication */}
        <div className="google-auth-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        {googleLoading && (
          <p className="google-loading-text">
            <span className="btn-spinner inline" aria-hidden="true"></span>
            Authenticating with Google...
          </p>
        )}

        {/* Footer Security Assurance */}
        <div className="auth-footer">
          <svg
            className="security-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Enterprise Biometrics &amp; Secure Token Auth</span>
        </div>
      </div>
    </div>
  );
}

export default Login;