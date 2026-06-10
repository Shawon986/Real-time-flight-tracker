import { Suspense, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Globe from '../components/3d/Globe';
import AirplaneModel from '../components/3d/AirplaneModel';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import TiltCard from '../components/ui/TiltCard';
import PageTransition from '../components/ui/PageTransition';
import { staggerContainer, staggerItem } from '../utils/animations';

const popularRoutes = [
  { from: 'JFK', to: 'LHR', fromCity: 'New York', toCity: 'London', price: 487, color: 'from-blue-500 to-indigo-600' },
  { from: 'LAX', to: 'HND', fromCity: 'Los Angeles', toCity: 'Tokyo', price: 756, color: 'from-purple-500 to-pink-600' },
  { from: 'DXB', to: 'SIN', fromCity: 'Dubai', toCity: 'Singapore', price: 534, color: 'from-amber-500 to-orange-600' },
  { from: 'LHR', to: 'JFK', fromCity: 'London', toCity: 'New York', price: 523, color: 'from-emerald-500 to-teal-600' },
  { from: 'SYD', to: 'LAX', fromCity: 'Sydney', toCity: 'LA', price: 812, color: 'from-rose-500 to-red-600' },
  { from: 'CDG', to: 'DXB', fromCity: 'Paris', toCity: 'Dubai', price: 445, color: 'from-indigo-500 to-purple-600' },
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
      <div className="space-y-20">
        {/* ── HERO ── */}
        <section className="relative -mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-12 pb-8 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-blue-50 to-transparent dark:from-primary-950/30 dark:via-blue-950/20 dark:to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-tight"
            >
              Track & Book
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Flights Worldwide
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
            >
              Real-time aircraft tracking, flight search, and instant booking — all in one place.
            </motion.p>

            {/* Search */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearch}
              className="mt-8 max-w-md mx-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search flights, routes, or airlines..."
                  className="w-full pl-5 pr-28 py-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg focus:outline-none focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 shadow-xl shadow-gray-200/50 dark:shadow-black/20 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all active:scale-95"
                >
                  Search
                </button>
              </div>
            </motion.form>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex justify-center gap-8 sm:gap-16"
            >
              {[
                { label: 'Flights Tracked', value: 12483, suffix: '+' },
                { label: 'Airports', value: 350, suffix: '+' },
                { label: 'Countries', value: 78, suffix: '' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* 3D Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-8 max-w-3xl mx-auto"
          >
            <Suspense fallback={<div className="h-[400px] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400">Loading 3D Globe...</div>}>
              <Globe className="rounded-2xl overflow-hidden shadow-2xl shadow-primary-500/10" />
            </Suspense>
          </motion.div>
        </section>

        {/* ── POPULAR ROUTES ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">Popular Routes</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Find great deals on trending destinations</p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {popularRoutes.map((route, i) => (
              <motion.div key={`${route.from}-${route.to}`} variants={staggerItem}>
                <TiltCard>
                  <Link
                    to={`/search?q=${route.from}-${route.to}`}
                    className="block p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/40 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${route.color} flex items-center justify-center`}>
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
                      </div>
                      <p className="text-lg font-black text-primary-600 dark:text-primary-400">${route.price}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{route.from}</p>
                        <p className="text-xs text-gray-400">{route.fromCity}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{route.to}</p>
                        <p className="text-xs text-gray-400">{route.toCity}</p>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── 3D Airplane section ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">Why SkyTrack?</h2>
            <ul className="mt-6 space-y-4">
              {[
                { title: 'Live Aircraft Tracking', desc: 'Watch planes move in real-time on an interactive map with 15-second updates.' },
                { title: 'Instant Booking', desc: 'Search, compare, and book flights from hundreds of airlines worldwide.' },
                { title: 'Interactive Seat Maps', desc: 'Pick your perfect seat with our animated seat selector.' },
                { title: 'Smart Dashboard', desc: 'Track your travel stats, spending, and loyalty points at a glance.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <Suspense fallback={<div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />}>
              <AirplaneModel height={350} className="rounded-2xl" />
            </Suspense>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-10 sm:p-16 text-white shadow-2xl shadow-primary-500/25"
          >
            <h2 className="text-3xl sm:text-4xl font-black">Ready to Fly?</h2>
            <p className="mt-3 text-lg text-white/70 max-w-md mx-auto">Search thousands of flights and book your next adventure in minutes.</p>
            <Link
              to="/search"
              className="inline-block mt-8 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-white/90 shadow-lg transition-all active:scale-95"
            >
              Start Searching →
            </Link>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
}
