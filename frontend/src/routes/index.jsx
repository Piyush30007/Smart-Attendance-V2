import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { appRoutes } from "./appRoutes";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {appRoutes.map((route) => {
          const Component = route.element;

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.protected ? (
                <ProtectedRoute>
                    <AppLayout>
                     <Component />
                     </AppLayout>
                </ProtectedRoute>
             ) : (
             <Component />
  )
}
            />
          );
        })}

        {/* Any invalid URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;