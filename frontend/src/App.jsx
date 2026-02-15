import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { authService } from "./auth/authService";

import LoginPage from "./pages/LoginPage";
import RefundsList from "./pages/RefundsList";
import AppLayout from "./components/layout/AppLayout";
import RefundDetailsPage from "./pages/RefundDetailsPage";


function RequireAuth({ children }) {
  const location = useLocation();
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Navigate to="/refunds" replace />
          </RequireAuth>
        }
      />

      <Route
        path="/refunds"
        element={
          <RequireAuth>
            <AppLayout>
              <RefundsList />
            </AppLayout>
          </RequireAuth>
        }
      />

    <Route
      path="/refunds/:id"
      element={
        <RequireAuth>
          <AppLayout>
            <RefundDetailsPage />
          </AppLayout>
        </RequireAuth>
      }
    />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

