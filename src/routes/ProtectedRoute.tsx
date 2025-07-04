// src/routes/ProtectedRoute.tsx
import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/ContextAuth';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!userRole || !allowedRoles.includes(userRole.toUpperCase())) {
    return <Navigate to="/no-autorizado" />; // Podés crear esta vista simple
  }

  return children;
};

export default ProtectedRoute;
