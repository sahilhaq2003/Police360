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
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const currentPath = window.location.pathname;
      
      // Only redirect if:
      // 1. There's no token (user not logged in), OR
      // 2. We're on a protected route (dashboard, admin, etc.) and got 401
      // Don't redirect if we're already on login or if it's a non-critical API call
      const isProtectedRoute = currentPath.includes('/dashboard') || 
                               currentPath.includes('/admin') || 
                               currentPath.includes('/officer') ||
                               currentPath.includes('/itOfficer');
      
      if (!token || isProtectedRoute) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("userId");
        sessionStorage.removeItem("userId");
        localStorage.removeItem("role");
        sessionStorage.removeItem("role");
        localStorage.removeItem("userName");
        sessionStorage.removeItem("userName");
        
        // avoid redirect loop if already on /login
        if (currentPath !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
