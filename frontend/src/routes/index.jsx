import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { appRoutes } from "./appRoutes";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

function AppRoutes() {
  const publicRoutes = appRoutes.filter((route) => !route.protected);
  const protectedRoutes = appRoutes.filter((route) => route.protected);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route) => {
          const Component = route.element;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<Component />}
            />
          );
        })}

        {/* Protected Routes (Parent AppLayout remains mounted on navigation) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {protectedRoutes.map((route) => {
            const Component = route.element;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Component />}
              />
            );
          })}
        </Route>

        {/* Fallback for any invalid URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;