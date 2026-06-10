import { useAuth } from '@clerk/clerk-react';
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that redirects to login if user is not authenticated
 * @param {ReactNode} children - Child components to render when authenticated
 */
// Auth can be paused for easy testing via VITE_AUTH_ENABLED=false.
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED !== 'false';

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, userId } = useAuth();

  // Testing mode: skip the auth gate entirely.
  if (!AUTH_ENABLED) {
    return <>{children}</>;
  }

  // Show loading indicator while Clerk is initializing
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
