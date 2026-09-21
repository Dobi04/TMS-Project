import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("auth:changed"));
    }
    return Promise.reject(error);
  }
);