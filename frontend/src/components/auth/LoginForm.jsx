import { useState } from "react";
import { Box, TextField, Button, Alert, CircularProgress } from "@mui/material";
import { authApi } from "../../api";

export default function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.login({ username, password });
      onSuccess?.();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setError("Неверный логин или пароль.");
      else setError("Ошибка входа. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        fullWidth
        required
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        fullWidth
        required
      />

      <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.2 }}>
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Входим…
          </>
        ) : (
          "Войти"
        )}
      </Button>
    </Box>
  );
}
