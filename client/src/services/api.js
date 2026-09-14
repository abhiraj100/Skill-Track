import axios from "axios";

const api = axios.create({
  // In development, Vite proxies this same-origin path to the API. This avoids
  // browser CORS preflights entirely while keeping VITE_API_URL available for deployments.
  baseURL: import.meta.env.VITE_API_URL || "/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("skilltrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
