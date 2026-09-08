import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const {
    login,
    signup,
    googleLogin,
    isAuthenticated,
  } = useAuth();

  // login or signup
  const [mode, setMode] = useState("");

  // student / teacher / admin
  const [role, setRole] = useState("");

  const [inviteCode, setInviteCode] = useState("");

  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");


  // Redirect if already authenticated

  useEffect(() => {

    if (isAuthenticated) {

      navigate("/", { replace: true });

    }

  }, [isAuthenticated, navigate]);


  // Select Login or Signup

  const handleModeSelect = (selectedMode) => {

    setMode(selectedMode);

    setRole("");

    setInviteCode("");

    setEmail("");

    setError("");

  };


  // Select role

  const handleRoleSelect = (selectedRole) => {

    setRole(selectedRole);

    setInviteCode("");

    setEmail("");

    setError("");

  };


  // Go back

  const handleBack = () => {

    if (role) {

      setRole("");

      setInviteCode("");

      setEmail("");

      setError("");

    } else if (mode) {

      setMode("");

      setEmail("");

      setError("");

    }

  };


  // Manual Login / Signup

  async function handleSubmit(e) {

    e.preventDefault();

    setError("");

    if (mode === "signup" && !role) {

      setError("Please select your role.");

      return;

    }

    if (!username.trim() || !password.trim()) {

      setError("Username and Password are required.");

      return;

    }

    if (mode === "signup" && !email.trim()) {

      setError("Email is required.");

      return;

    }


    // Signup for Teacher/Admin requires invite code

    if (
      mode === "signup" &&
      (role === "teacher" || role === "admin") &&
      !inviteCode.trim()
    ) {

      setError(
        `Please enter the ${role} invitation code.`
      );

      return;

    }


    setLoading(true);

    let result;

    if (mode === "login") {

      // Login existing user

      result = await login(
        username.trim(),
        password
      );

    } else {

      // Signup new user

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

        setError(
          "Account created successfully. Please login."
        );

        setMode("login");

        setRole("");

        setInviteCode("");

        setUsername("");

        setEmail("");

        setPassword("");

        return;

      }

      navigate("/", { replace: true });

    } else {

      setError(result.message);

    }

  }


  // Google Login

  async function handleGoogleSuccess(credentialResponse) {

    setError("");

    if (!credentialResponse?.credential) {

      setError("Google login failed. No credential received.");

      return;

    }


    // Role is required only during signup

    if (mode === "signup" && !role) {

      setError("Please select your role first.");

      return;

    }


    // Signup for Teacher/Admin requires invite code

    if (
      mode === "signup" &&
      (role === "teacher" || role === "admin") &&
      !inviteCode.trim()
    ) {

      setError(
        `Please enter the ${role} invitation code.`
      );

      return;

    }


    setGoogleLoading(true);

    /*
      Backend will eventually receive:

      Login:
      credential
      mode

      Signup:
      credential
      role
      invite_code
      mode
    */

    let result;

    if (mode === "login") {

      result = await googleLogin(
        credentialResponse.credential,
        null,
        "",
        mode
      );

    } else {

      result = await googleLogin(
        credentialResponse.credential,
        role,
        inviteCode.trim(),
        mode
      );

    }


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


  // ------------------------------------
  // STEP 1: Login / Signup
  // ------------------------------------

  if (!mode) {

    return (

      <div className="login-container">

        <div className="login-card">

          <h2>Smart Attendance</h2>

          <h3>Welcome</h3>

          <p>Select an option to continue</p>

          <button
            type="button"
            onClick={() => handleModeSelect("login")}
          >

            Login

          </button>

          <button
            type="button"
            onClick={() => handleModeSelect("signup")}
            style={{ marginTop: "10px" }}
          >

            Sign Up

          </button>

        </div>

      </div>

    );

  }


  // ------------------------------------
  // LOGIN FLOW
  // ------------------------------------

  if (mode === "login") {

    return (

      <div className="login-container">

        <div className="login-card">

          <button
            type="button"
            onClick={handleBack}
          >

            ← Back

          </button>

          <h2>Login</h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              autoComplete="username"
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            {error && (

              <p className="error">

                {error}

              </p>

            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
            >

              {loading
                ? "Logging in..."
                : "Login"}

            </button>

          </form>


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

            <p>

              Logging in with Google...

            </p>

          )}

        </div>

      </div>

    );

  }


  // ------------------------------------
  // STEP 2: Role Selection
  // ------------------------------------

  if (mode === "signup" && !role) {

    return (

      <div className="login-container">

        <div className="login-card">

          <button
            type="button"
            onClick={handleBack}
          >

            ← Back

          </button>

          <h2>Create Account</h2>

          <h3>Select Your Role</h3>

          <button
            type="button"
            onClick={() =>
              handleRoleSelect("student")
            }
          >

            Student

          </button>

          <button
            type="button"
            onClick={() =>
              handleRoleSelect("teacher")
            }
            style={{ marginTop: "10px" }}
          >

            Teacher

          </button>

          <button
            type="button"
            onClick={() =>
              handleRoleSelect("admin")
            }
            style={{ marginTop: "10px" }}
          >

            Admin

          </button>

        </div>

      </div>

    );

  }


  // ------------------------------------
  // STEP 3: Authentication
  // ------------------------------------

  return (

    <div className="login-container">

      <div className="login-card">

        <button
          type="button"
          onClick={handleBack}
        >

          ← Back

        </button>

        <h2>Create Account</h2>

        <p>

          Role:{" "}

          <strong>

            {role.charAt(0).toUpperCase() +
              role.slice(1)}

          </strong>

        </p>


        {/* Invitation code ONLY during signup */}

        {(role === "teacher" ||
          role === "admin") && (

            <input
              type="password"
              placeholder={`${role} Invitation Code`}
              value={inviteCode}
              onChange={(e) =>
                setInviteCode(e.target.value)
              }
              autoComplete="off"
            />

          )}


        {/* Manual authentication */}

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            autoComplete="username"
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {error && (

            <p className="error">

              {error}

            </p>

          )}

          <button
            type="submit"
            disabled={
              loading || googleLoading
            }
          >

            {loading
              ? "Processing..."
              : "Create Account"}

          </button>

        </form>


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

          <p>

            Processing Google authentication...

          </p>

        )}

      </div>

    </div>

  );

}

export default Login;