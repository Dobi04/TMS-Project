import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function normalizeRole(role: string | null | undefined) {
  return role?.trim().toLowerCase() ?? '';
}

export function RequireAuth() {
  const { isLogedIn, role } = useAuth();
  const normalizedRole = normalizeRole(role);

  if (!isLogedIn || !['productionoperator', 'businessunitleader', 'qualitysupervisor'].includes(normalizedRole)) {
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
  const isBusinessUnitLeader = ['businessunitleader'].includes(normalizedRole);

  if (!isLogedIn || !isBusinessUnitLeader) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
