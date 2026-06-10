import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import PageTransition from '../components/ui/PageTransition';
import { getAllFlights, filterFlights, getAirlines } from '../services/globalFlights';

/* ── Aircraft icon ── */
function createMiniAircraftIcon(heading, status) {
  const color = status === 'en_route' ? '#00e676' : status === 'departed' ? '#ff9800' : '#3399ff';
  return L.divIcon({
    html: `<div style="transform:rotate(${heading}deg);transition:transform 0.8s ease;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2" opacity="0.9"/><path d="M12 4l2.5 7h7.5L15 14l1.5 6L12 17l-4.5 3L9 14l-7-3h7.5z" fill="#fff"/></svg></div>`,
    className: '', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
  });
}

/* ── Route line ── */
function RouteLine({ dep, arr, progress, color = '#0066ff' }) {
  const points = useMemo(() => {
    if (!dep || !arr) return [];
    const pts = [];
    const n = 50;
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const lat = dep.lat + (arr.lat - dep.lat) * f;
      const curve = Math.sin(f * Math.PI) * 2.5;
      const lng = dep.lon + (arr.lon - dep.lon) * f + curve;
      pts.push([lat, lng]);
    }
    return pts;
  }, [dep, arr]);

  const traveled = Math.floor(progress * (points.length - 1));
  return (
    <>
      <Polyline positions={points} pathOptions={{ color: '#ffffff', weight: 1, opacity: 0.06 }} />
      {traveled > 1 && (
        <Polyline positions={points.slice(0, traveled + 1)} pathOptions={{ color, weight: 1.5, opacity: 0.45 }} />
      )}
    </>
  );
}

