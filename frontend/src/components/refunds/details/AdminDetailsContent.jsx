import { useMemo, useState } from "react";
import {Alert, Box, Button, Divider, Paper, Stack, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import { refundsApi } from "../../../api";
import formatDateTime from "../../../services/FormatDateTime"

function extractErrors(err) {
  const data = err?.response?.data;
  if (!data) return ["Неизвестная ошибка."];

  if (typeof data === "string") return [data];
  if (data.detail) return [data.detail];

  return Object.entries(data).flatMap(([field, messages]) =>
    Array.isArray(messages)
      ? messages.map((m) => `${field}: ${m}`)
      : [`${field}: ${messages}`]
  );
}

export default function AdminDetailsContent({ data, onRefresh, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const assignedAdmin = data?.assigned_admin; 
  const assignedAt = data?.assigned_at || data?.taken_at || null;
  const history = data?.status_history || [];

  const status = useMemo(() => (data?.status || "").toLowerCase(), [data]);

  const canManage = data?.can_manage === true;

  const isPending = status === "pending";
  const isInReview = status === "in_review";

  const run = async (to_status) => {
    if (!data?.id) return;

    setErrors([]);
    setLoading(true);
    try {
      const updated = await refundsApi.updateStatus(data.id, to_status);
      onUpdated?.(updated);
    } catch (err) {
      const s = err?.response?.status;

      if (s === 409) {
        setErrors([
          "Конфликт (409): запрос уже взят другим админом или переход статуса недоступен.",
        ]);
      } else if (s === 403) {
        setErrors(["Доступ запрещён (403): нужен админ."]);
      } else if (s === 401) {
        setErrors(["Нужно авторизоваться (401)."]);
      } else if (s === 400) {
        setErrors(extractErrors(err));
      } else {
        setErrors(["Не удалось обновить статус."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" fontWeight={900}>
          Admin panel
        </Typography>
      </Box>

      {errors.length > 0 && (
        <Stack spacing={1}>
          {errors.map((m, idx) => (
            <Alert key={idx} severity="error">
              {m}
            </Alert>
          ))}
        </Stack>
      )}

      <Divider />

      {/* Assigned info */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            Назначен админ
          </Typography>
          <Typography fontWeight={800} noWrap>
            {assignedAdmin?.username || "—"}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" color="text.secondary">
            Назначен
          </Typography>
          <Typography fontWeight={800} noWrap>
            {assignedAt ? formatDateTime(assignedAt) : "—"}
          </Typography>
        </Box>
      </Stack>

      {/* Actions (no card, no title) */}
      {!canManage ? (
        <Button fullWidth variant="outlined" disabled>
          Нельзя изменить статус
        </Button>
      ) : isPending ? (
        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          onClick={() => run("in_review")}
        >
          Take in review
        </Button>
      ) : isInReview ? (
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            disabled={loading}
            onClick={() => run("approved")}
          >
            Approve
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="error"
            disabled={loading}
            onClick={() => run("rejected")}
          >
            Reject
          </Button>

          <Button
            fullWidth
            variant="outlined"
            disabled={loading}
            onClick={() => run("pending")}
          >
            Drop
          </Button>
        </Stack>
      ) : (
        <Button fullWidth variant="outlined" disabled>
          Нет доступных действий
        </Button>
      )}

      {/* History */}
      {data?.status_history !== undefined && (
        <Box>
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            История статусов
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Кто</b></TableCell>
                  <TableCell><b>From</b></TableCell>
                  <TableCell><b>To</b></TableCell>
                  <TableCell><b>Когда</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {history.length ? (
                  history.map((h) => (
                    <TableRow key={h.id} hover>
                      <TableCell>{h.changed_by?.username || "—"}</TableCell>
                      <TableCell>{h.from_status || "—"}</TableCell>
                      <TableCell>{h.to_status}</TableCell>
                      <TableCell>{formatDateTime(h.changed_at)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        История пустая.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Stack>
  );
}
