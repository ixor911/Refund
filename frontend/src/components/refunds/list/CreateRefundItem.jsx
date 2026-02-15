import { Stack, TextField, Button } from "@mui/material";

export default function CreateRefundItem({
  item,
  index,
  canRemove,
  onChange,
  onRemove,
}) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
      <TextField
        label="Код"
        value={item.sku}
        onChange={(e) => onChange(index, { sku: e.target.value })}
        fullWidth
        required
      />
      <TextField
        label="Название"
        value={item.name}
        onChange={(e) => onChange(index, { name: e.target.value })}
        fullWidth
        required
      />
      <TextField
        label="Количество"
        type="number"
        value={item.qty}
        onChange={(e) => onChange(index, { qty: e.target.value })}
        sx={{ width: { minWidth: 90 } }}
        inputProps={{ min: 1 }}
        required
      />
      <TextField
        label="Цена"
        value={item.price}
        onChange={(e) => onChange(index, { price: e.target.value })}
        sx={{ width: { minWidth: 120 } }}
        required
      />
      <Button
        variant="outlined"
        color="error"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        sx={{ minWidth: 110 }}
      >
        Удалить
      </Button>
    </Stack>
  );
}
