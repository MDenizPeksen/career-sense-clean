import { useAuth, useUser } from '@clerk/clerk-react';
import { useState } from 'react';

interface AuthButtonProps {
  className?: string;
}

/**
 * AuthButton component that displays either Login/Signup or user menu
 * based on authentication status
 * @param {string} className - Additional CSS classes for styling
 */
const AuthButton = ({ className = '' }: AuthButtonProps) => {
  const { isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isSignedIn) {
    return (
      <a 
        href="/login"
        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
      >
        Login / Signup
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
      >
        My Account
      </button>
      
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <a
              href="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Profile
            </a>
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
