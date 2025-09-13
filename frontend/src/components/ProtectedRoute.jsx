import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTE_ACCESS } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  // Handle loading state (if needed)
  if (!isAuthenticated) {
    // Save the attempted path for redirect after login
    sessionStorage.setItem('returnTo', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has permission for this route
  if (!hasPermission(location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Handle default route redirects
  if (location.pathname === '/') {
    const defaultPath = ROUTE_ACCESS['/'].redirectTo(user.role);
    return <Navigate to={defaultPath} replace />;
  }

  return children;
}