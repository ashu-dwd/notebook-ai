import axios from "axios";
import { BACKEND_API_URL } from "../config";

export const axiosInstance = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token dynamically via interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("USER_SESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
