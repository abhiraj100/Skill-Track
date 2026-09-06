import axios from "axios";

const api = axios.create({
  // The backend development server runs on 5050 because macOS commonly uses 5000.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("skilltrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
