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

function isAuthEndpoint(url) {
  return url.includes("/auth/token/") || url.includes("/auth/logout/");
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const originalRequest = err?.config;

    if (!originalRequest) return Promise.reject(err);

    if (status === 401 && isAuthEndpoint(originalRequest.url)) {
      authService.logout();
      return Promise.reject(err);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccess = await authService.refreshAccess();

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return apiClient.request(originalRequest);
      } catch (refreshErr) {
        authService.logout();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default apiClient;
