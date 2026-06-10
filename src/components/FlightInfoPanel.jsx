import { useRef, useEffect, useState } from 'react';
import { STATUS_DISPLAY, FLIGHT_STATUS } from '../utils/constants';
import { formatAltitude, formatSpeed, formatHeading, formatTimestamp, getAirlineFromCallsign, getAirportInfo } from '../utils/formatters';

/* ── Animated value ── */
function AnimatedValue({ value }) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);
  useEffect(() => {
    if (prevRef.current !== value) { setFlash(true); const t = setTimeout(() => setFlash(false), 600); prevRef.current = value; return () => clearTimeout(t); }
  }, [value]);
  return <span className={`ticker-value ${flash ? 'changed' : ''}`}>{value}</span>;
}

/* ── Detail item ── */
function DetailItem({ label, value, mono, animate }) {
  const display = animate ? <AnimatedValue value={value} /> : value;
  return (
    <div className="group">
      <dt className="text-[10px] font-semibold text-[#7a8ba0] uppercase tracking-widest mb-1">{label}</dt>
      <dd className={`text-sm font-bold text-white group-hover:text-[#3399ff] transition-colors ${mono ? 'font-mono text-xs' : ''}`}>{display}</dd>
    </div>
  );
}

function sourceLabel(source) {
  const s = { 0: 'ADS-B', 1: 'ASTERIX', 2: 'MLAT', 3: 'FLARM', 4: 'Satellite' };
  return s[source] || `Type ${source}`;
}

export default function FlightInfoPanel({ flight, lastUpdated, isMock, loading, error, onRetry }) {
  if (error && !flight) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ff3d3d]/10 border border-[#ff3d3d]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#ff3d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-white font-semibold">{error}</p>
          <button onClick={onRetry} className="aviation-btn px-5 py-2.5 text-sm">Retry</button>
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
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden animate-slide-up backdrop-blur-xl">
      {/* ── Header ── */}
      <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0066ff] to-[#00e676] flex items-center justify-center shadow-lg shadow-[#0066ff]/25">
            <svg className={`w-5 h-5 text-white ${flight.status === 'en_route' ? 'animate-float' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">{flight.callsign.trim()}</h2>
            {airline && <p className="text-[10px] text-[#7a8ba0] font-medium">{airline.iata}/{airline.icao} · {flight.originCountry || 'Unknown'}</p>}
          </div>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
          ${flight.status === 'en_route'
            ? 'bg-[#00e676]/10 border border-[#00e676]/20 text-[#00e676]'
            : flight.status === 'landed'
            ? 'bg-[#0066ff]/10 border border-[#0066ff]/20 text-[#3399ff]'
            : 'bg-white/[0.03] border border-white/[0.06] text-[#7a8ba0]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${flight.status === 'en_route' ? 'bg-[#00e676] animate-pulse shadow-[0_0_6px_#00e676]' : 'bg-current'}`} />
          {statusConfig.label}
          {isMock && <span className="opacity-50 ml-0.5">· demo</span>}
        </span>
      </div>

      {/* ── Grid ── */}
      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DetailItem label="Altitude" value={formatAltitude(flight.altitudeMeters)} animate />
        <DetailItem label="Speed" value={formatSpeed(flight.velocity)} animate />
        <DetailItem label="Heading" value={formatHeading(flight.heading)} animate />
        <DetailItem label="Vert. Rate" value={flight.verticalRate !== null ? `${flight.verticalRate > 0 ? '↑' : '↓'} ${Math.abs(flight.verticalRate)} m/s` : '—'} animate />
        <DetailItem label="ICAO24" value={flight.icao24?.toUpperCase() || '—'} mono />
        <DetailItem label="Squawk" value={flight.squawk || '—'} mono />
        <DetailItem label="Source" value={sourceLabel(flight.positionSource)} />
        <DetailItem label="On Ground" value={flight.onGround ? 'Yes' : 'No'} />
      </div>

      {/* ── Route ── */}
      {(depAirport || arrAirport) && (
        <div className="mx-5 py-4 border-t border-white/[0.04]">
          <div className="flex items-center justify-center gap-3">
            <div className="text-right flex-1 min-w-0">
              <p className="text-2xl font-black text-white">{flight.departure || '···'}</p>
              {depAirport && <p className="text-[10px] text-[#7a8ba0] truncate mt-0.5">{depAirport.name}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 px-2">
              <div className="hidden sm:block w-6 h-px bg-gradient-to-r from-transparent to-[#0066ff]/40 rounded-full" />
              <svg className={`w-5 h-5 text-[#0066ff] ${flight.status === 'en_route' ? 'animate-float' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
              <div className="hidden sm:block w-6 h-px bg-gradient-to-l from-transparent to-[#00e676]/40 rounded-full" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-2xl font-black text-white">{flight.arrival || '···'}</p>
              {arrAirport && <p className="text-[10px] text-[#7a8ba0] truncate mt-0.5">{arrAirport.name}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-5 py-3 bg-white/[0.01] border-t border-white/[0.04] flex items-center justify-between text-[10px] text-[#7a8ba0] font-medium">
        <span>Position: {formatTimestamp(flight.timePosition)}</span>
        <span>Updated: {lastUpdated?.toLocaleTimeString() || '—'}</span>
      </div>
    </div>
  );
}
