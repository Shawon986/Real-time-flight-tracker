import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, AIRPORTS } from '../utils/constants';
import { formatAltitude, formatSpeed, formatHeading } from '../utils/formatters';

/* ─────────────────────────────────────────────
   Great-circle interpolation
   ───────────────────────────────────────────── */
function greatCircleArc(start, end, numPoints = 120) {
  const [lat1, lng1] = [start[0] * Math.PI / 180, start[1] * Math.PI / 180];
  const [lat2, lng2] = [end[0] * Math.PI / 180, end[1] * Math.PI / 180];

  const δ = Math.acos(
    Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
  );
  if (Math.abs(δ) < 1e-10) return [start, end];

  const pts = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * δ) / Math.sin(δ);
    const B = Math.sin(f * δ) / Math.sin(δ);
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    pts.push([Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI, Math.atan2(y, x) * 180 / Math.PI]);
  }
  return pts;
}

/* ─────────────────────────────────────────────
   Animated aircraft icon (radar pulse + glow)
   ───────────────────────────────────────────── */
function createAircraftIcon(heading, status) {
  const isFlying = status === 'en_route' || status === 'departed';
  return L.divIcon({
    html: `
      <div class="aircraft-wrapper" style="transform:rotate(${heading}deg)">
        <!-- Radar rings -->
        ${isFlying ? `
        <div class="radar-ring radar-ring-1"></div>
        <div class="radar-ring radar-ring-2"></div>
        <div class="radar-ring radar-ring-3"></div>
        ` : ''}
        <!-- Glow -->
        <div class="aircraft-glow ${isFlying ? 'pulsing' : ''}"></div>
        <!-- Plane SVG -->
        <svg class="aircraft-svg" width="36" height="36" viewBox="0 0 28 28" fill="none">
          <defs>
            <radialGradient id="planeGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#60a5fa"/>
              <stop offset="100%" stop-color="#1d4ed8"/>
            </radialGradient>
            <filter id="planeShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
            </filter>
          </defs>
          <circle cx="14" cy="14" r="13" fill="url(#planeGrad)" stroke="#fff" stroke-width="2" filter="url(#planeShadow)"/>
          <path d="M14 4l3.5 10h10L21 18.5l2.2 8.5L14 23l-9.2 4 2.2-8.5L.5 14h10z"
                fill="#fff" stroke="rgba(255,255,255,0.6)" stroke-width="0.5"/>
        </svg>
        <!-- Status dot -->
        ${isFlying ? '<div class="status-dot live"></div>' : '<div class="status-dot"></div>'}
      </div>
    `,
    className: 'aircraft-icon-container',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function createAirportIcon() {
  return L.divIcon({
    html: `
      <div class="airport-marker">
        <div class="airport-outer"></div>
        <div class="airport-inner"></div>
      </div>
    `,
    className: 'airport-icon-container',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/* ─────────────────────────────────────────────
   MapController — flyTo with easing
   ───────────────────────────────────────────── */
function MapController({ center, zoom, shouldFly }) {
  const map = useMap();
  const prevRef = useRef(null);

  useEffect(() => {
    if (!center || !shouldFly) return;
    map.flyTo(center, zoom || MAP_DEFAULT_ZOOM, { duration: 1.8, easeLinearity: 0.2 });
    prevRef.current = center;
  }, [map, center, zoom, shouldFly]);

  return null;
}

/* ─────────────────────────────────────────────
   SmoothAircraft — lerped marker + trail dots
   ───────────────────────────────────────────── */
function SmoothAircraft({ position, heading, flight, trail }) {
  const markerRef = useRef(null);
  const animRef = useRef(null);
  const currentPos = useRef(position);      // where the marker is RIGHT NOW
  const targetPos = useRef(position);

  // Whenever a fresh target arrives, animate from currentPos → targetPos
  useEffect(() => {
    if (!position) return;
    targetPos.current = position;
    if (!currentPos.current) { currentPos.current = position; return; }

    const start = [...currentPos.current];
    const end = position;
    // Skip if there's essentially no movement
    const dist = Math.hypot(end[0] - start[0], end[1] - start[1]);
    if (dist < 0.0001) return;

    const startTime = performance.now();
    const duration = 1200; // ms — longer = smoother inter-flight glide

    const step = (now) => {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / duration, 1);
      // ease-in-out
      const t = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      currentPos.current = [lat, lng];

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }

      if (raw < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        currentPos.current = [...end];
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [position]);

  // Build icon
  const icon = useMemo(
    () => createAircraftIcon(heading ?? 0, flight?.status),
    [heading, flight?.status],
  );

  return (
    <>
      {/* Trail dots — fading circles behind the aircraft */}
      {trail && trail.length > 1 && trail.map((pt, i) => {
        const age = (trail.length - 1 - i) / trail.length; // 0 = oldest, 1 = newest
        const opacity = 0.08 + age * 0.45;
        const radius = 2 + age * 5;
        return (
          <CircleMarker
            key={i}
            center={pt}
            radius={radius}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#60a5fa',
              fillOpacity: opacity,
              opacity: opacity,
              weight: 0.5,
            }}
          />
        );
      })}

      {/* Main aircraft marker */}
      <Marker
        position={currentPos.current || position || [0, 0]}
        icon={icon}
        ref={markerRef}
      >
        <Popup>
          <div className="flight-popup">
            <div className="popup-header">
              <span className="popup-callsign">{flight?.callsign?.trim()}</span>
              {flight?.status && (
                <span className={`popup-badge ${flight.status}`}>
                  {flight.status === 'en_route' ? '● LIVE' : flight.status.replace('_', ' ')}
                </span>
              )}
            </div>
            <div className="popup-stats">
              <div><label>Altitude</label> <strong>{formatAltitude(flight?.altitudeMeters)}</strong></div>
              <div><label>Speed</label> <strong>{formatSpeed(flight?.velocity)}</strong></div>
              <div><label>Heading</label> <strong>{formatHeading(flight?.heading)}</strong></div>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

/* ─────────────────────────────────────────────
   Flight path polyline (historical track)
   ───────────────────────────────────────────── */
function FlightPath({ track }) {
  if (!track || track.length < 2) return null;
  const positions = track.filter(p => p.lat != null && p.lng != null).map(p => [p.lat, p.lng]);
  if (positions.length < 2) return null;
  return (
    <Polyline
      positions={positions}
      pathOptions={{ color: '#6366f1', weight: 1.5, opacity: 0.35, dashArray: '6 6' }}
    />
  );
}

/* ─────────────────────────────────────────────
   Animated route (great-circle from DEP → ARR)
   ───────────────────────────────────────────── */
function AnimatedRoute({ departure, arrival }) {
  const arc = useMemo(() => {
    if (!departure || !arrival) return null;
    return greatCircleArc(departure, arrival, 100);
  }, [departure, arrival]);

  if (!arc || arc.length < 2) return null;

  return (
    <Polyline
      positions={arc}
      pathOptions={{
        color: '#8b5cf6',
        weight: 2.5,
        opacity: 0.55,
        dashArray: '10 8',
        className: 'animated-route-line',
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Airport marker pair (DEP + ARR)
   ───────────────────────────────────────────── */
function AirportMarkers({ departure, arrival }) {
  if (!departure || !arrival) return null;
  const icon = useMemo(() => createAirportIcon(), []);
  return (
    <>
      <Marker position={departure} icon={icon}>
        <Tooltip permanent direction="top" offset={[0, -14]} className="airport-tooltip">
          DEP
        </Tooltip>
      </Marker>
      <Marker position={arrival} icon={icon}>
        <Tooltip permanent direction="top" offset={[0, -14]} className="airport-tooltip">
          ARR
        </Tooltip>
      </Marker>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN MAP
   ───────────────────────────────────────────── */
export default function FlightMap({ flight, track }) {
  const hasPosition = flight?.position?.lat != null && flight?.position?.lng != null;
  const position = hasPosition ? [flight.position.lat, flight.position.lng] : null;
  const zoom = hasPosition ? 7 : MAP_DEFAULT_ZOOM;
  const center = position || MAP_DEFAULT_CENTER;

  // Trail: keep last 25 positions for the fading trail behind the aircraft
  const trailRef = useRef([]);
  const lastPosKey = useRef('');
  useEffect(() => {
    if (!hasPosition) { trailRef.current = []; return; }
    const key = `${flight.position.lat.toFixed(4)},${flight.position.lng.toFixed(4)}`;
    if (key === lastPosKey.current) return;
    lastPosKey.current = key;
    trailRef.current = [...trailRef.current.slice(-24), [flight.position.lat, flight.position.lng]];
  }, [flight?.position?.lat, flight?.position?.lng, hasPosition]);

  // Derive departure / arrival airport coordinates if we know the IATA codes
  const depPos = flight?.departure ? getAirportPosition(flight.departure) : null;
  const arrPos = flight?.arrival ? getAirportPosition(flight.arrival) : null;

  return (
    <div className="relative w-full h-[350px] sm:h-[500px] lg:h-[620px] rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-primary-500/5 map-container">
      {/* Decorative gradient border glow */}
      {hasPosition && <div className="map-glow" />}

      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full z-10"
        scrollWheelZoom={true}
        zoomControl={true}
        worldCopyJump={false}
      >
        {/* Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          center={hasPosition ? position : null}
          zoom={hasPosition ? zoom : null}
          shouldFly={hasPosition}
        />

        {/* Animated route line */}
        <AnimatedRoute departure={depPos} arrival={arrPos} />

        {/* Airport markers */}
        <AirportMarkers departure={depPos} arrival={arrPos} />

        {/* Historical flight path from API */}
        <FlightPath track={track} />

        {/* Animated aircraft + trail */}
        {hasPosition && (
          <SmoothAircraft
            position={position}
            heading={flight.heading}
            flight={flight}
            trail={trailRef.current}
          />
        )}
      </MapContainer>

      {/* ── Overlays ── */}

      {/* Empty state */}
      {!hasPosition && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
          <div className="glass-card px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="animate-pulse-slow mr-2">📡</span>
            Search a flight number above to start live tracking
          </div>
        </div>
      )}

      {/* Mock badge */}
      {flight?._mock && (
        <div className="absolute top-4 right-4 z-[400] animate-fade-in">
          <span className="badge-glass bg-amber-50/90 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/40">
            ⚡ Demo Mode
          </span>
        </div>
      )}

      {/* Live indicator */}
      {hasPosition && !flight?._mock && (
        <div className="absolute top-4 left-4 z-[400] animate-fade-in">
          <span className="badge-glass bg-green-50/90 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200/60 dark:border-green-700/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        </div>
      )}

      {/* Refresh countdown ring — decorative */}
      {hasPosition && (
        <div className="absolute bottom-4 right-4 z-[400]">
          <RefreshIndicator />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Refresh indicator — small animated ring
   ───────────────────────────────────────────── */
function RefreshIndicator() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 15), 1000);
    return () => clearInterval(id);
  }, []);
  const pct = (tick / 15) * 100;
  return (
    <div className="glass-card px-2.5 py-1.5 text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
      <svg width="14" height="14" viewBox="0 0 24 24" className="-rotate-90">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3"
          strokeDasharray={`${(pct / 100) * 62.8} 62.8`} strokeLinecap="round" opacity="0.7" />
      </svg>
      {15 - tick}s
    </div>
  );
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
function getAirportPosition(iata) {
  const a = AIRPORTS[iata?.toUpperCase()];
  return a ? [a.lat, a.lon] : null;
}
