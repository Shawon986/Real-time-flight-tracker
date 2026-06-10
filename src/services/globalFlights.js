// ═══════════════════════════════════════════════
// Global flight simulation — 60+ real-world routes
// Flights move along great-circle paths, updated by
// wall-clock time for realistic animation.
// ═══════════════════════════════════════════════

import { greatCirclePoint, greatCircleBearing } from '../utils/formatters';
import { AIRPORTS } from '../utils/constants';

const ROUTES = [
  // Transatlantic
  ['JFK','LHR'], ['EWR','LHR'], ['JFK','CDG'], ['BOS','LHR'], ['IAD','FRA'],
  ['ATL','AMS'], ['MIA','MAD'], ['ORD','LHR'], ['YYZ','LHR'], ['JFK','FRA'],
  ['LAX','LHR'], ['SFO','LHR'], ['MIA','LHR'], ['DFW','CDG'], ['JFK','AMS'],
  // Transpacific
  ['LAX','HND'], ['SFO','HND'], ['LAX','ICN'], ['SFO','ICN'], ['SEA','HND'],
  ['LAX','SYD'], ['SFO','SYD'], ['YVR','HND'], ['LAX','SIN'], ['SFO','SIN'],
  // Europe-Asia
  ['LHR','DXB'], ['CDG','DXB'], ['FRA','DXB'], ['LHR','SIN'], ['AMS','DXB'],
  ['LHR','DEL'], ['FRA','DEL'], ['CDG','BOM'], ['LHR','HKG'], ['FRA','SIN'],
  ['LHR','BOM'], ['AMS','SIN'], ['CDG','SIN'], ['FRA','HND'], ['LHR','ICN'],
  // Middle East
  ['DXB','SIN'], ['DXB','BOM'], ['DXB','DEL'], ['DOH','SIN'], ['DXB','IST'],
  ['DXB','JFK'], ['DOH','LHR'], ['DXB','HKG'], ['DXB','SYD'], ['AUH','LHR'],
  // Asia-Pacific
  ['SIN','SYD'], ['HKG','SYD'], ['HND','SYD'], ['SIN','HND'], ['BKK','HND'],
  ['SIN','ICN'], ['HKG','SIN'], ['HND','SIN'], ['PEK','SYD'], ['PVG','SIN'],
  // Americas
  ['JFK','LAX'], ['BOS','SFO'], ['MIA','SEA'], ['ORD','LAX'], ['ATL','SFO'],
  ['DFW','SEA'], ['JFK','MIA'], ['LAX','MEX'], ['SFO','MEX'], ['JFK','GRU'],
  // Europe internal
  ['LHR','IST'], ['CDG','IST'], ['FRA','IST'], ['MAD','LHR'], ['LHR','AMS'],
  ['CDG','MAD'], ['FRA','MAD'],
];

// Airlines with callsigns
const AIRLINES = [
  { name: 'United', iata: 'UA', icao: 'UAL' },
  { name: 'Delta', iata: 'DL', icao: 'DAL' },
  { name: 'American', iata: 'AA', icao: 'AAL' },
  { name: 'British Airways', iata: 'BA', icao: 'BAW' },
  { name: 'Lufthansa', iata: 'LH', icao: 'DLH' },
  { name: 'Emirates', iata: 'EK', icao: 'UAE' },
  { name: 'Singapore', iata: 'SQ', icao: 'SIA' },
  { name: 'Qatar', iata: 'QR', icao: 'QTR' },
  { name: 'Cathay Pacific', iata: 'CX', icao: 'CPA' },
  { name: 'Air France', iata: 'AF', icao: 'AFR' },
  { name: 'KLM', iata: 'KL', icao: 'KLM' },
  { name: 'Turkish', iata: 'TK', icao: 'THY' },
  { name: 'ANA', iata: 'NH', icao: 'ANA' },
  { name: 'Qantas', iata: 'QF', icao: 'QFA' },
  { name: 'Etihad', iata: 'EY', icao: 'ETD' },
];

let flightIdCounter = 0;

