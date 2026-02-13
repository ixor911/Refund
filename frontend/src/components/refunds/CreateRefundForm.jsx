import { useState } from "react";
import {
  Stack,
  TextField,
  Button,
  Alert,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { refundsApi } from "../../api";

const emptyItem = () => ({ sku: "", name: "", qty: 1, price: "0.00" });

export default function CreateRefundForm({ onCancel, onCreated }) {
  const [iban, setIban] = useState("");
  const [country, setCountry] = useState("");
  const [items, setItems] = useState([emptyItem()]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setItem = (index, patch) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const validate = () => {
    if (!iban.trim()) return "IBAN обязателен.";
    if (!country.trim()) return "Country обязателен (например: PL).";
    if (!items.length) return "Добавь хотя бы 1 item.";

    for (const [i, it] of items.entries()) {
      if (!it.sku.trim()) return `Item #${i + 1}: sku обязателен.`;
      if (!it.name.trim()) return `Item #${i + 1}: name обязателен.`;
      if (!Number.isFinite(Number(it.qty)) || Number(it.qty) <= 0) return `Item #${i + 1}: qty должен быть > 0.`;
      if (!it.price || Number(it.price) <= 0) return `Item #${i + 1}: price должен быть > 0.`;
    }
    return "";
  };

  const buildPayload = () => ({
    iban: iban.trim(),
    country: country.trim().toUpperCase(),
    items: items.map((it) => ({
      sku: it.sku.trim(),
      name: it.name.trim(),
      qty: Number(it.qty),
      price: String(it.price),
    })),
  });

  const handleSubmit = async () => {
    setError("");
    const msg = validate();
    if (msg) return setError(msg);

    setLoading(true);
    try {
      const created = await refundsApi.createRefund(buildPayload());
      onCreated?.(created);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) setError("Ошибка валидации. Проверь поля.");
      else if (status === 401) setError("Нужно авторизоваться.");
      else if (status === 503) setError("IBAN сервис недоступен (503).");
      else setError("Не удалось создать запрос.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="IBAN"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Страна (ISO) (UA)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="UA"
          fullWidth
          required
        />
      </Stack>

      <Divider />

      <Typography fontWeight={800}>Товары</Typography>

      <Stack spacing={1.5}>
        {items.map((item, idx) => (
          <Stack key={idx} direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              label="Код"
              value={item.sku}
              onChange={(e) => setItem(idx, { sku: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Название"
              value={item.name}
              onChange={(e) => setItem(idx, { name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Количество"
              type="number"
              value={item.qty}
              onChange={(e) => setItem(idx, { qty: e.target.value })}
              sx={{ width: { minWidth: 90 } }}
              inputProps={{ min: 1 }}
              required
            />
            <TextField
              label="Цена"
              value={item.price}
              onChange={(e) => setItem(idx, { price: e.target.value })}
              sx={{ width: { minWidth: 120 } }}
              required
            />
            <Button
              variant="outlined"
              color="error"
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              disabled={items.length === 1}
              sx={{ minWidth: 110 }}
            >
              Удалить
            </Button>
          </Stack>
        ))}
      </Stack>

      <Button variant="outlined" onClick={addItem}>
        + Добавить товар
      </Button>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
        <Button onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Создать
        </Button>
      </Box>
    </Stack>
  );
}
