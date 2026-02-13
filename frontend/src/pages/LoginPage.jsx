import { Box, Container, Paper, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {LoginForm, SecretPanel} from "../components";


export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/refunds";


  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: (t) => t.palette.grey[100],
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Возврат товаров
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Войди, чтобы управлять запросами на возврат.
          </Typography>

          <LoginForm onSuccess={() => navigate(from, { replace: true })} />

          <SecretPanel />
        </Paper>
      </Container>
    </Box>
  );
}

