import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getAuthToken } from "@/lib/storage";
import { ROUTES } from "@/lib/constants";

export function ProtectedRoute() {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
