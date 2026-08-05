import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (username, password) => api.post("/auth/login", { username, password }),
  signup: (data) => api.post("/auth/signup", data),
};

export const studentApi = {
  list: () => api.get("/students"),
  create: (data) => api.post("/students", data),
  remove: (id) => api.delete(`/students/${id}`),
};

export const attendanceApi = {
  mark: (imageBase64) => api.post("/attendance/mark", { image_base64: imageBase64 }),
  list: (studentId) => api.get("/attendance", { params: { student_id: studentId } }),
  report: (startDate, endDate) =>
    api.get("/attendance/report", { params: { start_date: startDate, end_date: endDate } }),
};

export default api;
