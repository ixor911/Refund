import { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Paper, Typography, Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { refundsApi } from "../api";

import RefundsToolbar from "../components/refunds/list/RefundsToolbar";
import RefundsTable from "../components/refunds/list/RefundsTable";
import CreateRefundDialog from "../components/refunds/list/CreateRefundDialog";

const EMPTY_FILTERS = {
  status: "",
  country: "",
  created_from: "",
  created_to: "",
};

export default function RefundsList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);

  const params = useMemo(() => {
    const p = {};
    if (applied.status) p.status = applied.status;
    if (applied.country) p.country = applied.country.trim().toUpperCase();
    if (applied.created_from) p.created_from = applied.created_from;
    if (applied.created_to) p.created_to = applied.created_to;
    return p;
  }, [applied]);

  const loadRefunds = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await refundsApi.listRefunds(params);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setError("Нужно войти в аккаунт (401).");
      else setError("Не удалось загрузить список возвратов.");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  const handleApply = () => setApplied(filters);

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <div>
            <Typography variant="h5" fontWeight={800}>
              Запросы на возврат
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Просмотр и управление запросами
            </Typography>
          </div>
        </Box>

        <RefundsToolbar
          loading={loading}
          onRefresh={loadRefunds}
          onCreate={() => setCreateOpen(true)}
          filters={filters}
          onFiltersChange={setFilters}
          onApply={handleApply}
          onReset={handleReset}
        />

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box sx={{ mt: 2 }}>
          <RefundsTable
            rows={rows}
            loading={loading}
            onDetails={(id) => navigate(`/refunds/${id}`)}
          />
        </Box>

        <CreateRefundDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => loadRefunds()}
        />
      </Paper>
    </Container>
  );
}
