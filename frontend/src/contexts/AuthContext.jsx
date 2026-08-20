import { createContext, useContext, useState } from "react";
import authService from "../services/authService";
import { getErrorMessage } from "../utils/getErrorMessage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read token from localStorage when the application starts
  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );

  // Login with username and password
  const login = async (username, password) => {
    try {
      const { data } = await authService.login(username, password);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

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

  // Login with Google
  const googleLogin = async (credential) => {
    try {
      const { data } = await authService.googleLogin(credential);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      setToken(data.access_token);

      return {
        success: true,
        message: "Google login successful",
      };
    } catch (error) {
      console.error("Google Login Error:", error);

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

  const value = {
    token,
    isAuthenticated: !!token,
    login,
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
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}