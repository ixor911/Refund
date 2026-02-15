import {Box, Chip, Divider, Paper, Stack, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Typography, Tooltip, IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import formatDateTime from "../../../services/FormatDateTime"

const statusColors = {
  "APPROVED": "success",
  "REJECTED": "error",
  "PENDING": "warning",
  "IN_REVIEW": "info"
};


function StatusChip({ status }) {
  const s = (status || "").toUpperCase();
  const label = s.replace('_', ' ') || "unknown";
  
  return <Chip label={label} size="medium" color={statusColors[s] || undefined} />;
}

export default function UserDetailsContent({ data }) {
  const navigate = useNavigate();

  if (!data) return null;

  const items = data.items || [];

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Tooltip title="Назад" arrow>
            <IconButton
              size="small"
              onClick={() => navigate(-1)}
              sx={{ flexShrink: 0 }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Typography variant="h5" fontWeight={900} noWrap>
            Запрос #{data.id}
          </Typography>
        </Stack>

        <StatusChip status={data.status} />
      </Stack>

      <Divider />

      {/* Meta */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}
      >
        {/* Left: Country + IBAN */}
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Страна
            </Typography>
            <Typography fontWeight={700}>{data.country || "-"}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              IBAN
            </Typography>
            <Typography fontWeight={700} sx={{ wordBreak: "break-all" }}>
              {data.iban || "-"}
            </Typography>
          </Box>
        </Stack>

        {/* Right: Created + Updated (aligned right) */}
        <Stack spacing={1} sx={{ textAlign: "right", ml: "auto" }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Создан
            </Typography>
            <Typography fontWeight={700}>{data.created_at ? formatDateTime(data.created_at) : "—"}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Обновлён
            </Typography>
            <Typography fontWeight={700}>{data.updated_at ? formatDateTime(data.updated_at) : "—"}</Typography>
          </Box>
        </Stack>
      </Stack> 

      <Divider />

      {/* Items */}
      <Box>
        <Typography fontWeight={900} sx={{ mb: 1 }}>
          Товары
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>SKU</b></TableCell>
                <TableCell><b>Название</b></TableCell>
                <TableCell><b>Qty</b></TableCell>
                <TableCell><b>Price</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length ? (
                items.map((it) => (
                  <TableRow key={it.id} hover>
                    <TableCell>{it.sku}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.qty}</TableCell>
                    <TableCell>{it.price}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      Нет товаров.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
}
