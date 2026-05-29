import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Hexagon from './Hexagon';
import { LOGOUT_URL } from '../lib/auth';
import { useCurrentUser } from '../lib/queries';

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

const NAV_LINKS = [
  { to: '/my-practice', label: 'My practice' },
  { to: '/principles',  label: 'Library'      },
  { to: '/prompts',     label: 'Prompts'      },
  { to: '/follow-ups',  label: 'Follow ups'   },
];

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black rounded-sm ${
    isActive
      ? 'text-hsbc-black font-medium'
      : 'text-hsbc-grey hover:text-hsbc-black'
  }`;

export default function AppShell({ onOpenGlossary }) {
  const location = useLocation();
  const { data: user } = useCurrentUser();

  const [menuOpen, setMenuOpen]           = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  // Close user-menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  // Escape closes both menus
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setMobileNavOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  function handleSignOut() {
    window.location.href = LOGOUT_URL;
  }

  return (
    <div className="min-h-screen bg-hsbc-bg flex flex-col">

      {/* Brand bar + top bar — sticky as a single unit */}
      <header className="sticky top-0 z-30 flex-shrink-0">
        <div className="h-1 bg-hsbc-red" aria-hidden="true" />
        <div className="bg-white border-b border-hsbc-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

          {/* Logo */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black rounded-sm"
          >
            <Hexagon size={22} color="#DB0011" />
            <span className="font-medium text-hsbc-black text-sm leading-none">LeadLab</span>
            <span className="text-hsbc-grey text-xs hidden sm:inline leading-none">
              How We Lead practice tool
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 ml-6" aria-label="Main navigation">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={navLinkClass}>
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={onOpenGlossary}
              className="text-sm text-hsbc-grey hover:text-hsbc-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black rounded-sm"
            >
              Glossary
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-2">

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-hsbc-grey hover:text-hsbc-black p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black rounded"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* User avatar + dropdown */}
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-8 h-8 rounded-full bg-hsbc-black text-white text-xs font-medium flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-hsbc-red"
                  aria-label={`User menu for ${user.name}`}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  {initials(user.name)}
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-10 w-52 bg-white border border-hsbc-border rounded-md py-1 z-40"
                    role="menu"
                  >
                    {/* User info header */}
                    <div className="px-3 py-2.5 border-b border-hsbc-border">
                      <div className="text-sm font-medium text-hsbc-black leading-none">{user.name}</div>
                      <div className="text-xs text-hsbc-grey mt-1">{user.role} · {user.team}</div>
                    </div>

                    <button
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); handleSignOut(); }}
                      className="w-full text-left px-3 py-2 text-sm text-hsbc-grey hover:text-hsbc-black hover:bg-hsbc-bg transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/25"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white border-r border-hsbc-border flex flex-col">
            {/* Drawer header */}
            <div className="h-1 bg-hsbc-red flex-shrink-0" aria-hidden="true" />
            <div className="flex items-center justify-between px-5 h-14 border-b border-hsbc-border flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Hexagon size={20} color="#DB0011" />
                <span className="font-medium text-sm text-hsbc-black">LeadLab</span>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="text-hsbc-grey hover:text-hsbc-black p-1 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black rounded"
                aria-label="Close navigation menu"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col px-4 py-4 gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded text-sm transition-colors duration-150 ${
                      isActive
                        ? 'text-hsbc-black font-medium bg-hsbc-bg border-l-2 border-hsbc-red pl-[10px]'
                        : 'text-hsbc-grey hover:text-hsbc-black hover:bg-hsbc-bg border-l-2 border-transparent pl-[10px]'
                    }`
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  {l.label}
                </NavLink>
              ))}
              <button
                onClick={() => { onOpenGlossary?.(); setMobileNavOpen(false); }}
                className="px-3 py-2.5 rounded text-sm text-left text-hsbc-grey hover:text-hsbc-black hover:bg-hsbc-bg transition-colors"
              >
                Glossary
              </button>
            </nav>

            {/* User section at bottom of drawer */}
            {user && (
              <div className="mt-auto border-t border-hsbc-border px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-hsbc-black text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
                    {initials(user.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-hsbc-black leading-none">{user.name}</div>
                    <div className="text-xs text-hsbc-grey mt-0.5">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileNavOpen(false); handleSignOut(); }}
                  className="w-full text-left text-sm text-hsbc-grey hover:text-hsbc-black py-1.5 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
