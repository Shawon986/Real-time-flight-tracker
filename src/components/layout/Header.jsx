import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/radar', label: 'Flight Radar', icon: '🌍', highlight: true },
  { to: '/track', label: 'Live Track', icon: '📡' },
  { to: '/search', label: 'Book Flight', icon: '🔍' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/bookings', label: 'My Trips', icon: '🎫' },
];

export default function Header({ dark, onToggleTheme, cartCount }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const bg = dark ? 'bg-[#060d1a]/80 border-white/[0.04]' : 'bg-white/80 border-gray-200/60';
  const textMuted = dark ? 'text-[#7a8ba0]' : 'text-gray-500';
  const textHover = dark ? 'hover:text-white hover:bg-white/[0.03]' : 'hover:text-gray-900 hover:bg-gray-100';
  const activeClass = dark
    ? 'text-[#00e676] bg-[#00e676]/5 border-[#00e676]/10'
    : 'text-green-600 bg-green-50 border-green-200';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${bg} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 h-14 sm:h-16">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group"
            onClick={() => setMobileOpen(false)}>
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0066ff] to-[#00e676] flex items-center justify-center shadow-lg shadow-[#0066ff]/25 group-hover:shadow-[#0066ff]/40 transition-shadow">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00e676] shadow-[0_0_6px_#00e676] animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-sm sm:text-base font-black tracking-tight leading-none ${dark ? 'text-white' : 'text-gray-900'}`}>
                Sky<span className="text-[#00e676]">Track</span>
              </h1>
              <p className={`text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] uppercase leading-none mt-0.5 ${textMuted}`}>
                Flight Radar
              </p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}
                  className={`relative px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all duration-200 ${
                    active ? activeClass
                    : link.highlight && !active ? (dark ? 'text-[#3399ff]' : 'text-blue-600')
                    : `${textMuted} ${textHover}`
                  }`}>
                  <span className="hidden xl:inline mr-1">{link.icon}</span>{link.label}
                  {active && (
                    <motion.div layoutId="nav-pill"
                      className={`absolute inset-0 rounded-lg border ${dark ? 'border-[#00e676]/10 bg-[#00e676]/5' : 'border-green-200 bg-green-50'}`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* ── Cart ── */}
          <Link to="/cart"
            className={`relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${textMuted} ${textHover}`}>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#ff3d3d] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-lg shadow-[#ff3d3d]/30">
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* ── Theme toggle ── */}
          <button onClick={onToggleTheme}
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all active:scale-90 ${textMuted} ${textHover}`}
            aria-label="Toggle theme" title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* ── Mobile hamburger ── */}
          <button onClick={() => setMobileOpen(o => !o)}
            className={`lg:hidden p-2 rounded-lg transition-all ${textMuted} ${textHover}`}
            aria-label="Menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className={`lg:hidden overflow-hidden border-t ${dark ? 'bg-[#060d1a]/95 border-white/[0.04]' : 'bg-white/95 border-gray-200'}`}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => {
                const active = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active ? activeClass : `${textMuted} ${textHover}`
                    }`}>
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00e676]" />}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
