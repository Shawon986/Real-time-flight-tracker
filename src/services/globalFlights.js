import { greatCirclePoint, greatCircleBearing } from '../utils/formatters';
import { AIRPORTS } from '../utils/constants';

// 120+ real-world flight routes
const ROUTES = [
  // ── Transatlantic (25 routes) ──
  ['JFK','LHR'],['EWR','LHR'],['JFK','CDG'],['BOS','LHR'],['IAD','FRA'],['ATL','AMS'],
  ['MIA','MAD'],['ORD','LHR'],['YYZ','LHR'],['JFK','FRA'],['LAX','LHR'],['SFO','LHR'],
  ['MIA','LHR'],['DFW','CDG'],['JFK','AMS'],['BOS','CDG'],['IAD','LHR'],['ATL','CDG'],
  ['ORD','FRA'],['JFK','MAD'],['EWR','CDG'],['MIA','FRA'],['SFO','CDG'],['LAX','CDG'],
  ['JFK','ZRH'],

  // ── Transpacific (20 routes) ──
  ['LAX','HND'],['SFO','HND'],['LAX','ICN'],['SFO','ICN'],['SEA','HND'],['LAX','SYD'],
  ['SFO','SYD'],['YVR','HND'],['LAX','SIN'],['SFO','SIN'],['SEA','ICN'],['LAX','PEK'],
  ['SFO','PVG'],['LAX','HKG'],['SFO','HKG'],['YVR','ICN'],['SEA','SIN'],['LAX','BKK'],
  ['SFO','TPE'],['LAX','MNL'],

  // ── Europe ↔ Asia (20 routes) ──
  ['LHR','DXB'],['CDG','DXB'],['FRA','DXB'],['LHR','SIN'],['AMS','DXB'],['LHR','DEL'],
  ['FRA','DEL'],['CDG','BOM'],['LHR','HKG'],['FRA','SIN'],['LHR','BOM'],['AMS','SIN'],
  ['CDG','SIN'],['FRA','HND'],['LHR','ICN'],['CDG','DEL'],['FRA','BKK'],['LHR','PEK'],
  ['AMS','DEL'],['CDG','HKG'],

  // ── Middle East (15 routes) ──
  ['DXB','SIN'],['DXB','BOM'],['DXB','DEL'],['DOH','SIN'],['DXB','IST'],['DXB','JFK'],
  ['DOH','LHR'],['DXB','HKG'],['DXB','SYD'],['AUH','LHR'],['DXB','MNL'],['DOH','JFK'],
  ['DXB','BKK'],['DXB','SGN'],['DXB','NRT'],

  // ── Asia-Pacific (15 routes) ──
  ['SIN','SYD'],['HKG','SYD'],['HND','SYD'],['SIN','HND'],['BKK','HND'],['SIN','ICN'],
  ['HKG','SIN'],['HND','SIN'],['PEK','SYD'],['PVG','SIN'],['SIN','MEL'],['HKG','AKL'],
  ['HND','HKG'],['ICN','BKK'],['SIN','PER'],

  // ── Americas (15 routes) ──
  ['JFK','LAX'],['BOS','SFO'],['MIA','SEA'],['ORD','LAX'],['ATL','SFO'],['DFW','SEA'],
  ['JFK','MIA'],['LAX','MEX'],['SFO','MEX'],['JFK','GRU'],['MIA','GRU'],['ATL','LIM'],
  ['LAX','BOG'],['JFK','SCL'],['MIA','EZE'],

  // ── Europe internal (10 routes) ──
  ['LHR','IST'],['CDG','IST'],['FRA','IST'],['MAD','LHR'],['LHR','AMS'],
  ['CDG','MAD'],['FRA','MAD'],['LHR','FCO'],['CDG','ATH'],['FRA','LIS'],

  // ── Africa (5 routes) ──
  ['LHR','JNB'],['CDG','CAI'],['DXB','JNB'],['IST','CAI'],['FRA','ADD'],
];

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
  { name: 'Swiss', iata: 'LX', icao: 'SWR' },
  { name: 'Finnair', iata: 'AY', icao: 'FIN' },
  { name: 'Iberia', iata: 'IB', icao: 'IBE' },
  { name: 'Aeromexico', iata: 'AM', icao: 'AMX' },
  { name: 'LATAM', iata: 'LA', icao: 'LAN' },
];

