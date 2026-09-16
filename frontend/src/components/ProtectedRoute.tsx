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

export function RequireProductionOperator() {
  const { isLogedIn, role } = useAuth();
  const normalizedRole = normalizeRole(role);

  if (!isLogedIn || normalizedRole !== 'productionoperator') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function RequireQualitySupervisor() {
  const { isLogedIn, role } = useAuth();
  const normalizedRole = normalizeRole(role);

  if (!isLogedIn || normalizedRole !== 'qualitysupervisor') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function RequireBusinessUnitLeader() {
  const { isLogedIn, role } = useAuth();
  const normalizedRole = normalizeRole(role);
  const isBusinessUnitLeader = ['businessunitleader', 'busisinessunitleader'].includes(normalizedRole);

  if (!isLogedIn || !isBusinessUnitLeader) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
