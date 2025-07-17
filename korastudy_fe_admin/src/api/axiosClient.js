// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080", // Đảm bảo URL này đúng với server của bạn
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Thử các key token khác nhau trong localStorage
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request Headers:", config.headers);
    console.log(
      "Token being sent:",
      token ? `${token.substring(0, 20)}...` : "No token"
    );
    console.log("Request:", config.method?.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      console.log("Unauthorized - clearing tokens and redirecting to login");
      // Clear all possible token keys
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("userRoles");
      localStorage.removeItem("username");

      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
