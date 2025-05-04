import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

// Get the publishable key from environment variables
// For Create React App, environment variables need to be prefixed with REACT_APP_
const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn('Missing Clerk publishable key. Please create a .env.local file with REACT_APP_CLERK_PUBLISHABLE_KEY.');
  console.log('Environment variables available:', process.env);
}

interface ClerkContextProviderProps {
  children: ReactNode;
}

/**
 * ClerkContextProvider component that wraps the application with Clerk authentication
 * @param {ReactNode} children - Child components to be wrapped
 */
export const ClerkContextProvider = ({ children }: ClerkContextProviderProps) => {
  return (
    <ClerkProvider 
      publishableKey={publishableKey || ''} 
      afterSignInUrl="/"
      afterSignUpUrl="/"
      afterSignOutUrl="/"
      signInUrl="/"
      signUpUrl="/"
      appearance={{
        layout: {
          socialButtonsVariant: "iconButton",
          socialButtonsPlacement: "bottom"
        },
        elements: {
          // Style the forgot password link to make it more visible
          formButtonPrimary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
          footerActionLink: 'text-orange-500 hover:text-orange-600 font-medium',
          // Make sure the forgot password link is clearly visible
          formFieldAction: 'text-orange-500 hover:text-orange-600 font-medium'
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};
