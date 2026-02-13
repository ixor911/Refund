import apiClient from "./client";

export const refundsApi = {
  // POST /api/v1/refunds/
  createRefund: async (payload) => {
    // payload: { iban, country, items: [{sku,name,qty,price}] }
    const { data } = await apiClient.post("/refunds/", payload);
    return data;
  },

  // GET /api/v1/refunds/?params
  listRefunds: async (params = {}) => {
    const { data } = await apiClient.get("/refunds/", { params });
    return data;
  },

  // GET /api/v1/refunds/{id}/
  getRefund: async (id) => {
    const { data } = await apiClient.get(`/refunds/${id}/`);
    return data;
  },

  // PATCH /api/v1/refunds/{id}/status/
  updateStatus: async ({ id, to_status }) => {
    const { data } = await apiClient.patch(`/refunds/${id}/status/`, { to_status });
    return data;
  },
};
