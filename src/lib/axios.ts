import axios from "axios";

import { API_BASE_URL, ROUTES } from "@/lib/constants";
import { clearAuthToken, getAuthToken } from "@/lib/storage";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();

      if (typeof window !== "undefined") {
        window.location.href = ROUTES.login;
      }
    }

    return Promise.reject(error);
  },
);
