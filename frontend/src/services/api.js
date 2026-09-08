import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/google") ||
      originalRequest?.url?.includes("/auth/signup");

    // Handle 401 Unauthorized for protected resources
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      // Clear invalid/expired session tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Notify AuthContext in-memory state
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));

      // Redirect to login if not already on the login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;