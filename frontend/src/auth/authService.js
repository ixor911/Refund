import { tokenStorage } from "./tokenStorage";

export const authService = {
  isAuthenticated: () => !!tokenStorage.getAccess(),
  logout: () => tokenStorage.clear(),
};
