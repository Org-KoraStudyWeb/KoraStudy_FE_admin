// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  // baseURL: process.env.REACT_APP_API_BASE_URL,
  baseURL: "http://localhost:8080",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      for (const key in params) {
        const value = params[key];
        if (Array.isArray(value)) {
          value.forEach((val) => searchParams.append(key, val));
        } else if (value !== null && value !== undefined) {
          searchParams.append(key, value);
        }
      }
      return searchParams.toString();
    },
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Use accessToken as the single source of truth
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(
        " No accessToken found in localStorage - request might fail!"
      );
    }

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
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const data = error.response?.data;

    console.error(" API Error - Status:", status);
    console.error(" API Error - URL:", url);
    console.error(" API Error - Data:", data || error.message);
    console.error(" API Error - Full error:", error);

    if (status === 401) {


      console.log(" Redirecting to login in 2 seconds...");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
