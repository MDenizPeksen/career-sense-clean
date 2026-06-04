import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link, NavLink } from 'react-router-dom';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
  }`;

/**
 * Header with navigation and authentication controls.
 * Nav links are always shown; protected routes gate themselves when auth is on.
 */
const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-blue-600">CareerSense</Link>
          <nav className="hidden sm:flex items-center gap-6">
            <NavLink to="/" end className={navClass}>Home</NavLink>
            <NavLink to="/upload" className={navClass}>Upload CV</NavLink>
            <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
            <NavLink to="/discovery" className={navClass}>Discovery</NavLink>
            <NavLink to="/interviews" className={navClass}>Mock Interviews</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              userProfileMode="modal"
              afterSignOutUrl="/"
              appearance={{ elements: { userButtonAvatarBox: 'w-9 h-9' } }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
