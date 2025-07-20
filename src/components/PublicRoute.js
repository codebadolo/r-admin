// src/components/PublicRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If authenticated, redirect to dashboard (or other page)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise render the wrapped children
  return children;
};

export default PublicRoute;
