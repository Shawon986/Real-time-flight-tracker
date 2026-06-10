import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/track', label: 'Live Tracking', icon: '📡', highlight: true },
  { to: '/search', label: 'Book Flight', icon: '🔍' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/bookings', label: 'My Trips', icon: '🎫' },
];

export default function Header({ dark, onToggleTheme, cartCount }) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-[#060d1a]/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-16">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group mr-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066ff] to-[#00e676] flex items-center justify-center shadow-lg shadow-[#0066ff]/25 group-hover:shadow-[#0066ff]/40 transition-shadow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              {/* Live dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00e676] shadow-[0_0_6px_#00e676] animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                Sky<span className="text-[#00e676]">Track</span>
              </h1>
              <p className="text-[9px] text-[#7a8ba0] font-semibold tracking-[0.2em] uppercase leading-none mt-0.5">
                Flight Radar
              </p>
            </div>
          </Link>

          {/* ── Navigation ── */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-4">
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-[#00e676] bg-[#00e676]/5'
                      : 'text-[#7a8ba0] hover:text-white hover:bg-white/[0.03]'
                  } ${link.highlight && !active ? 'text-[#3399ff]' : ''}`}
                >
                  <span className="hidden xl:inline mr-1.5">{link.icon}</span>
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg border border-[#00e676]/10 bg-[#00e676]/5"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Mobile Nav ── */}
          <div className="flex lg:hidden items-center gap-1 ml-2 overflow-x-auto">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  location.pathname === link.to
                    ? 'text-[#00e676] bg-[#00e676]/5'
                    : 'text-[#7a8ba0]'
                }`}
              >
                {link.icon} {link.label.split(' ')[0]}
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          {/* ── Cart ── */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl text-[#7a8ba0] hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#ff3d3d] text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-[#ff3d3d]/30"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* ── Theme toggle ── */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl text-[#7a8ba0] hover:text-white hover:bg-white/[0.04] transition-all active:scale-90"
            aria-label="Toggle theme"
          >
            {dark ? (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
