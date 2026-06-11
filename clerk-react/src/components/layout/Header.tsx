import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navClass =
  (glass: boolean) =>
  ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      glass ? '[text-shadow:0_1px_8px_rgba(0,0,0,0.7)]' : ''
    } ${
      isActive
        ? glass ? 'text-white' : 'text-blue-600'
        : glass ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-blue-600'
    }`;

/**
 * Header with navigation and authentication controls.
 *
 * On the landing page it floats as a rounded glass bar over the hero video,
 * then transitions to the solid white bar once the user scrolls past the hero.
 * On every other route it is the solid white bar from the start.
 */
const Header = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolledPastHero(window.scrollY > window.innerHeight - 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Glass mode only on the home hero, before scrolling past it.
  const glass = isHome && !scrolledPastHero;

  return (
    <header
      className={`${isHome ? 'fixed' : 'sticky'} top-0 inset-x-0 z-30 transition-colors duration-300 ${
        glass ? 'bg-transparent' : 'bg-white shadow-sm'
      }`}
    >
      <div
        className={`mx-auto max-w-6xl flex items-center justify-between transition-all duration-300 ${
          glass
            ? 'mt-0 px-5 h-14 rounded-b-2xl border-x border-b border-white/25 bg-black/25 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
            : 'px-4 h-16 rounded-none border border-transparent'
        }`}
      >
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className={`text-xl font-bold transition-colors ${glass ? 'text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]' : 'text-blue-600'}`}
          >
            CareerSense
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <NavLink to="/" end className={navClass(glass)}>Home</NavLink>
            <NavLink to="/upload" className={navClass(glass)}>Upload CV</NavLink>
            <NavLink to="/dashboard" className={navClass(glass)}>Dashboard</NavLink>
            <NavLink to="/discovery" className={navClass(glass)}>Discovery</NavLink>
            <NavLink to="/career-paths" className={navClass(glass)}>Career Paths</NavLink>
            <NavLink to="/interviews" className={navClass(glass)}>Mock Interviews</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  glass
                    ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-md'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
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