let flightIdCounter = 0;

function generateFlights() {
  const flights = [];
  const used = new Set();

  ROUTES.forEach(([depIATA, arrIATA]) => {
    const dep = AIRPORTS[depIATA];
    const arr = AIRPORTS[arrIATA];
    if (!dep || !arr) return;
    const key = `${depIATA}-${arrIATA}`;
    if (used.has(key)) return;
    used.add(key);

    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const num = 100 + Math.floor(Math.random() * 900);
    const flightNum = `${airline.iata}${num}`;
    const callsign = `${airline.icao}${num}`;

    const cruiseAltFt = 28000 + Math.floor(Math.random() * 13000);
    const cruiseAltM = Math.round(cruiseAltFt / 3.28084);
    const speedKts = 400 + Math.floor(Math.random() * 150);
    const speedMs = Math.round(speedKts / 1.94384);

    const dLat = arr.lat - dep.lat;
    const dLon = arr.lon - dep.lon;
    const distDeg = Math.hypot(dLat, dLon);
    const durationSec = Math.max(1800, Math.round(distDeg * 450));

    const phaseOffset = Math.random() * durationSec;

    flights.push({
      id: `GF${String(++flightIdCounter).padStart(4, '0')}`,
      callsign, flightNum, airline: airline.name,
      iata: airline.iata, icao: airline.icao,
      depIATA, arrIATA, cruiseAltM, cruiseAltFt,
      speedMs, speedKts, durationSec, phaseOffset,
      dep, arr,
    });
  });

  return flights;
}

let _allFlights = null;
function getAllFlightDefs() {
  if (!_allFlights) _allFlights = generateFlights();
  return _allFlights;
}

function getFlightState(def) {
  const nowSec = Date.now() / 1000;
  const phase = (nowSec + def.phaseOffset) % def.durationSec;
  const progress = phase / def.durationSec;

  let altM;
  const climb = 0.12, desc = 0.88;
  if (progress < climb) altM = Math.round((progress / climb) * def.cruiseAltM);
  else if (progress > desc) altM = Math.round(((1 - progress) / (1 - desc)) * def.cruiseAltM);
  else altM = def.cruiseAltM;
  altM = Math.max(100, altM);

  let speedMs;
  if (progress < 0.03) speedMs = Math.round(def.speedMs * (progress / 0.03));
  else if (progress > 0.97) speedMs = Math.round(def.speedMs * ((1 - progress) / 0.03));
  else speedMs = def.speedMs;
  speedMs = Math.max(40, speedMs);

  const onGround = altM < 80;
  const status = progress < 0.01 ? 'departed' : progress > 0.99 ? 'landed' : 'en_route';

  const pos = greatCirclePoint([def.dep.lat, def.dep.lon], [def.arr.lat, def.arr.lon], progress);
  const nextFrac = Math.min(1, progress + 0.0008);
  const nextPt = greatCirclePoint([def.dep.lat, def.dep.lon], [def.arr.lat, def.arr.lon], nextFrac);
  const heading = greatCircleBearing(pos, nextPt);

  return {
    ...def,
    position: { lat: pos[0], lng: pos[1] },
    heading: Math.round(heading),
    altitudeMeters: altM, altitudeFeet: Math.round(altM * 3.28084),
    velocity: speedMs, speedKts: Math.round(speedMs * 1.94384),
    status, progress, onGround,
    lastUpdated: Math.floor(nowSec),
  };
}

export function getAllFlights() {
  return getAllFlightDefs().map(getFlightState);
}

export function getFlightById(id) {
  const def = getAllFlightDefs().find(f => f.id === id);
  return def ? getFlightState(def) : null;
}

export function getAirlines() {
  return [...new Set(getAllFlightDefs().map(f => f.airline))].sort();
}

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
