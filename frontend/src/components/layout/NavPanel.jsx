import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { tokenStorage } from "../../auth/tokenStorage";
import { authService } from "../../auth/authService";
import { authApi } from "../../api";

export default function NavPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthed = !!tokenStorage.getAccess();

  const onLogout = async () => {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await authApi.logout({ refresh });
    } catch (err) {
      console.log("Server is unavailable")
    } finally {
      authService.logout();
      navigate("/login", { replace: true });
    }
  };

  const onLogin = () => {
    navigate("/login", { state: { from: location.pathname } });
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography fontWeight={800} sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Refund System
        </Typography>

        <Stack direction="row" spacing={1}>
          {isAuthed ? (
            <Button color="inherit" onClick={onLogout}>
              Выйти
            </Button>
          ) : (
            <Button color="inherit" onClick={onLogin}>
              Войти
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
