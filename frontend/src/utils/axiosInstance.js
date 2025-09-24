import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Helper: get token from either storage
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

// Attach JWT on every request
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // ensure headers object exists
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler (optional but recommended)
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      // avoid redirect loop if already on /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
