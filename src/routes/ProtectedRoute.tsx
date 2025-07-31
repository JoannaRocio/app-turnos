import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/ContextAuth';
import { JSX } from 'react';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: JSX.Element;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/Inicio-sesion" replace />;
  }

  const normalizedRole = userRole?.toUpperCase();
  if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};

export default ProtectedRoute;
