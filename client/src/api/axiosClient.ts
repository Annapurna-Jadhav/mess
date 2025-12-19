import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";
import { getAccessToken, clearAuth } from "@/auth/authStore";

const API_URL = import.meta.env.VITE_API_URL;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  // ❌ DO NOT force Content-Type globally
});

// 🔐 Attach Firebase ID Token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔁 Error handling ONLY (no success toasts here)
axiosClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status;

    // 🔴 Unauthorized → clear auth ONLY
    if (status === 401) {
      clearAuth();
      toast.error("Session expired. Please log in again.");
      return Promise.reject(error);
    }

    // 🧠 Extract backend message
    let message = "Something went wrong";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    toast.error(message);
    return Promise.reject(error);
  }
);

export default axiosClient;
