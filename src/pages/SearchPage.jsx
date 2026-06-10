import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FlightCard from '../components/ui/FlightCard';
import ShimmerCard from '../components/ui/ShimmerCard';
import PageTransition from '../components/ui/PageTransition';
import { searchFlights, getUniqueAirlines, getUniqueAirports } from '../services/mockFlights';
import { staggerContainer, staggerItem } from '../utils/animations';
import { AIRPORTS } from '../utils/constants';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filters, setFilters] = useState({ maxPrice: '', stops: '', airline: '', from: '', to: '', sort: 'price' });
  const [loading, setLoading] = useState(false);

  const results = useMemo(() => {
    setLoading(true);
    const r = searchFlights(query, {
      ...filters,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    });
    // Simulate network delay for loading state demo
    const timeout = setTimeout(() => setLoading(false), 400);
    return r;
  }, [query, filters]);

  const airlines = useMemo(() => getUniqueAirlines(), []);
  const airports = useMemo(() => getUniqueAirports(), []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ maxPrice: '', stops: '', airline: '', from: '', to: '', sort: 'price' });
  };

  const hasFilters = filters.airline || filters.from || filters.to || filters.stops || filters.maxPrice;
  const [showFilters, setShowFilters] = useState(false);

  return (
    <PageTransition>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Mobile filter toggle */}
        <button onClick={() => setShowFilters(f => !f)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'} {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />}
        </button>

        {/* ── SIDEBAR FILTERS ── */}
        <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-24 space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">Clear all</button>
                )}
              </div>

              <div className="space-y-4">
                {/* Sort */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Sort by</label>
                  <select
                    value={filters.sort}
                    onChange={e => updateFilter('sort', e.target.value)}
                    className="mt-1 w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
                  >
                    <option value="price">Price (lowest)</option>
                    <option value="duration">Duration (shortest)</option>
                    <option value="rating">Rating (highest)</option>
                    <option value="departure">Departure (earliest)</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Max Price</label>
                  <input
                    type="range"
                    min={100}
                    max={1000}
                    step={50}
                    value={filters.maxPrice || 1000}
                    onChange={e => updateFilter('maxPrice', e.target.value === '1000' ? '' : e.target.value)}
                    className="w-full mt-1 accent-primary-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">${filters.maxPrice || 1000}</p>
                </div>

                {/* Stops */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Stops</label>
                  <select
                    value={filters.stops}
                    onChange={e => updateFilter('stops', e.target.value)}
                    className="mt-1 w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Any</option>
                    <option value="0">Direct only</option>
                    <option value="1">1 stop</option>
                  </select>
                </div>

                {/* Airline */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Airline</label>
                  <select
                    value={filters.airline}
                    onChange={e => updateFilter('airline', e.target.value)}
                    className="mt-1 w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All airlines</option>
                    {airlines.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* From */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">From</label>
                  <select
                    value={filters.from}
                    onChange={e => updateFilter('from', e.target.value)}
                    className="mt-1 w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Any airport</option>
                    {airports.map(a => <option key={a} value={a}>{a} — {AIRPORTS[a]?.city || ''}</option>)}
                  </select>
                </div>

                {/* To */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">To</label>
                  <select
                    value={filters.to}
                    onChange={e => updateFilter('to', e.target.value)}
                    className="mt-1 w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Any airport</option>
                    {airports.map(a => <option key={a} value={a}>{a} — {AIRPORTS[a]?.city || ''}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── RESULTS ── */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                {query ? `Results for "${query}"` : 'All Flights'}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">{results.length} flights found</p>
            </div>
          </div>

          {/* Loading / Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <ShimmerCard key={i} />)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">No flights found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <AnimatePresence>
                {results.map((flight, i) => (
                  <motion.div key={flight.id} variants={staggerItem} layout exit={{ opacity: 0, scale: 0.8 }}>
                    <FlightCard flight={flight} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
