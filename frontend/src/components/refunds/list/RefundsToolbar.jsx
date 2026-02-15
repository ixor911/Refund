import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

const STATUS_OPTIONS = [
  { value: "", label: "Все" },
  { value: "pending", label: "pending" },
  { value: "in_review", label: "in_review" },
  { value: "approved", label: "approved" },
  { value: "rejected", label: "rejected" },
];

const EMPTY_FILTERS = { status: "", country: "", created_from: "", created_to: "" };

export default function RefundsToolbar({
  loading,
  onRefresh,
  onCreate,
  filters,
  onFiltersChange,
  onApply,
  onReset,
}) {
  const set = (patch) => onFiltersChange?.({ ...(filters || EMPTY_FILTERS), ...patch });

  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={1}
      sx={{ mt: 2, alignItems: { lg: "flex-end" } }}
    >
      {/* Filters row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ flexWrap: "wrap", flex: 1, minWidth: 0 }}
      >
        <TextField
          select
          label="Status"
          value={filters?.status ? filters.status : null }
          onChange={(e) => set({ status: e.target.value })}
          sx={{ minWidth: 100 }}
          size="small"
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Country"
          value={filters?.country ? filters.country : null }
          onChange={(e) => set({ country: e.target.value })}
          placeholder="PL"
          sx={{ width: 100 }}
          size="small"
        />

        <TextField
          label="Created from"
          type="date"
          value={filters?.created_from ? filters.created_from : null }
          onChange={(e) => set({ created_from: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 100 }}
          size="small"
        />

        <TextField
          label="Created to"
          type="date"
          value={filters?.created_to ? filters.created_to : null }
          onChange={(e) => set({ created_to: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 100 }}
          size="small"
        />

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={onApply} disabled={loading}>
            Применить
          </Button>
          <Button variant="outlined" onClick={onReset} disabled={loading}>
            Очистить
          </Button>
        </Stack>
      </Stack>

      {/* Actions row */}
      <Stack direction="row" spacing={1}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          Добавить
        </Button>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          Обновить
        </Button>
      </Stack>
    </Stack>
  );
}
