import { useCallback, useEffect, useState } from "react";
import { Container, Paper, Typography, Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { refundsApi } from "../api";
import RefundsToolbar from "../components/refunds/RefundsToolbar";
import RefundsTable from "../components/refunds/RefundsTable";
import CreateRefundDialog from "../components/refunds/CreateRefundDialog";


export default function RefundsList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const loadRefunds = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await refundsApi.listRefunds();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setError("Нужно войти в аккаунт (401).");
      else setError("Не удалось загрузить список возвратов.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

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
