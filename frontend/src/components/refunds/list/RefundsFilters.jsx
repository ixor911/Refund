import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";

const STATUS_OPTIONS = [
  { value: "", label: "Все" },
  { value: "pending", label: "pending" },
  { value: "in_review", label: "in_review" },
  { value: "approved", label: "approved" },
  { value: "rejected", label: "rejected" },
];

// filters: { status, country, created_from, created_to } — строки
export default function RefundsFilters({ filters, onChange, onApply, onReset, loading }) {
  const set = (patch) => onChange?.({ ...filters, ...patch });

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-end">
        <TextField
          select
          label="Status"
          value={filters.status}
          onChange={(e) => set({ status: e.target.value })}
          sx={{ minWidth: 180 }}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Country"
          value={filters.country}
          onChange={(e) => set({ country: e.target.value })}
          placeholder="PL"
          sx={{ minWidth: 160 }}
        />

        <TextField
          label="Created from"
          type="date"
          value={filters.created_from}
          onChange={(e) => set({ created_from: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 170 }}
        />

        <TextField
          label="Created to"
          type="date"
          value={filters.created_to}
          onChange={(e) => set({ created_to: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 170 }}
        />

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={onApply} disabled={loading}>
            Apply
          </Button>
          <Button variant="outlined" onClick={onReset} disabled={loading}>
            Reset
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
