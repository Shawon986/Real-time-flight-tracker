import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import PageTransition from '../components/ui/PageTransition';
import { useThemeContext } from '../context/ThemeContext';
import { getAllFlights, filterFlights, getAirlines } from '../services/globalFlights';

const AIRLINE_COLORS = [
  '#ff4444','#ff8800','#ffbb00','#44cc44','#00bbcc','#3388ff','#8844ff',
  '#ff44aa','#00cc88','#ff6644','#44aaff','#cc44ff','#ffaa00','#22cc66',
  '#ee3388','#6666ff','#00ccbb','#ff5522','#88cc22','#cc8844',
];

function airlineColor(name) {
  if (!name) return '#3388ff';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return AIRLINE_COLORS[Math.abs(hash) % AIRLINE_COLORS.length];
}

/* ── Airline badge icon ── */
function createBadgeIcon(heading, status, iata, airline) {
  const isEnRoute = status === 'en_route';
  const color = airlineColor(airline);
  const size = 28;
  const glow = isEnRoute ? 'drop-shadow(0 0 6px rgba(0,255,136,0.5))' : '';
  return L.divIcon({
    html: `
      <div style="transform:rotate(${heading}deg);transition:transform 0.5s ease-out;filter:${glow} drop-shadow(0 2px 3px rgba(0,0,0,0.7));">
        <svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" fill="${color}" stroke="#fff" stroke-width="2.5"/>
          <path d="M18 4L22 14L34 14L24 20L27 32L18 24L9 32L12 20L2 14L14 14Z" fill="#fff" opacity="0.85"/>
        </svg>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(${-heading}deg);color:#fff;font-size:8px;font-weight:900;text-shadow:0 1px 2px rgba(0,0,0,0.7);pointer-events:none;">${iata||''}</div>
        ${isEnRoute ? '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:5px;height:5px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px #0f0;"></div>' : ''}
      </div>`,
    className: '', iconSize: [size, size], iconAnchor: [size/2, size/2], popupAnchor: [0, -size/2],
  });
}

/* ═══════════════════════════════════════════════
   Continuously moving aircraft marker
   ═══════════════════════════════════════════════ */