function generateFlights() {
  const flights = [];
  const usedRoutes = new Set();

  ROUTES.forEach(([depIATA, arrIATA]) => {
    const dep = AIRPORTS[depIATA];
    const arr = AIRPORTS[arrIATA];
    if (!dep || !arr) return;

    const key = `${depIATA}-${arrIATA}`;
    if (usedRoutes.has(key)) return;
    usedRoutes.add(key);

    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const flightNum = `${airline.iata}${100 + Math.floor(Math.random() * 900)}`;
    const callsign = `${airline.icao}${100 + Math.floor(Math.random() * 900)}`;

    // Random cruise altitude between 28,000 and 41,000 ft
    const cruiseAltFt = 28000 + Math.floor(Math.random() * 13000);
    const cruiseAltM = Math.round(cruiseAltFt / 3.28084);

    // Random speed between 400-550 knots
    const speedKts = 400 + Math.floor(Math.random() * 150);
    const speedMs = Math.round(speedKts / 1.94384);

    // Duration based on distance
    const dLat = arr.lat - dep.lat;
    const dLng = arr.lon - dep.lon;
    const distDeg = Math.hypot(dLat, dLng);
    const durationSec = Math.max(1800, Math.round(distDeg * 450)); // rough: ~450 sec per degree

    // Random start offset so flights aren't all at the same phase
    const phaseOffset = Math.random() * durationSec;

    flights.push({
      id: `GF${String(++flightIdCounter).padStart(4, '0')}`,
      callsign,
      flightNum,
      airline: airline.name,
      iata: airline.iata,
      icao: airline.icao,
      depIATA,
      arrIATA,
      cruiseAltM,
      cruiseAltFt,
      speedMs,
      speedKts,
      durationSec,
      phaseOffset,
      dep,
      arr,
    });
  });

  return flights;
}

// Singleton — generate once
let _allFlights = null;
function getAllFlightDefs() {
  if (!_allFlights) _allFlights = generateFlights();
  return _allFlights;
}

/**
 * Calculate current position for a flight based on wall-clock time.
 * Returns { lat, lng, heading, altM, altFt, speedMs, speedKts, status, progress }
 */
function getFlightState(def) {
  const nowSec = Date.now() / 1000;
  const phase = (nowSec + def.phaseOffset) % def.durationSec;
  const progress = phase / def.durationSec;

  // Altitude curve: climb → cruise → descend
  let altM;
  const climbFrac = 0.12, descendFrac = 0.88;
  if (progress < climbFrac) {
    altM = Math.round((progress / climbFrac) * def.cruiseAltM);
  } else if (progress > descendFrac) {
    altM = Math.round(((1 - progress) / (1 - descendFrac)) * def.cruiseAltM);
  } else {
    altM = def.cruiseAltM;
  }
  altM = Math.max(100, altM);

  // Speed curve
  let speedMs;
  if (progress < 0.03) speedMs = Math.round(def.speedMs * (progress / 0.03));
  else if (progress > 0.97) speedMs = Math.round(def.speedMs * ((1 - progress) / 0.03));
  else speedMs = def.speedMs;
  speedMs = Math.max(40, speedMs);

  const onGround = altM < 80;
  const status = progress < 0.01 ? 'departed' : progress > 0.99 ? 'landed' : 'en_route';

  // Position along great-circle
  const pos = greatCirclePoint([def.dep.lat, def.dep.lon], [def.arr.lat, def.arr.lon], progress);

  // Heading
  const nextFrac = Math.min(1, progress + 0.0008);
  const nextPt = greatCirclePoint([def.dep.lat, def.dep.lon], [def.arr.lat, def.arr.lon], nextFrac);
  const heading = greatCircleBearing(pos, nextPt);

  return {
    ...def,
    position: { lat: pos[0], lng: pos[1] },
    heading: Math.round(heading),
    altitudeMeters: altM,
    altitudeFeet: Math.round(altM * 3.28084),
    velocity: speedMs,
    status,
    progress,
    onGround,
    lastUpdated: Math.floor(nowSec),
  };
}

/**
 * Get all current flight states (for the radar page).
 */
export function getAllFlights() {
  return getAllFlightDefs().map(getFlightState);
}

/**
 * Get a single flight by ID.
 */
export function getFlightById(id) {
  const def = getAllFlightDefs().find(f => f.id === id);
  return def ? getFlightState(def) : null;
}

/**
 * Get all unique airlines in the simulation.
 */
export function getAirlines() {
  return [...new Set(getAllFlightDefs().map(f => f.airline))].sort();
}

/**
 * Filter flights by query (callsign, flight number, airline, route).
 */
export function filterFlights(flights, query) {
  if (!query) return flights;
  const q = query.toLowerCase();
  return flights.filter(f =>
    f.callsign.toLowerCase().includes(q) ||
    f.flightNum.toLowerCase().includes(q) ||
    f.airline.toLowerCase().includes(q) ||
    f.depIATA.toLowerCase().includes(q) ||
    f.arrIATA.toLowerCase().includes(q)
  );
}
