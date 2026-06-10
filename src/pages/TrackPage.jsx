import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import PageTransition from '../components/ui/PageTransition';
import FlightMap from '../components/FlightMap';
import FlightInfoPanel from '../components/FlightInfoPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SearchBar from '../components/SearchBar';
import HeadingCompass from '../components/3d/HeadingCompass';
import AltitudeGauge from '../components/3d/AltitudeGauge';
import FlightScene3D from '../components/3d/FlightScene3D';
import TiltCard from '../components/ui/TiltCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { useFlightTracking } from '../hooks/useFlightTracking';
import { formatAltitude, formatSpeed, formatHeading, formatTimeAgo, formatTimestamp } from '../utils/formatters';
import { AIRPORTS } from '../utils/constants';

/* ═══════════════════════════════════════════════
   View toggle button
   ═══════════════════════════════════════════════ */
function ViewToggle({ view, onChange }) {
  return (
    <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-1">
      {[
        { key: 'map', label: 'Map', icon: '🗺️' },
        { key: '3d', label: '3D View', icon: '🛩️' },
      ].map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
            view === opt.key
              ? 'bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/25'
              : 'text-[#7a8ba0] hover:text-white'
          }`}
        >
          <span>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Live telemetry bar
   ═══════════════════════════════════════════════ */
function TelemetryBar({ flight, lastUpdated, isMock }) {
  const prevAlt = useRef(flight?.altitudeMeters);
  const prevSpd = useRef(flight?.velocity);
  const prevHdg = useRef(flight?.heading);

  const [altTrend, setAltTrend] = useState('→');
  const [spdTrend, setSpdTrend] = useState('→');
  const [hdgTrend, setHdgTrend] = useState('→');

  useEffect(() => {
    if (flight?.altitudeMeters != null && prevAlt.current != null) {
      setAltTrend(flight.altitudeMeters > prevAlt.current ? '↑' : flight.altitudeMeters < prevAlt.current ? '↓' : '→');
    }
    if (flight?.velocity != null && prevSpd.current != null) {
      setSpdTrend(flight.velocity > prevSpd.current ? '↑' : flight.velocity < prevSpd.current ? '↓' : '→');
    }
    if (flight?.heading != null && prevHdg.current != null) {
      const diff = flight.heading - prevHdg.current;
      setHdgTrend(Math.abs(diff) > 2 ? (diff > 0 ? '↻' : '↺') : '→');
    }
    prevAlt.current = flight?.altitudeMeters;
    prevSpd.current = flight?.velocity;
    prevHdg.current = flight?.heading;
  }, [flight?.altitudeMeters, flight?.velocity, flight?.heading]);

  if (!flight) return null;

  const dep = flight.departure ? AIRPORTS[flight.departure] : null;
  const arr = flight.arrival ? AIRPORTS[flight.arrival] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3"
    >
      {[
        { label: 'Altitude', value: formatAltitude(flight.altitudeMeters), trend: altTrend, color: '#00e676' },
        { label: 'Ground Speed', value: formatSpeed(flight.velocity), trend: spdTrend, color: '#3399ff' },
        { label: 'Heading', value: formatHeading(flight.heading), trend: hdgTrend, color: '#ff9800' },
        { label: 'Position', value: `${flight.position?.lat?.toFixed(2) ?? '—'}, ${flight.position?.lng?.toFixed(2) ?? '—'}`, trend: '', color: '#8b5cf6' },
        { label: 'ICAO24', value: flight.icao24?.toUpperCase() || '—', trend: '', color: '#7a8ba0', mono: true },
        { label: 'Status', value: flight.status?.replace('_', ' ')?.toUpperCase() || '—', trend: '', color: flight.status === 'en_route' ? '#00e676' : '#ff9800' },
      ].map(t => (
        <div key={t.label} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 backdrop-blur-sm">
          <p className="text-[10px] font-semibold text-[#7a8ba0] uppercase tracking-widest mb-1">{t.label}</p>
          <div className="flex items-center gap-1.5">
            <p className={`text-sm font-bold ${t.mono ? 'font-mono text-xs' : ''}`} style={{ color: t.color }}>
              {t.value}
            </p>
            {t.trend && t.trend !== '→' && (
              <motion.span
                key={t.trend}
                initial={{ opacity: 0, y: t.trend === '↑' ? 4 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs"
                style={{ color: t.trend === '↑' ? '#00e676' : t.trend === '↓' ? '#ff3d3d' : '#3399ff' }}
              >
                {t.trend}
              </motion.span>
            )}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Flight progress timeline
   ═══════════════════════════════════════════════ */
function FlightTimeline({ flight }) {
  const dep = flight?.departure ? AIRPORTS[flight.departure] : null;
  const arr = flight?.arrival ? AIRPORTS[flight.arrival] : null;

  if (!dep || !arr) return null;

  // Simulated progress based on position between airports
  const progress = flight.status === 'landed' ? 100 : flight.status === 'departed' ? 5 : 35 + Math.random() * 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 backdrop-blur-sm"
    >
      <p className="text-[10px] font-bold text-[#7a8ba0] uppercase tracking-widest mb-3">Flight Progress</p>

      {/* Progress bar */}
      <div className="relative h-2 bg-white/[0.04] rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #0066ff, #00e676)',
            boxShadow: '0 0 12px rgba(0,230,118,0.4)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {/* Aircraft dot on progress bar */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          animate={{ left: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <div>
          <p className="font-bold text-white">{flight.departure}</p>
          <p className="text-[#7a8ba0]">{dep.city}</p>
          <p className="text-[10px] text-[#7a8ba0]/60 mt-0.5">{flight.depTime || 'Departed'}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#7a8ba0] uppercase tracking-wider">ETA</p>
          <p className="font-bold text-[#00e676]">{flight.arrTime || '—'}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-white">{flight.arrival}</p>
          <p className="text-[#7a8ba0]">{arr.city}</p>
          <p className="text-[10px] text-[#7a8ba0]/60 mt-0.5">{flight.arrTime || 'Scheduled'}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Quick-demo chips
   ═══════════════════════════════════════════════ */
function QuickDemos({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
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
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(f.label)}
          className="px-4 py-2 rounded-xl text-sm font-semibold
                     bg-white/[0.02] border border-white/[0.05]
                     hover:border-[#0066ff]/30 hover:bg-white/[0.04]
                     transition-all duration-200 group"
        >
          <span className="text-white group-hover:text-[#3399ff] transition-colors">{f.label}</span>
          <span className="block text-[10px] text-[#7a8ba0] mt-0.5">{f.desc}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN TRACK PAGE
   ═══════════════════════════════════════════════ */
export default function TrackPage() {
  const [searchCallsign, setSearchCallsign] = useState('');
  const [viewMode, setViewMode] = useState('map');
  const { flight, track, loading, error, lastUpdated, isMock, retry } =
    useFlightTracking(searchCallsign);

  const handleSearch = useCallback((callsign) => {
    setSearchCallsign(callsign);
  }, []);

  // Progress for 3D scene
  const [progress, setProgress] = useState(0.4);
  useEffect(() => {
    if (!flight) return;
    const dep = flight.departure ? AIRPORTS[flight.departure] : null;
    const arr = flight.arrival ? AIRPORTS[flight.arrival] : null;
    if (dep && arr) {
      // Crude estimate based on position between airports
      const dLat = arr.lat - dep.lat;
      const dLng = arr.lon - dep.lon;
      const cLat = flight.position?.lat ?? 0;
      const cLng = flight.position?.lng ?? 0;
      const totalDist = Math.hypot(dLat, dLng);
      const currentDist = Math.hypot(cLat - dep.lat, cLng - dep.lon);
      setProgress(totalDist > 0 ? Math.min(0.98, Math.max(0.02, currentDist / totalDist)) : 0.5);
    }
  }, [flight]);

  return (
    <PageTransition>
      <div className="space-y-5">
        {/* ── Search + View Toggle ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 flex-wrap"
        >
          <div className="flex-1 min-w-[280px] max-w-xl">
            <SearchBar onSearch={handleSearch} loading={loading} initialValue={searchCallsign} />
          </div>
          {flight && (
            <ViewToggle view={viewMode} onChange={setViewMode} />
          )}
        </motion.div>

        {/* ── Telemetry Bar ── */}
        <AnimatePresence>
          {flight && <TelemetryBar flight={flight} lastUpdated={lastUpdated} isMock={isMock} />}
        </AnimatePresence>

        {/* ── Main Display: Map or 3D ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Left/Center: Map or 3D Scene */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {viewMode === 'map' ? (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FlightMap flight={flight} track={track} />
                </motion.div>
              ) : (
                <motion.div
                  key="3d"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                >
                  <Suspense fallback={
                    <div className="h-[550px] rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                      <div className="text-[#7a8ba0] animate-pulse text-sm">Loading 3D Scene...</div>
                    </div>
                  }>
                    <FlightScene3D flight={flight} progress={progress} height={typeof window !== 'undefined' && window.innerWidth < 640 ? 350 : 550} />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Demo chips below map */}
            {!flight && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <p className="text-[10px] font-bold text-[#7a8ba0] uppercase tracking-widest mb-3">
                  Try tracking these flights
                </p>
                <QuickDemos onSelect={handleSearch} />
              </motion.div>
            )}
          </div>

          {/* Right: Instruments */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {loading && !flight ? (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingSkeleton />
                </motion.div>
              ) : error && !flight ? (
                <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <FlightInfoPanel flight={null} error={error} loading={false} onRetry={retry} />
                </motion.div>
              ) : flight ? (
                <motion.div key="panels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Flight info */}
                  <FlightInfoPanel flight={flight} lastUpdated={lastUpdated} isMock={isMock} />

                  {/* Timeline */}
                  <FlightTimeline flight={flight} />

                  {/* 3D Instruments */}
                  <div className="grid grid-cols-2 gap-3">
                    <TiltCard className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3 overflow-hidden">
                      <p className="text-[10px] font-bold text-[#7a8ba0] uppercase tracking-widest text-center mb-1">Heading</p>
                      <Suspense fallback={<div className="h-[160px] bg-white/[0.02] rounded-xl animate-pulse" />}>
                        <HeadingCompass heading={flight.heading || 0} height={160} />
                      </Suspense>
                    </TiltCard>

                    <TiltCard className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3 overflow-hidden">
                      <p className="text-[10px] font-bold text-[#7a8ba0] uppercase tracking-widest text-center mb-1">Altitude</p>
                      <Suspense fallback={<div className="h-[160px] bg-white/[0.02] rounded-xl animate-pulse" />}>
                        <AltitudeGauge altitudeFt={flight.altitudeFeet || 0} height={160} />
                      </Suspense>
                    </TiltCard>
                  </div>

                  {/* Speed + position data */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-bold text-[#7a8ba0] uppercase tracking-widest mb-1">Latitude</p>
                      <p className="text-lg font-mono font-bold text-white">{flight.position?.lat?.toFixed(4) ?? '—'}°</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-bold text-[#7a8ba0] uppercase tracking-widest mb-1">Longitude</p>
                      <p className="text-lg font-mono font-bold text-white">{flight.position?.lng?.toFixed(4) ?? '—'}°</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-bold text-[#7a8ba0] uppercase tracking-widest mb-1">Vert. Speed</p>
                      <p className="text-lg font-mono font-bold text-white">
                        {flight.verticalRate != null ? `${flight.verticalRate > 0 ? '+' : ''}${flight.verticalRate} m/s` : '—'}
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-bold text-[#7a8ba0] uppercase tracking-widest mb-1">Refresh</p>
                      <p className="text-lg font-mono font-bold text-[#00e676]">
                        {lastUpdated ? formatTimeAgo(Math.floor(lastUpdated.getTime() / 1000)) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Data source badge */}
                  <div className="flex items-center justify-center gap-2 text-[10px] text-[#7a8ba0]">
                    <span className={`w-1.5 h-1.5 rounded-full ${isMock ? 'bg-[#ff9800]' : 'bg-[#00e676]'} ${!isMock ? 'animate-pulse shadow-[0_0_6px_#00e676]' : ''}`} />
                    {isMock ? 'Demo mode — simulated data' : 'Live ADS-B data via OpenSky Network'}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#0066ff]/20 to-[#00e676]/20 border border-[#0066ff]/10 flex items-center justify-center mb-5">
                    <svg className="w-10 h-10 text-[#3399ff] animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Live Flight Tracking</h3>
                  <p className="text-sm text-[#7a8ba0] mt-1 max-w-xs mx-auto">
                    Search any flight number to see live radar position, 3D visualization, heading compass, altitude gauge, and real-time telemetry.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-[#7a8ba0]/60">
                    <span>🟢 Live ADS-B</span>
                    <span>🛩️ 3D View</span>
                    <span>📡 15s Updates</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