function AnimatedPlane({ flight, onClick }) {
  const markerRef = useRef(null);
  // Current display position (updated every frame)
  const posRef = useRef([flight.position.lat, flight.position.lng]);
  // Target position from server data
  const targetRef = useRef([flight.position.lat, flight.position.lng]);
  // Server heading + speed for extrapolation
  const headingRef = useRef(flight.heading || 0);
  const speedRef = useRef(flight.velocity || 0);
  // Trail history
  const trailRef = useRef([]);
  // Animation frame
  const rafRef = useRef(null);
  // Time of last server update
  const lastUpdateRef = useRef(Date.now());
  // Whether we're blending toward server position
  const blendingRef = useRef(false);
  const blendStartRef = useRef(0);

  // When server data changes, start blending toward it
  useEffect(() => {
    targetRef.current = [flight.position.lat, flight.position.lng];
    headingRef.current = flight.heading || 0;
    speedRef.current = flight.velocity || 0;
    lastUpdateRef.current = Date.now();
    blendingRef.current = true;
    blendStartRef.current = Date.now();
  }, [flight.position.lat, flight.position.lng, flight.heading, flight.velocity]);

  // Perpetual animation loop
  useEffect(() => {
    let lastTrail = 0;

    const loop = () => {
      const now = Date.now();

      if (blendingRef.current) {
        // Blend from current display pos toward server target over 2s
        const elapsed = (now - blendStartRef.current) / 2000;
        if (elapsed >= 1) {
          blendingRef.current = false;
          posRef.current = [...targetRef.current];
        } else {
          const e = 1 - Math.pow(1 - elapsed, 3);
          posRef.current = [
            posRef.current[0] + (targetRef.current[0] - posRef.current[0]) * e,
            posRef.current[1] + (targetRef.current[1] - posRef.current[1]) * e,
          ];
        }
      } else {
        // Extrapolate forward using heading + speed
        const dt = (now - lastUpdateRef.current) / 1000; // seconds since last server update
        const hdgRad = (headingRef.current * Math.PI) / 180;
        const speedDegPerSec = speedRef.current / 111320; // m/s → deg/s (approx)
        const clampedDt = Math.min(dt, 10); // clamp extrapolation
        posRef.current = [
          targetRef.current[0] + Math.cos(hdgRad) * speedDegPerSec * clampedDt,
          targetRef.current[1] + Math.sin(hdgRad) * speedDegPerSec * clampedDt,
        ];
      }

      // Update marker
      if (markerRef.current) {
        markerRef.current.setLatLng(posRef.current);
      }

      // Trail every 200ms
      if (now - lastTrail > 200) {
        lastTrail = now;
        trailRef.current.push([...posRef.current]);
        if (trailRef.current.length > 20) trailRef.current.shift();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const icon = useMemo(
    () => createBadgeIcon(headingRef.current, flight.status, flight.iata, flight.airline),
    [flight.heading, flight.status, flight.iata, flight.airline],
  );

  const sc = flight.status === 'en_route' ? '#00ff88' : '#ff9800';

  return (
    <>
      {flight.status === 'en_route' && trailRef.current.map((pt, i) => {
        const age = (trailRef.current.length - 1 - i) / trailRef.current.length;
        return (
          <CircleMarker key={`t${flight.id}-${i}`} center={pt}
            radius={1.5 + age * 3}
            pathOptions={{ color: '#00ff88', fillColor: '#00ff88', fillOpacity: age * 0.4, opacity: age * 0.5, weight: 0.3 }} />
        );
      })}
      <Marker ref={markerRef} position={posRef.current} icon={icon}
        eventHandlers={{ click: () => onClick(flight) }}>
        <Popup>
          <div className="text-sm min-w-[190px] p-1 bg-[#0a1628] text-[#e6edf5]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-base">{flight.callsign}</span>
              <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5"
                style={{ background: flight.status==='en_route'?'rgba(0,255,136,0.15)':'rgba(255,152,0,0.15)', color: sc }}>
                {flight.status==='en_route'?'● LIVE':flight.status}
              </span>
            </div>
            <div className="space-y-1 text-xs text-[#7a8ba0]">
              <p>{flight.airline} · {flight.flightNum}</p>
              <p>{flight.depIATA} → {flight.arrIATA}</p>
              <p>Alt: {flight.altitudeFeet?.toLocaleString()} ft · {flight.speedKts} kts · HDG: {flight.heading}°</p>
              <p>{Math.round(flight.progress*100)}% complete</p>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

/* ── Route line ── */
function RouteLine({ dep, arr, progress, color }) {
  const points = useMemo(() => {
    if (!dep||!arr) return [];
    const pts = [];
    for (let i=0;i<=60;i++) {
      const f=i/60;
      pts.push([dep.lat+(arr.lat-dep.lat)*f, dep.lon+(arr.lon-dep.lon)*f + Math.sin(f*Math.PI)*2]);
    }
    return pts;
  }, [dep,arr]);
  const idx = Math.floor(progress*(points.length-1));
  return (<>
    <Polyline positions={points} pathOptions={{ color, weight:1, opacity:.08, dashArray:'6 10' }} />
    {idx>2 && <Polyline positions={points.slice(0,idx)} pathOptions={{ color, weight:2.5, opacity:.6 }} />}
    {idx>2 && <Polyline positions={points.slice(0,idx)} pathOptions={{ color, weight:5, opacity:.15 }} />}
  </>);
}

/* ── Map overlay ── */
function MapOverlay({ showRoutes, setShowRoutes, showSidebar, setShowSidebar, enRoute, total, tileMode, setTileMode }) {
  const { dark } = useThemeContext();
  const map = useMap();
  const overlayBg = 'bg-black/70 backdrop-blur-xl border-white/[0.08]';
  const btnOff = 'bg-black/60 border-white/[0.06] text-white/50';

  return (<>
    <div className="leaflet-top leaflet-left" style={{ marginTop:14, marginLeft:14 }}>
      <div className={`rounded-2xl px-5 py-3 border shadow-2xl space-y-2 ${overlayBg}`}>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_#00ff88]" />
            <span><strong className="text-white text-sm">{enRoute}</strong> <span className="text-white/50">in flight</span></span>
          </span>
          <span className="text-white/10">|</span>
          <span className="text-white/50"><strong className="text-white">{total}</strong> tracked</span>
          <span className="text-white/10">|</span>
          <span className="text-[#00ff88] text-[10px] font-bold">● LIVE</span>
        </div>
        <div className="flex gap-1.5">
          {['satellite','dark','light'].map(t => (
            <button key={t} onClick={() => setTileMode(t)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${
                tileMode===t ? 'bg-[#0066ff]/25 border border-[#0066ff]/40 text-[#3399ff]'
                : `border ${btnOff}`}`}>
              {t==='satellite'?'🛰️ Satellite':t==='dark'?'🌙 Dark':'☀️ Light'}
            </button>
          ))}
        </div>
      </div>
    </div>
    <div className="leaflet-top leaflet-right" style={{ marginTop:14, marginRight:14 }}>
      <div className="flex gap-2">
        <button onClick={() => setShowRoutes(r=>!r)}
          className={`px-3.5 py-2 text-[11px] font-bold rounded-xl backdrop-blur-xl border transition-all shadow-xl ${
            showRoutes ? 'bg-[#00ff88]/15 border-[#00ff88]/25 text-[#00ff88]' : btnOff}`}>
          {showRoutes?'Routes ON':'Routes OFF'}
        </button>
        <button onClick={() => setShowSidebar(s=>!s)}
          className={`px-3.5 py-2 text-[11px] font-bold rounded-xl backdrop-blur-xl border transition-all shadow-xl ${
            showSidebar ? 'bg-[#0066ff]/15 border-[#0066ff]/25 text-[#3399ff]' : btnOff}`}>
          ☰ Flights
        </button>
      </div>
    </div>
  </>);
}

/* ── Sidebar item ── */
function FlightItem({ flight, selected, onClick }) {
  const { dark } = useThemeContext();
  const color = airlineColor(flight.airline);
  const sc = flight.status==='en_route'?'#00ff88':'#ff9800';
  return (
    <motion.button layout initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
      onClick={()=>onClick(flight)}
      className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
        selected ? 'bg-[#0066ff]/8 border-[#0066ff]/20'
        : dark ? 'bg-white/[0.01] border-transparent'
        : 'bg-white border-transparent hover:bg-gray-50'}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-black text-[10px] text-white shadow-md"
          style={{background:color}}>{flight.iata}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold truncate ${dark?'text-white':'text-gray-900'}`}>{flight.callsign}</span>
            <span className="text-[11px] font-bold ml-2" style={{color:sc}}>{flight.altitudeFeet?.toLocaleString()} ft</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] ${dark?'text-[#7a8ba0]':'text-gray-500'}`}>{flight.depIATA} → {flight.arrIATA} · {flight.airline}</span>
        <span className={`text-[10px] ${dark?'text-[#7a8ba0]':'text-gray-500'}`}>{flight.speedKts} kts</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            animate={{width:`${Math.round(flight.progress*100)}%`}}
            style={{background:`linear-gradient(90deg,${sc},${sc}44)`}} />
        </div>
        <span className={`text-[9px] tabular-nums ${dark?'text-[#7a8ba0]':'text-gray-500'}`}>{Math.round(flight.progress*100)}%</span>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function RadarPage() {
  const { dark } = useThemeContext();
  const [flights, setFlights] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Track screen size
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setShowSidebar(false);
      else setShowSidebar(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [filterAirline, setFilterAirline] = useState('');
  const [tileMode, setTileMode] = useState('satellite');

  const airlines = useMemo(()=>getAirlines(),[]);

  useEffect(()=>{
    const u=()=>setFlights(getAllFlights());
    u(); const i=setInterval(u,5000); return ()=>clearInterval(i);
  },[]);

  const filtered = useMemo(()=>{
    let f=flights;
    if(query) f=filterFlights(f,query);
    if(filterAirline) f=f.filter(fl=>fl.airline===filterAirline);
    return f;
  },[flights,query,filterAirline]);

  const enRoute = filtered.filter(f=>f.status==='en_route').length;
  const sorted = useMemo(()=>[...filtered].sort((a,b)=>{
    if(a.status==='en_route'&&b.status!=='en_route') return -1;
    if(a.status!=='en_route'&&b.status==='en_route') return 1;
    return b.altitudeFeet-a.altitudeFeet;
  }),[filtered]);

  // Tile URLs — satellite with light labels for better visibility
  const tileUrl = tileMode==='satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : tileMode==='light'
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  // Light labels over satellite for readability
  const labelUrl = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png';

  const theme = {
    outer: dark ? 'border-white/[0.08] shadow-black/60' : 'border-gray-200 shadow-gray-200',
    sidebar: dark ? 'bg-black/90 border-white/[0.05]' : 'bg-white/95 border-gray-200',
    text: dark ? 'text-white' : 'text-gray-900',
    muted: dark ? 'text-white/50' : 'text-gray-500',
    input: dark ? 'bg-white/[0.03] border-white/[0.05] text-white' : 'bg-gray-50 border-gray-200 text-gray-900',
    select: dark ? 'bg-white/[0.03] border-white/[0.05] text-white/50' : 'bg-gray-50 border-gray-200 text-gray-500',
    detail: dark ? 'bg-black/85 border-white/[0.1]' : 'bg-white border-gray-200 shadow-xl',
  };

  return (
    <PageTransition>
      <div className={`flex h-[75vh] sm:h-[80vh] lg:h-[82vh] -mt-4 -mx-4 sm:-mx-6 rounded-none sm:rounded-[20px] overflow-hidden border shadow-2xl ${theme.outer}`}>
        {/* MAP */}
        <div className="flex-1 relative bg-black">
          {/* Subtle dark tint over satellite for radar look */}
          {tileMode === 'satellite' && (
            <div className="absolute inset-0 z-[400] pointer-events-none"
              style={{
                background: 'rgba(0,0,0,0.18)',
                backdropFilter: 'brightness(0.75) contrast(1.15) saturate(0.8)',
                WebkitBackdropFilter: 'brightness(0.75) contrast(1.15) saturate(0.8)',
              }} />
          )}

          <MapContainer center={[22,5]} zoom={3} className="w-full h-full"
            zoomControl={false} worldCopyJump={false} minZoom={2} maxZoom={12}
            style={{background:'#0a1120'}} attributionControl={false}>
            <TileLayer url={tileUrl} key={tileMode} attribution='' />
            {/* Dark label overlay for satellite mode */}
            {tileMode === 'satellite' && (
              <TileLayer url={labelUrl} attribution='' opacity={0.7} />
            )}

            <MapOverlay showRoutes={showRoutes} setShowRoutes={setShowRoutes}
              showSidebar={showSidebar} setShowSidebar={setShowSidebar}
              enRoute={enRoute} total={filtered.length} tileMode={tileMode} setTileMode={setTileMode} />

            {showRoutes && filtered.map(f=>(
              <RouteLine key={`r-${f.id}`} dep={f.dep} arr={f.arr} progress={f.progress}
                color={airlineColor(f.airline)} />
            ))}
            {filtered.map(f=>(
              <AnimatedPlane key={f.id} flight={f} onClick={setSelected} />
            ))}
          </MapContainer>

          {/* Detail card */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}}
                transition={{type:'spring',stiffness:300,damping:28}}
                className={`absolute bottom-5 left-5 z-[1000] backdrop-blur-2xl rounded-2xl border p-5 w-80 shadow-2xl ${theme.detail}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm text-white shadow-lg"
                      style={{background:airlineColor(selected.airline)}}>{selected.iata}</div>
                    <div>
                      <p className={`text-lg font-black ${theme.text}`}>{selected.callsign}</p>
                      <p className={`text-xs ${theme.muted}`}>{selected.airline} · {selected.flightNum}</p>
                    </div>
                  </div>
                  <button onClick={()=>setSelected(null)}
                    className={`p-1.5 rounded-lg ${theme.muted} transition-all ${dark?'hover:text-white hover:bg-white/[0.05]':'hover:text-gray-900 hover:bg-gray-100'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ['From',selected.depIATA,`${selected.dep.city}, ${selected.dep.country}`],
                    ['To',selected.arrIATA,`${selected.arr.city}, ${selected.arr.country}`],
                    ['Altitude',`${selected.altitudeFeet?.toLocaleString()} ft`,''],
                    ['Speed',`${selected.speedKts} kts`,''],
                    ['Heading',`${selected.heading}°`,''],
                    ['Progress',`${Math.round(selected.progress*100)}%`,''],
                  ].map(([l,v,s])=>(
                    <div key={l}>
                      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-0.5 ${theme.muted}`}>{l}</p>
                      <p className="text-[#00ff88] font-bold text-sm">{v}</p>
                      {s&&<p className={`text-[9px] ${theme.muted}`}>{s}</p>}
                    </div>
                  ))}
                </div>
                <div className="mt-3 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" animate={{width:`${Math.round(selected.progress*100)}%`}}
                    style={{background:`linear-gradient(90deg,${airlineColor(selected.airline)},#00ff88)`}} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SIDEBAR */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{width:0,opacity:0}} animate={{width: isMobile ? 300 : 360, opacity:1}} exit={{width:0,opacity:0}}
              transition={{duration:0.25}}
              className={`backdrop-blur-2xl border-l overflow-hidden flex flex-col flex-shrink-0 ${theme.sidebar} absolute lg:relative right-0 top-0 bottom-0 z-[500]`}
              style={{minWidth:0,maxWidth: isMobile ? 300 : 360, width: isMobile ? 300 : 360}}>
              <div className={`p-4 border-b space-y-3 flex-shrink-0 ${theme.sidebar}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-black uppercase tracking-[0.15em] ${theme.text}`}>Live Aircraft</h3>
                  <span className="text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/8 px-2.5 py-1 rounded-full border border-[#00ff88]/15">
                    {filtered.length} active
                  </span>
                </div>
                <input type="text" value={query} onChange={e=>setQuery(e.target.value)}
                  placeholder="Filter by callsign, airline, route..."
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#3399ff]/30 transition-all placeholder:text-gray-400 ${theme.input}`} />
                <select value={filterAirline} onChange={e=>setFilterAirline(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#3399ff]/30 transition-all ${theme.select}`}>
                  <option value="">All Airlines</option>
                  {airlines.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {sorted.map(f=><FlightItem key={f.id} flight={f} selected={selected?.id===f.id} onClick={setSelected} />)}
                {sorted.length===0&&<div className="text-center py-16"><p className={`text-sm ${theme.muted}`}>No flights match</p></div>}
              </div>
              <div className={`p-3 border-t flex items-center justify-between text-[10px] flex-shrink-0 ${theme.sidebar} ${theme.muted}`}>
                <span>Updates every 5s</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_6px_#00ff88]" />
                  <span className="text-[#00ff88] font-bold">LIVE RADAR</span>
                </span>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
