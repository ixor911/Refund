import apiClient from "./client";

export const ibanApi = {
  // POST /api/v1/iban/validate/
  validate: async ({ iban }) => {
    const { data } = await apiClient.post("/iban/validate/", { iban });
    return data;
  },
};
