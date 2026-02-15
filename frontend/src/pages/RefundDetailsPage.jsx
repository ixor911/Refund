import { useEffect, useMemo, useState, useCallback } from "react";
import { Container, Paper, Typography, Alert, Stack, Skeleton } from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";
import { useParams } from "react-router-dom";

import { refundsApi } from "../api";

import DetailsShellDesktop from "../components/refunds/details/DetailsShellDesktop";
import DetailsShellMobile from "../components/refunds/details/DetailsShellMobile";
import UserDetailsContent from "../components/refunds/details/UserDetailsContent";
import AdminDetailsContent from "../components/refunds/details/AdminDetailsContent";

export default function RefundDetailsPage() {
  const { id } = useParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const d = await refundsApi.getRefund(id);
      setData(d);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) setError("Запрос не найден или нет доступа.");
      else if (status === 401) setError("Нужно авторизоваться.");
      else setError("Не удалось загрузить детали.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // admin view определяем по наличию полей (как ты хотел)
  const isAdminView = useMemo(() => {
    if (!data) return false;
    return data.assigned_admin !== undefined || data.status_history !== undefined;
  }, [data]);

  const userContent = useMemo(
    () => <UserDetailsContent data={data} loading={loading} error={error} />,
    [data, loading, error]
  );

  const adminContent = useMemo(
    () => (
      <AdminDetailsContent
        data={data}
        loading={loading}
        error={error}
        onRefresh={load}
        onUpdated={(updated) => setData(updated)}
      />
    ),
    [data, loading, error, load]
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Stack spacing={2}>
            <Skeleton height={42} />
            <Skeleton height={140} />
            <Skeleton height={260} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {isMobile ? (
              <DetailsShellMobile
                isAdmin={isAdminView}
                userContent={userContent}
                adminContent={adminContent}
              />
            ) : (
              <DetailsShellDesktop
                isAdmin={isAdminView}
                userContent={userContent}
                adminContent={adminContent}
              />
            )}
          </>
        )}
      </Paper>
    </Container>
  );
}
