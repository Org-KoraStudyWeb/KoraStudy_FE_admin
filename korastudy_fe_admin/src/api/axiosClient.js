// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // dùng accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
