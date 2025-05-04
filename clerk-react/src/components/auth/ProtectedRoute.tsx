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
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, userId } = useAuth();
  
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
