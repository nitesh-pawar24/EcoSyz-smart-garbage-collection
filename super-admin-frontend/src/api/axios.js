import axios from "axios";
import { toast } from "react-toastify";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://localhost:8000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response) {
      if (error.response.status === 401) {
        if (!window.location.pathname.toLowerCase().includes("/login")) {
          if (!sessionStorage.getItem("reloaded-for-401")) {
            sessionStorage.setItem("reloaded-for-401", "true");
            toast.error("Session timeout please login again");
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
          }
        } else {
          sessionStorage.removeItem("reloaded-for-401");
        }
      } else if (
        error.response.status === 403 &&
        error.response.data?.errorCode === "SUBSCRIPTION_EXPIRED"
      ) {
        if (
          !window.location.pathname.toLowerCase().includes("/login") &&
          !sessionStorage.getItem("subscription-expired-reloaded")
        ) {
          sessionStorage.setItem("subscription-expired-reloaded", "true");
          toast.error("Subscription expired. Contact company for renewal.");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
