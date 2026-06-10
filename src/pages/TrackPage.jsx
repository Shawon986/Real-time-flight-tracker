import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import PageTransition from '../components/ui/PageTransition';
import FlightMap from '../components/FlightMap';
import FlightInfoPanel from '../components/FlightInfoPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SearchBar from '../components/SearchBar';
import HeadingCompass from '../components/3d/HeadingCompass';
import AltitudeGauge from '../components/3d/AltitudeGauge';
import AirplaneModel from '../components/3d/AirplaneModel';
import TiltCard from '../components/ui/TiltCard';
import { useFlightTracking } from '../hooks/useFlightTracking';
import { formatAltitude, formatSpeed, formatHeading, formatTimeAgo } from '../utils/formatters';

/* ────────────────────────────────────────────
   Live status ticker
   ──────────────────────────────────────────── */
function LiveTicker({ flight, lastUpdated, isMock }) {
  if (!flight) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between flex-wrap gap-3 px-5 py-3
                 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl
                 border border-gray-200/60 dark:border-gray-700/40 rounded-2xl text-xs"
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <span className={`w-2 h-2 rounded-full ${isMock ? 'bg-amber-400 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
          {isMock ? 'DEMO MODE' : 'LIVE DATA'}
        </span>
        <span className="text-gray-400 dark:text-gray-500">|</span>
        <span className="text-gray-500 dark:text-gray-400">
          Alt <strong className="text-gray-900 dark:text-gray-100">{formatAltitude(flight.altitudeMeters)}</strong>
        </span>
        <span className="text-gray-400 dark:text-gray-500">|</span>
        <span className="text-gray-500 dark:text-gray-400">
          Speed <strong className="text-gray-900 dark:text-gray-100">{formatSpeed(flight.velocity)}</strong>
        </span>
        <span className="text-gray-400 dark:text-gray-500">|</span>
        <span className="text-gray-500 dark:text-gray-400">
          Heading <strong className="text-gray-900 dark:text-gray-100">{formatHeading(flight.heading)}</strong>
        </span>
      </div>
      <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
        <span>Refreshes every 15s</span>
        {lastUpdated && (
          <span>Last update: {lastUpdated.toLocaleTimeString()}</span>
        )}
        {flight.lastContact && (
          <span className="text-gray-300 dark:text-gray-600">({formatTimeAgo(flight.lastContact)})</span>
        )}
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Dashboard-style instrument panel
   ──────────────────────────────────────────── */
function InstrumentPanel({ flight }) {
  if (!flight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-5"
    >
      {/* Flight info */}
      <FlightInfoPanel flight={flight} lastUpdated={new Date()} />

      {/* 3D Instruments row */}
      <div className="grid grid-cols-2 gap-4">
        <TiltCard className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-3 overflow-hidden">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-1">
            Heading
          </p>
          <Suspense fallback={<div className="h-[180px] bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />}>
            <HeadingCompass heading={flight.heading || 0} height={180} />
          </Suspense>
        </TiltCard>

        <TiltCard className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-3 overflow-hidden">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-1">
            Altitude
          </p>
          <Suspense fallback={<div className="h-[180px] bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />}>
            <AltitudeGauge altitudeFt={flight.altitudeFeet || 0} height={180} />
          </Suspense>
        </TiltCard>
      </div>

      {/* 3D Airplane */}
      <TiltCard className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-700/40 overflow-hidden">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center pt-3">
          3D Aircraft View
        </p>
        <Suspense fallback={<div className="h-[180px] bg-gray-100 dark:bg-gray-700 animate-pulse m-3 rounded-xl" />}>
          <AirplaneModel height={200} />
        </Suspense>
      </TiltCard>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────── */
export default function TrackPage() {
  const [searchCallsign, setSearchCallsign] = useState('');
  const { flight, track, loading, error, lastUpdated, isMock, retry } =
    useFlightTracking(searchCallsign);

  const handleSearch = useCallback((callsign) => {
    setSearchCallsign(callsign);
  }, []);

  return (
    <PageTransition>
      <div className="space-y-5">
        {/* Search bar — centered, floating style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-xl">
            <SearchBar onSearch={handleSearch} loading={loading} initialValue={searchCallsign} />
          </div>
        </motion.div>

        {/* Live ticker (only when flight is tracked) */}
        <AnimatePresence>
          {flight && <LiveTicker flight={flight} lastUpdated={lastUpdated} isMock={isMock} />}
        </AnimatePresence>

        {/* Main layout: Map (left) + Instruments (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map — takes 2/3 on desktop */}
          <div className="lg:col-span-2">
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="sticky top-24"
            >
              <FlightMap flight={flight} track={track} />

              {/* Quick-demo chips (only show when no flight tracked yet) */}
              {!flight && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 flex flex-wrap gap-2 justify-center"
                >
                  {[
                    { label: 'UAL123', desc: 'Newark → London' },
                    { label: 'BAW249', desc: 'London → New York' },
                    { label: 'DLH400', desc: 'Frankfurt → Dubai' },
                    { label: 'UAE202', desc: 'Dubai → New York' },
                    { label: 'SIA321', desc: 'Singapore → London' },
                    { label: 'QFA12', desc: 'Sydney → LA' },
                  ].map(f => (
                    <motion.button
                      key={f.label}
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSearch(f.label)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold
                                 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/40
                                 hover:border-primary-300 dark:hover:border-primary-700
                                 hover:shadow-lg hover:shadow-primary-500/10
                                 transition-all duration-200 group"
                    >
                      <span className="text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {f.label}
                      </span>
                      <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {f.desc}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right panel — instruments */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {loading && !flight ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingSkeleton />
                </motion.div>
              ) : error && !flight ? (
                <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <FlightInfoPanel flight={null} error={error} loading={false} onRetry={retry} />
                </motion.div>
              ) : flight ? (
                <motion.div key="instruments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <InstrumentPanel flight={flight} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary-50 to-blue-100 dark:from-primary-950 dark:to-blue-950 flex items-center justify-center mb-5 shadow-lg shadow-primary-500/10">
                    <svg className="w-10 h-10 text-primary-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Track a Flight</h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
                    Search by flight number above to see live position, 3D instruments, and real-time telemetry.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
