import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - tambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika response 401 (Unauthorized), hapus session dan redirect
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("dashboard_type");
      localStorage.removeItem("user");
      localStorage.removeItem("face_registered");
      
      // Redirect ke login hanya jika tidak sedang di halaman login
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;