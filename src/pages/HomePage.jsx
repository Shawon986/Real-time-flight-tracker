import { Suspense, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Globe from '../components/3d/Globe';
import AirplaneModel from '../components/3d/AirplaneModel';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import TiltCard from '../components/ui/TiltCard';
import PageTransition from '../components/ui/PageTransition';

const popularRoutes = [
  { from: 'JFK', to: 'LHR', fromCity: 'New York', toCity: 'London', price: 487, color: 'from-[#0066ff] to-[#00e676]' },
  { from: 'LAX', to: 'HND', fromCity: 'Los Angeles', toCity: 'Tokyo', price: 756, color: 'from-[#8b5cf6] to-[#ec4899]' },
  { from: 'DXB', to: 'SIN', fromCity: 'Dubai', toCity: 'Singapore', price: 534, color: 'from-[#ff9800] to-[#ff5722]' },
  { from: 'LHR', to: 'JFK', fromCity: 'London', toCity: 'New York', price: 523, color: 'from-[#00e676] to-[#0066ff]' },
  { from: 'SYD', to: 'LAX', fromCity: 'Sydney', toCity: 'LA', price: 812, color: 'from-[#ec4899] to-[#8b5cf6]' },
  { from: 'CDG', to: 'DXB', fromCity: 'Paris', toCity: 'Dubai', price: 445, color: 'from-[#0066ff] to-[#8b5cf6]' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <PageTransition>
      <div className="space-y-16 sm:space-y-24">
        {/* ═══════ HERO ═══════ */}
        <section className="relative -mt-8 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-12 sm:pt-16 pb-6 sm:pb-10 overflow-hidden radar-bg">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0066ff]/5 via-transparent to-[#050b14] pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#0066ff]/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#00e676]/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6 sm:mb-8">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00e676] shadow-[0_0_8px_#00e676] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#7a8ba0] uppercase tracking-[0.15em]">
                12,483 aircraft tracked today
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
              Track Every Flight
              <br />
              <span className="bg-gradient-to-r from-[#0066ff] via-[#3399ff] to-[#00e676] bg-clip-text text-transparent">
                Across the Globe
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-3 sm:mt-5 text-sm sm:text-lg text-[#7a8ba0] max-w-xl mx-auto leading-relaxed px-2">
              Real-time aircraft tracking with live radar data, 3D flight visualization, instant booking, and comprehensive travel analytics.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              onSubmit={handleSearch}
              className="mt-6 sm:mt-8 max-w-lg mx-auto px-2 sm:px-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0066ff]/30 to-[#00e676]/30 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search flights, routes, or flight numbers..."
                  className="relative w-full pl-4 sm:pl-5 pr-28 sm:pr-32 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#0c1524] border border-white/[0.06] text-white placeholder-[#7a8ba0] text-sm sm:text-base focus:outline-none focus:border-[#0066ff]/40 focus:ring-1 focus:ring-[#0066ff]/20 transition-all shadow-2xl" />
                <button type="submit"
                  className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#0066ff] to-[#3399ff] text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl hover:shadow-[0_0_30px_rgba(0,102,255,0.4)] transition-all active:scale-95">
                  Search
                </button>
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <span className="text-[#7a8ba0] text-[10px] sm:text-xs">Quick track:</span>
              {['UAL123', 'BAW249', 'UAE202', 'QFA12'].map(f => (
                <Link key={f} to={`/track?q=${f}`}
                  className="px-2.5 sm:px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#3399ff] text-[10px] sm:text-xs font-semibold hover:bg-white/[0.06] hover:border-[#0066ff]/30 transition-all">
                  {f}
                </Link>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-8 sm:mt-12 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
              {[
                { label: 'Flights Tracked', value: 12483, suffix: '+' },
                { label: 'Airports', value: 350, suffix: '+' },
                { label: 'Countries', value: 78, suffix: '' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-2 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-lg sm:text-2xl font-black text-white tabular-nums">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[#7a8ba0] font-semibold uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="mt-6 sm:mt-10 max-w-4xl mx-auto">
            <Suspense fallback={
              <div className="h-[250px] sm:h-[350px] lg:h-[450px] rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                <div className="text-[#7a8ba0] text-sm animate-pulse">Loading 3D Globe...</div>
              </div>
            }>
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.05] shadow-2xl shadow-black/40">
                <Globe className="h-[250px] sm:h-[350px] lg:h-[450px]" />
              </div>
            </Suspense>
          </motion.div>
        </section>

        {/* ═══════ POPULAR ROUTES ═══════ */}
        <section className="px-1 sm:px-0">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-bold text-[#00e676] uppercase tracking-[0.2em] mb-2">Popular Destinations</p>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Trending Routes</h2>
            <p className="text-[#7a8ba0] mt-2 text-xs sm:text-sm">Find the best deals on popular flight paths worldwide</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {popularRoutes.map((route, i) => (
              <motion.div key={`${route.from}-${route.to}`}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.08 }}>
                <TiltCard>
                  <Link to={`/search?q=${route.from}-${route.to}`}
                    className="block p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#0066ff]/20 hover:bg-white/[0.04] transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${route.color} flex items-center justify-center shadow-lg`}>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
                      </div>
                      <p className="text-base sm:text-lg font-black text-[#3399ff]">${route.price}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div><p className="text-lg sm:text-xl font-black text-white">{route.from}</p><p className="text-[10px] sm:text-xs text-[#7a8ba0]">{route.fromCity}</p></div>
                      <svg className="w-4 h-4 text-[#0066ff]/40 group-hover:text-[#00e676]/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      <div className="text-right"><p className="text-lg sm:text-xl font-black text-white">{route.to}</p><p className="text-[10px] sm:text-xs text-[#7a8ba0]">{route.toCity}</p></div>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════ FEATURES ═══════ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center px-1 sm:px-0">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#00e676] uppercase tracking-[0.2em] mb-2 sm:mb-3">Why SkyTrack</p>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-6 sm:mb-8">The Complete Aviation Platform</h2>
            <div className="space-y-3 sm:space-y-5">
              {[
                { title: 'Live Radar Tracking', desc: 'Watch aircraft move in real-time with 15-second radar updates, animated trails, and live telemetry.' },
                { title: 'Smart Booking System', desc: 'Search 30+ airlines, select seats on interactive maps, add travel extras, and book in seconds.' },
                { title: '3D Flight Instruments', desc: 'Immersive 3D compass, altitude gauge, and aircraft model that react to real flight data in real time.' },
                { title: 'Travel Dashboard', desc: 'Track your miles, spending, loyalty points, and booking history with animated charts and analytics.' },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#0066ff]/10 transition-colors group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0066ff]/20 to-[#00e676]/20 flex items-center justify-center flex-shrink-0 border border-[#0066ff]/10">
                    <span className="text-[#00e676] font-black text-xs sm:text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-[#3399ff] transition-colors">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-[#7a8ba0] mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <Suspense fallback={<div className="h-[250px] sm:h-[350px] w-full rounded-3xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />}>
              <div className="rounded-3xl overflow-hidden border border-white/[0.05] shadow-2xl shadow-black/30 w-full h-[250px] sm:h-[350px] lg:h-[400px]">
                <AirplaneModel height={400} />
              </div>
            </Suspense>
          </div>
        </section>

        {/* ═══════ CTA ═══════ */}
        <section className="pb-6 sm:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-16 text-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(0,230,118,0.1) 50%, rgba(139,92,246,0.1) 100%)' }}>
            <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-[#0066ff]/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-[#00e676]/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-5xl font-black text-white">Ready to Take Off?</h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-[#7a8ba0] max-w-lg mx-auto">
                Track live flights, book your next journey, and explore the world from above.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/track"
                  className="aviation-btn inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
                  Start Tracking Live
                </Link>
                <Link to="/search"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold rounded-xl bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all">
                  Book a Flight
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
}
