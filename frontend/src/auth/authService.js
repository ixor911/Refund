import axios from "axios";
import { tokenStorage } from "./tokenStorage";


let refreshActive = null;


export const authService = {
  isAuthenticated: () => !!tokenStorage.getAccess(),
  logout: () => tokenStorage.clear(),

  refreshAccess: async () => {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) throw new Error("No refresh token");

    if (!refreshActive) {
      const base = import.meta.env.VITE_API_BASE_URL

      refreshActive = axios
        .post(
          `${base}/auth/token/refresh/`,
          { refresh },
          { headers: { "Content-Type": "application/json", Accept: "application/json" } }
        )
        .then((res) => {
          const access = res?.data?.access;
          if (!access) throw new Error("Refresh response has no access token");
          tokenStorage.setTokens({ access });
          return access;
        })
        .finally(() => {
          refreshActive = null;
        });
    }

    return refreshActive;
  },
};
