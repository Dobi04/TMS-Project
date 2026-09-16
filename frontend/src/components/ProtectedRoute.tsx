import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function normalizeRole(role: string | null | undefined) {
  return role?.trim().toLowerCase() ?? '';
}

export function RequireAuth() {
  const { isLogedIn, role } = useAuth();
  const normalizedRole = normalizeRole(role);

  if (!isLogedIn || !['user', 'admin', 'owner'].includes(normalizedRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { isLogedIn, role } = useAuth();
  const normalizedRole = normalizeRole(role);

  if (!isLogedIn || normalizedRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
