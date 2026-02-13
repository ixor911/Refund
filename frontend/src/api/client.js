import axios from "axios";
import { tokenStorage } from "../auth/tokenStorage";
import { authService } from "../auth/authService";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      authService.logout(); // важно: чистим localStorage
    }
    return Promise.reject(err);
  }
);

export default apiClient;
