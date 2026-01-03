// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://korastudybackend-g0fbapeue9gphqhd.indonesiacentral-01.azurewebsites.net",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Use accessToken as the single source of truth
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token found and set in Authorization header");
      console.log("🔑 Token preview:", token.substring(0, 50) + "...");
      console.log(" Token length:", token.length);
      console.log("🔑 Token full:", token);

      // Log the full Authorization header
      if (config.headers.Authorization) {
        console.log("📋 SENT AUTH HEADER:", config.headers.Authorization);
      } else {
        console.warn("⚠️ NO AUTH HEADER SENT for URL:", config.url);
      }
    } else {
      console.warn(
        "⚠️ No accessToken found in localStorage - request might fail!"
      );
    }

    console.log("📡 Request - Method:", config.method?.toUpperCase());
    console.log("📡 Request - URL:", config.url);
    console.log("📡 Request - Full URL:", config.baseURL + config.url);
    console.log("📡 Request - Headers:", config.headers);

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    console.log("✅ Response Success:", response.status, response.config.url);
    console.log("📦 Response data:", response.data);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const data = error.response?.data;

    console.error("❌ API Error - Status:", status);
    console.error("❌ API Error - URL:", url);
    console.error("❌ API Error - Data:", data || error.message);
    console.error("❌ API Error - Full error:", error);

    if (status === 401) {
      console.log("🔒 Unauthorized - Token invalid or expired");
      console.log("🔐 Clearing all tokens... (DISABLED FOR DEBUGGING)");
      // Clear all authentication data
      // localStorage.removeItem("accessToken");
      // localStorage.removeItem("token");
      // localStorage.removeItem("adminToken");
      // localStorage.removeItem("userRoles");
      // localStorage.removeItem("username");
      // sessionStorage.clear();

      console.log("⏳ Redirecting to login... (DISABLED FOR DEBUGGING)");

      console.log("⏳ Redirecting to login in 2 seconds...");

      // Add delay to allow logs to show
      // Add delay to allow logs to show
      // setTimeout(() => {
      //   if (!window.location.pathname.includes("/login")) {
      //     window.location.href = "/login";
      //   }
      // }, 2000);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
