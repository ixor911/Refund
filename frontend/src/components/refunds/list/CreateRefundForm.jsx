import { useState } from "react";
import { Stack, TextField, Button, Alert, Typography, Divider, Box } from "@mui/material";
import { refundsApi } from "../../../api";
import CreateRefundItem from "./CreateRefundItem";

const emptyItem = () => ({ sku: "", name: "", qty: 1, price: "0.00" });

function extractErrors(err) {
  const data = err?.response?.data;
  if (!data) return ["Неизвестная ошибка"];

  if (typeof data === "string") return [data];
  if (data.detail) return [data.detail];

  return Object.entries(data).flatMap(([field, messages]) =>
    Array.isArray(messages)
      ? messages.map((msg) => `${field}: ${msg}`)
      : [`${field}: ${messages}`]
  );
}

export default function CreateRefundForm({ onCancel, onCreated }) {
  const [iban, setIban] = useState("");
  const [country, setCountry] = useState("");
  const [items, setItems] = useState([emptyItem()]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const setItem = (index, updated) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) => setItems((prev) => prev.filter((item, i) => i !== index));

  const validate = () => {
    if (!iban.trim()) return "IBAN обязателен.";
    if (!country.trim()) return "Страна обязателена (например: PL).";
    if (!items.length) return "Добавь хотя бы 1 Предмет на возврат.";

    for (const [i, it] of items.entries()) {
      if (!it.sku.trim()) return `Предмет №${i + 1}: Код обязателен.`;
      if (!it.name.trim()) return `Предмет №${i + 1}: Название обязателено.`;
      if (!Number.isFinite(Number(it.qty)) || Number(it.qty) <= 0) return `Предмет №${i + 1}: Количество должено быть > 0.`;
      if (!it.price || Number(it.price) <= 0) return `Предмет №${i + 1}: Цена должена быть > 0.`;
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
    setErrors([]);
    const msg = validate();
    if (msg) return setErrors([msg]);

    setLoading(true);
    try {
      const created = await refundsApi.createRefund(buildPayload());
      onCreated?.(created);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) setErrors(extractErrors(err));
      else if (status === 401) setErrors(["Нужно авторизоваться."]);
      else if (status === 503) setErrors(["IBAN сервис недоступен (503)."]);
      else setErrors(["Не удалось создать запрос."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      {errors.length > 0 && (
        <Stack spacing={1}>
          {errors.map((errMsg, idx) => (
            <Alert key={idx} severity="error">
              {errMsg}
            </Alert>
          ))}
        </Stack>
      )}


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

      <Typography fontWeight={800}>Предметы</Typography>

      <Stack spacing={1.5}>
        {items.map((item, idx) => (
          <CreateRefundItem
            key={idx}
            item={item}
            index={idx}
            canRemove={items.length > 1}
            onChange={setItem}
            onRemove={removeItem}
          />
        ))}
      </Stack>

      <Button variant="outlined" onClick={addItem}>
        + Добавить предмет
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