/* ── Aircraft on map ── */
function AircraftOnMap({ flight, onClick }) {
  const markerRef = useRef(null);
  const prevPos = useRef([flight.position.lat, flight.position.lng]);

  useEffect(() => {
    if (!markerRef.current) return;
    const start = prevPos.current;
    const end = [flight.position.lat, flight.position.lng];
    const startTime = performance.now();
    const dur = 800;
    const step = (now) => {
      const t = Math.min((now - startTime) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      markerRef.current.setLatLng([start[0] + (end[0] - start[0]) * e, start[1] + (end[1] - start[1]) * e]);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    prevPos.current = end;
  }, [flight.position.lat, flight.position.lng]);

  const icon = useMemo(() => createMiniAircraftIcon(flight.heading, flight.status), [flight.heading, flight.status]);
  const color = flight.status === 'en_route' ? '#00e676' : '#ff9800';

  return (
    <Marker ref={markerRef} position={[flight.position.lat, flight.position.lng]} icon={icon}
      eventHandlers={{ click: () => onClick(flight) }}>
      <Popup>
        <div className="text-sm min-w-[180px] p-1" style={{ color: '#e6edf5' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-base">{flight.callsign}</span>
            <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5"
              style={{ background: flight.status === 'en_route' ? 'rgba(0,230,118,0.15)' : 'rgba(255,152,0,0.15)', color }}>
              {flight.status === 'en_route' ? '● LIVE' : flight.status}
            </span>
          </div>
          <div className="space-y-1 text-xs" style={{ color: '#7a8ba0' }}>
            <p>{flight.airline} · {flight.flightNum}</p>
            <p>{flight.depIATA} → {flight.arrIATA}</p>
            <p>Alt: {flight.altitudeFeet?.toLocaleString()} ft · {flight.speedKts} kts</p>
            <p>HDG: {flight.heading}° · {Math.round(flight.progress * 100)}%</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

/* ── Controls inside MapContainer ── */
function MapControls({ showRoutes, setShowRoutes, showSidebar, setShowSidebar, enRouteCount, totalCount }) {
  const map = useMap();
  return (
    <>
      {/* Top-left stats */}
      <div className="leaflet-top leaflet-left" style={{ marginTop: 70, marginLeft: 12 }}>
        <div className="bg-black/70 backdrop-blur-lg rounded-xl px-4 py-2.5 border border-white/[0.06] shadow-2xl">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
              <span className="text-white font-bold">{enRouteCount}</span>
              <span className="text-[#7a8ba0]">in flight</span>
            </span>
            <span className="text-white/[0.15]">|</span>
            <span className="text-[#7a8ba0]">{totalCount} tracked</span>
          </div>
        </div>
      </div>

      {/* Top-right controls */}
      <div className="leaflet-top leaflet-right" style={{ marginTop: 70, marginRight: 12 }}>
        <div className="flex gap-2">
          <button onClick={() => setShowRoutes(r => !r)}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg backdrop-blur-lg border transition-all shadow-xl ${
              showRoutes ? 'bg-[#0066ff]/20 border-[#0066ff]/30 text-[#3399ff]' : 'bg-black/70 border-white/[0.06] text-[#7a8ba0]'}`}>
            Routes {showRoutes ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setShowSidebar(s => !s)}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg backdrop-blur-lg border transition-all shadow-xl ${
              showSidebar ? 'bg-[#0066ff]/20 border-[#0066ff]/30 text-[#3399ff]' : 'bg-black/70 border-white/[0.06] text-[#7a8ba0]'}`}>
            ☰ Flights
          </button>
        </div>
      </div>

      {/* Flight detail card */}
      {/* Handled outside MapContainer via state */}
    </>
  );
}

/* ── Sidebar item ── */
function FlightListItem({ flight, selected, onClick }) {
  const color = flight.status === 'en_route' ? '#00e676' : '#ff9800';
  return (
    <motion.button layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      onClick={() => onClick(flight)}
      className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
        selected ? 'bg-[#0066ff]/10 border-[#0066ff]/30' : 'bg-white/[0.01] border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]'}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">{flight.callsign}</span>
        <span className="text-[11px] font-bold" style={{ color }}>{flight.altitudeFeet?.toLocaleString()} ft</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] text-[#7a8ba0]">{flight.depIATA} → {flight.arrIATA}</span>
        <span className="text-[10px] text-[#7a8ba0]">{flight.speedKts} kts</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.round(flight.progress * 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
        </div>
        <span className="text-[9px] text-[#7a8ba0]">{Math.round(flight.progress * 100)}%</span>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function RadarPage() {
  const [flights, setFlights] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [filterAirline, setFilterAirline] = useState('');
  const airlines = useMemo(() => getAirlines(), []);

  // Load flights
  useEffect(() => {
    const update = () => setFlights(getAllFlights());
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    let f = flights;
    if (query) f = filterFlights(f, query);
    if (filterAirline) f = f.filter(fl => fl.airline === filterAirline);
    return f;
  }, [flights, query, filterAirline]);

  const enRouteCount = filtered.filter(f => f.status === 'en_route').length;

  const sortedList = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.status === 'en_route' && b.status !== 'en_route') return -1;
      if (a.status !== 'en_route' && b.status === 'en_route') return 1;
      return b.altitudeFeet - a.altitudeFeet;
    });
  }, [filtered]);

  return (
    <PageTransition>
      <div className="flex h-[80vh] -mt-4 -mx-4 sm:-mx-6 rounded-2xl overflow-hidden border border-white/[0.05]">
        {/* ═══════════ MAP ═══════════ */}
        <div className="flex-1 relative">
          <MapContainer
            center={[25, 10]}
            zoom={3}
            className="w-full h-full"
            zoomControl={false}
            worldCopyJump={false}
            minZoom={2}
            maxZoom={10}
            style={{ background: '#060d1a' }}
          >
            <TileLayer
              attribution=''
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <MapControls
              showRoutes={showRoutes} setShowRoutes={setShowRoutes}
              showSidebar={showSidebar} setShowSidebar={setShowSidebar}
              enRouteCount={enRouteCount} totalCount={filtered.length}
            />

            {/* Route lines */}
            {showRoutes && filtered.map(f => (
              <RouteLine key={`r-${f.id}`} dep={f.dep} arr={f.arr} progress={f.progress}
                color={f.status === 'en_route' ? '#00e676' : '#0066ff'} />
            ))}

            {/* Aircraft */}
            {filtered.map(f => (
              <AircraftOnMap key={f.id} flight={f} onClick={setSelectedFlight} />
            ))}
          </MapContainer>

          {/* Bottom-left detail card */}
          <AnimatePresence>
            {selectedFlight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 z-[1000] bg-black/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 max-w-xs shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-black text-white">{selectedFlight.callsign}</p>
                    <p className="text-xs text-[#7a8ba0]">{selectedFlight.airline} · {selectedFlight.flightNum}</p>
                  </div>
                  <button onClick={() => setSelectedFlight(null)}
                    className="p-1 rounded-lg text-[#7a8ba0] hover:text-white hover:bg-white/[0.05]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ['From', selectedFlight.depIATA, `${selectedFlight.dep.city}, ${selectedFlight.dep.country}`],
                    ['To', selectedFlight.arrIATA, `${selectedFlight.arr.city}, ${selectedFlight.arr.country}`],
                    ['Altitude', `${selectedFlight.altitudeFeet?.toLocaleString()} ft`, ''],
                    ['Speed', `${selectedFlight.speedKts} kts`, ''],
                    ['Heading', `${selectedFlight.heading}°`, ''],
                    ['Progress', `${Math.round(selectedFlight.progress * 100)}%`, ''],
                  ].map(([label, value, sub]) => (
                    <div key={label}>
                      <p className="text-[#7a8ba0] text-[10px] uppercase tracking-wider">{label}</p>
                      <p className="text-[#00e676] font-bold">{value}</p>
                      {sub ? <p className="text-[#7a8ba0]/60 text-[9px]">{sub}</p> : null}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════ SIDEBAR ═══════════ */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-[#060d1a]/95 backdrop-blur-xl border-l border-white/[0.05] overflow-hidden flex flex-col flex-shrink-0"
              style={{ minWidth: 0, maxWidth: 320 }}
            >
              <div className="p-4 border-b border-white/[0.05] space-y-3 flex-shrink-0">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Live Flights ({filtered.length})
                </h3>
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Filter by callsign, airline, route..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder-[#7a8ba0] focus:outline-none focus:border-[#0066ff]/30" />
                <select value={filterAirline} onChange={e => setFilterAirline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#7a8ba0] focus:outline-none focus:border-[#0066ff]/30">
                  <option value="">All Airlines</option>
                  {airlines.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sortedList.map(f => (
                  <FlightListItem key={f.id} flight={f} selected={selectedFlight?.id === f.id} onClick={setSelectedFlight} />
                ))}
                {sortedList.length === 0 && (
                  <p className="text-center text-[#7a8ba0] text-xs py-12">No flights match filters</p>
                )}
              </div>
              <div className="p-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-[#7a8ba0] flex-shrink-0">
                <span>Updates every 5s</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />Live</span>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
