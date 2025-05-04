import { useState, useRef, useEffect } from 'react';
import { useUser, UserButton, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { StyledButton } from '../common/Button/styles';

/**
 * AuthButton component that displays either Login/Signup or user menu
 * based on authentication status
 * Implements [ComponentSplitting] and [AccessibilityCore] rules
 */
const AuthButton = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (!isLoaded) {
    return <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md"></div>; // Loading state
  }

  // If not signed in, show login button with modal mode
  if (!isSignedIn) {
    return (
      <StyledButton 
        onClick={() => openSignIn({ redirectUrl: window.location.href })}
      >
        Login / Signup
      </StyledButton>
    );
  }

  // Handle navigation with explicit event prevention
  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    navigate(path);
  };

  // If signed in, show account menu and user button
  return (
    <div className="flex items-center gap-4">
      {/* Account Menu Dropdown - Completely separate from UserButton */}
      <div className="relative" ref={menuRef}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-2"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          type="button"
        >
          <span>My Account</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => handleNavigation(e, '/dashboard')}
              type="button"
            >
              Dashboard
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => handleNavigation(e, '/cv-upload')}
              type="button"
            >
              CV Upload
            </button>
          </div>
        )}
      </div>

      {/* User Button - Completely separate container */}
      <div 
        className="border-2 border-transparent rounded-full hover:border-blue-500 transition-colors"
        onClick={(e) => e.stopPropagation()} // Prevent event bubbling
      >
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "w-10 h-10",
              userButtonPopoverCard: "z-[100]" // Higher z-index than dropdown
            }
          }}
        />
      </div>
    </div>
  );
};

export default AuthButton;
