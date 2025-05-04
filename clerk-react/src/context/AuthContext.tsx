import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

// Get the publishable key from environment variables
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Clerk publishable key');
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the application with Clerk authentication
 * @param {ReactNode} children - Child components to be wrapped
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
};
