import { Stack, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function RefundsToolbar({ loading, onRefresh, onCreate }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreate}
      >
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
  );
}
