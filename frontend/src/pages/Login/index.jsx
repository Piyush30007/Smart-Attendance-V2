import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, googleLogin, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect to Dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and Password are required.");
      return;
    }

    setLoading(true);

    const result = await login(username.trim(), password);

    setLoading(false);

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.message);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError("");

    if (!credentialResponse?.credential) {
      setError("Google login failed. No credential received.");
      return;
    }

    setGoogleLoading(true);

    const result = await googleLogin(
      credentialResponse.credential
    );

    setGoogleLoading(false);

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.message);
    }
  }

  function handleGoogleError() {
    setGoogleLoading(false);
    setError("Google login failed. Please try again.");
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Smart Attendance</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading || googleLoading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div
          style={{
            margin: "20px 0",
            textAlign: "center",
          }}
        >
          <p>OR</p>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        {googleLoading && (
          <p>Logging in with Google...</p>
        )}
      </form>
    </div>
  );
}

export default Login;