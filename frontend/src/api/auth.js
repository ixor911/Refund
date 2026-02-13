import apiClient from "./client";
import { tokenStorage } from "../auth/tokenStorage";

export const authApi = {
  // POST /api/v1/auth/token/
  login: async ({ username, password }) => {
    const { data } = await apiClient.post("/auth/token/", { username, password });
    // { access, refresh }
    tokenStorage.setTokens(data);
    return data;
  },

  // POST /api/v1/auth/token/refresh/
  refresh: async ({ refresh }) => {
    const { data } = await apiClient.post("/auth/token/refresh/", { refresh });
    // { access }
    tokenStorage.setTokens({ access: data.access });
    return data;
  },

  // POST /api/v1/auth/token/verify/
  verify: async ({ token }) => {
    const { data } = await apiClient.post("/auth/token/verify/", { token });
    return data;
  },

  // POST /api/v1/auth/logout/
  logout: async ({ refresh }) => {
    await apiClient.post("/auth/logout/", { refresh });
    tokenStorage.clear();
    return true;
  },
};
