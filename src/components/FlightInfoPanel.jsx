import { useRef, useEffect, useState } from 'react';
import { STATUS_DISPLAY, FLIGHT_STATUS } from '../utils/constants';
import {
  formatAltitude,
  formatSpeed,
  formatHeading,
  formatTimestamp,
  getAirlineFromCallsign,
  getAirportInfo,
} from '../utils/formatters';

/* ────────────────────────────────────────────
   AnimatedValue — flashes on change
   ──────────────────────────────────────────── */
function AnimatedValue({ value }) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span className={`ticker-value ${flash ? 'changed' : ''}`}>
      {value}
    </span>
  );
}

/* ────────────────────────────────────────────
   Detail item (used in the grid)
   ──────────────────────────────────────────── */
function DetailItem({ label, value, mono, animate }) {
  const display = animate ? <AnimatedValue value={value} /> : value;
  return (
    <div className="group">
      <dt className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
        {label}
      </dt>
      <dd className={`text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${mono ? 'font-mono text-xs' : ''}`}>
        {display}
      </dd>
    </div>
  );
}

/* ────────────────────────────────────────────
   Source label helper
   ──────────────────────────────────────────── */
function sourceLabel(source) {
  const sources = { 0: 'ADS-B', 1: 'ASTERIX', 2: 'MLAT', 3: 'FLARM', 4: 'Satellite' };
  return sources[source] || `Type ${source}`;
}

/* ────────────────────────────────────────────
   MAIN PANEL
   ──────────────────────────────────────────── */
export default function FlightInfoPanel({ flight, lastUpdated, isMock, loading, error, onRetry }) {
  // ── Error state ──
  if (error && !flight) {
    return (
      <div className="glass-card rounded-2xl p-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">{error}</p>
          <button
            onClick={onRetry}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary-600 text-white
                       hover:bg-primary-700 active:scale-95 transition-all duration-200 shadow-lg shadow-primary-600/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!flight) return null;

  const statusConfig = STATUS_DISPLAY[flight.status] || STATUS_DISPLAY[FLIGHT_STATUS.UNKNOWN];
  const airline = getAirlineFromCallsign(flight.callsign);
  const depAirport = flight.departure ? getAirportInfo(flight.departure) : null;
  const arrAirport = flight.arrival ? getAirportInfo(flight.arrival) : null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
      {/* ── Top bar: callsign + status ── */}
      <div className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          {/* Animated plane icon */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <svg className={`w-5 h-5 text-white ${flight.status === 'en_route' ? 'animate-float' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {flight.callsign.trim()}
            </h2>
            {airline && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {airline.iata}/{airline.icao} • {flight.originCountry || 'Unknown'}
              </p>
            )}
          </div>
        </div>

        {/* Status badge — gradient */}
        <span className={`
          inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide
          ${flight.status === 'en_route'
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 text-green-700 dark:text-green-300 border border-green-200/60 dark:border-green-800/40'
            : flight.status === 'landed'
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40'
            : `${statusConfig.bg} ${statusConfig.color} border border-current/10`
          }
        `}>
          <span className={`w-2 h-2 rounded-full ${flight.status === 'en_route' ? 'bg-green-500 animate-pulse' : flight.status === 'landed' ? 'bg-blue-500' : statusConfig.dot}`} />
          {statusConfig.label}
          {isMock && <span className="opacity-50 ml-0.5">· demo</span>}
        </span>
      </div>

      {/* ── Live data grid ── */}
      <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-5 border-t border-gray-100/80 dark:border-gray-700/50">
        <DetailItem label="Altitude" value={formatAltitude(flight.altitudeMeters)} animate />
        <DetailItem label="Speed" value={formatSpeed(flight.velocity)} animate />
        <DetailItem label="Heading" value={formatHeading(flight.heading)} animate />
        <DetailItem
          label="Vert. Rate"
          value={flight.verticalRate !== null
            ? `${flight.verticalRate > 0 ? '↑' : '↓'} ${Math.abs(flight.verticalRate)} m/s`
            : '—'}
          animate
        />
        <DetailItem label="ICAO24" value={flight.icao24?.toUpperCase() || '—'} mono />
        <DetailItem label="Squawk" value={flight.squawk || '—'} mono />
        <DetailItem label="Source" value={sourceLabel(flight.positionSource)} />
        <DetailItem label="On Ground" value={flight.onGround ? 'Yes' : 'No'} />
      </div>

      {/* ── Route bar ── */}
      {(depAirport || arrAirport) && (
        <div className="mx-6 py-5 border-t border-gray-100/80 dark:border-gray-700/50">
          <div className="flex items-center justify-center gap-3">
            {/* Departure */}
            <div className="text-right flex-1 min-w-0">
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {flight.departure || '···'}
              </p>
              {depAirport && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                  {depAirport.name}
                </p>
              )}
            </div>

            {/* Animated route arrow */}
            <div className="flex items-center gap-0.5 flex-shrink-0 px-2">
              <div className="hidden sm:block w-8 h-[2px] bg-gradient-to-r from-transparent to-primary-300 dark:to-primary-700 rounded-full" />
              <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className={`w-5 h-5 ${flight.status === 'en_route' ? 'animate-float' : ''}`}>
                <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" />
                </svg>
              </div>
              <div className="hidden sm:block flex-1 w-8 h-[2px] bg-gradient-to-l from-transparent to-primary-300 dark:to-primary-700 rounded-full" />
            </div>

            {/* Arrival */}
            <div className="text-left flex-1 min-w-0">
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {flight.arrival || '···'}
              </p>
              {arrAirport && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                  {arrAirport.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Progress bar (mock flights only) ── */}
      {isMock && depAirport && arrAirport && flight.status === 'en_route' && (
        <div className="mx-6 pb-5">
          <MockProgressBar />
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-6 py-3.5 bg-gray-50/60 dark:bg-gray-800/30 border-t border-gray-100/80 dark:border-gray-700/50">
        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 font-medium">
          <span>Position time: {formatTimestamp(flight.timePosition)}</span>
          <span>Updated: {lastUpdated?.toLocaleTimeString() || '—'}</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Small progress bar for demo flights
   ──────────────────────────────────────────── */
function MockProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    // Drift forward slowly for visual effect
    const id = setInterval(() => {
      setPct(p => {
        if (p >= 100) return 0;
        return p + 0.3;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-linear"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}
