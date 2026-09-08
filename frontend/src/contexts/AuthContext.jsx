import { createContext, useContext, useState, useEffect } from "react";

import authService from "../services/authService";

import { getErrorMessage } from "../utils/getErrorMessage";

function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    // Invalidate if token has expired
    if (parsed.exp && parsed.exp * 1000 <= Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  // Read and validate token from localStorage when application starts
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("access_token");
    if (!savedToken) return null;
    const parsed = parseJwt(savedToken);
    if (!parsed) {
      // Clear expired or invalid token
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return null;
    }
    return savedToken;
  });

  // Listen for 401 session expiry events dispatched by api.js
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setToken(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);


  // Login with username and password

  const login = async (username, password) => {

    try {

      const { data } = await authService.login(
        username,
        password
      );

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh_token
      );

      setToken(data.access_token);

      return {

        success: true,

        message: "Login successful",

      };

    } catch (error) {

      console.error("Login Error:", error);

      return {

        success: false,

        message: getErrorMessage(error),

      };

    }

  };


  // Signup with username and password

  const signup = async (data) => {

    try {

      const response = await authService.signup(data);

      return {

        success: true,

        message: "Signup successful",

        data: response.data,

      };

    } catch (error) {

      console.error("Signup Error:", error);

      return {

        success: false,

        message: getErrorMessage(error),

      };

    }

  };


  // Login or Signup with Google

  const googleLogin = async (
    credential,
    role,
    inviteCode,
    mode
  ) => {

    try {

      const { data } = await authService.googleLogin(
        credential,
        role,
        inviteCode,
        mode
      );

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh_token
      );

      setToken(data.access_token);

      return {

        success: true,

        message: "Google authentication successful",

      };

    } catch (error) {

      console.error(
        "Google Authentication Error:",
        error
      );

      return {

        success: false,

        message: getErrorMessage(error),

      };

    }

  };


  // Logout user

  const logout = () => {

    localStorage.removeItem("access_token");

    localStorage.removeItem("refresh_token");

    setToken(null);

  };


  const user = token ? parseJwt(token) : null;

  const value = {
    token,
    user,
    role: user?.role,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    googleLogin,
    logout,
  };



  return (

    <AuthContext.Provider value={value}>

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }

  return context;

}