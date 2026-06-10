import { normalizeFlightState, expandCallsign, greatCirclePoint, greatCircleBearing } from '../utils/formatters';
import { AIRPORTS, POLL_INTERVAL_MS, MAX_RETRIES, RETRY_DELAY_MS } from '../utils/constants';

const BASE_URL = 'https://opensky-network.org/api';

/**
 * Simple in-memory cache for last successful response.
 */
let stateCache = {
  timestamp: 0,
  states: [],
};

/**
 * Fetch all current flight states from OpenSky.
 * Returns raw state vectors array.
 */
async function fetchAllStates(retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `${BASE_URL}/states/all`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMITED');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      stateCache = {
        timestamp: data.time || Date.now() / 1000,
        states: data.states || [],
      };
      return data.states || [];
    } catch (err) {
      if (err.message === 'RATE_LIMITED' && attempt < retries) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }
  }
}

/**
 * Search for a flight by callsign (flight number).
 * Returns normalized flight state or null if not found.
 */
export async function searchFlight(callsign) {
  if (!callsign || callsign.trim().length < 3) {
    return { found: false, error: 'Please enter at least 3 characters' };
  }

  const variants = expandCallsign(callsign);
  if (variants.length === 0) {
    return { found: false, error: 'Invalid flight number format' };
  }

  try {
    const states = await fetchAllStates();
    return findFlightInStates(states, variants);
  } catch (err) {
    console.error('OpenSky API error:', err.message);
    return {
      found: false,
      error: err.message === 'RATE_LIMITED'
        ? 'API rate limit reached. Please wait a moment and try again.'
        : `Unable to fetch flight data: ${err.message}`,
    };
  }
}

/**
 * Search state vectors for matching callsign variants.
 */
function findFlightInStates(states, variants) {
  const variantSet = new Set(variants.map(v => v.trim().toUpperCase()));

  for (const stateVector of states) {
    const callsign = (stateVector[1] || '').trim().toUpperCase();
    if (variantSet.has(callsign)) {
      const flight = normalizeFlightState(stateVector, callsign);
      if (flight && flight.position.lat !== null && flight.position.lng !== null) {
        return { found: true, flight, allVariants: states };
      }
    }
  }

  return {
    found: false,
    error: `Flight "${variants[0]}" not found. The aircraft may be out of coverage or on the ground with transponder off.`,
  };
}

/**
 * Get flight track history for an aircraft by its ICAO24 address.
 */
export async function getFlightTrack(icao24) {
  if (!icao24) return [];

  try {
    const now = Math.floor(Date.now() / 1000);
    const begin = now - 7200; // Last 2 hours
    const url = `${BASE_URL}/tracks/all?icao24=${icao24}&time=0`;

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return [];
    const data = await response.json();

    // Extract path points from track data
    if (data && data.path) {
      return data.path.map(point => ({
        lat: point[1],
        lng: point[2],
        altitude: point[3] || null,
        time: point[0] || null,
      }));
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch flight track:', err.message);
    return [];
  }
}

/**
 * Get cached states (used for tracking multiple flights without re-fetching).
 */
export function getCachedStates() {
  return stateCache;
}

/**
 * Utility: sleep/delay.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Simulated live flights for demo mode ──
// Each flight follows a great-circle route between real airports.
// The position advances based on elapsed wall-clock time, so the plane
// visibly moves across the map every time the polling interval fires.

function getAirportCoord(iata) {
  const a = AIRPORTS[iata];
  return a ? [a.lat, a.lon] : null;
}

const MOCK_FLIGHT_DEFS = [
  {
    callsigns: ['UAL123', 'UAL123'],
    icao24: 'a1b2c3',
    originCountry: 'United States',
    depIATA: 'EWR', arrIATA: 'LHR',
    cruiseAltM: 10058, cruiseSpeedMs: 252,
    durationSec: 25200,  // ~7 hours EWR → LHR
  },
  {
    callsigns: ['BAW249', 'BA249'],
    icao24: 'd4e5f6',
    originCountry: 'United Kingdom',
    depIATA: 'LHR', arrIATA: 'JFK',
    cruiseAltM: 11582, cruiseSpeedMs: 258,
    durationSec: 28800,  // ~8 hours LHR → JFK
  },
  {
    callsigns: ['DLH400', 'LH400'],
    icao24: 'g7h8i9',
    originCountry: 'Germany',
    depIATA: 'FRA', arrIATA: 'DXB',
    cruiseAltM: 10363, cruiseSpeedMs: 240,
    durationSec: 21600,  // ~6 hours FRA → DXB
  },
  {
    callsigns: ['EZY8523', 'U28523'],
    icao24: 'j1k2l3',
    originCountry: 'United Kingdom',
    depIATA: 'LGW', arrIATA: 'CDG',
    cruiseAltM: 0, cruiseSpeedMs: 0,
    durationSec: 3600,   // Short-haul (landed — stays at CDG)
    landed: true,
  },
  {
    callsigns: ['UAE202', 'EK202'],
    icao24: 'm3n4o5',
    originCountry: 'United Arab Emirates',
    depIATA: 'DXB', arrIATA: 'JFK',
    cruiseAltM: 11582, cruiseSpeedMs: 255,
    durationSec: 46800,  // ~13 hours DXB → JFK
  },
  {
    callsigns: ['SIA321', 'SQ321'],
    icao24: 'p6q7r8',
    originCountry: 'Singapore',
    depIATA: 'SIN', arrIATA: 'LHR',
    cruiseAltM: 11278, cruiseSpeedMs: 250,
    durationSec: 45000,  // ~12.5 hours SIN → LHR
  },
  {
    callsigns: ['QFA12', 'QF12'],
    icao24: 's9t0u1',
    originCountry: 'Australia',
    depIATA: 'SYD', arrIATA: 'LAX',
    cruiseAltM: 10973, cruiseSpeedMs: 248,
    durationSec: 50400,  // ~14 hours SYD → LAX
  },
  {
    callsigns: ['DAL456', 'DL456'],
    icao24: 'v2w3x4',
    originCountry: 'United States',
    depIATA: 'ATL', arrIATA: 'LHR',
    cruiseAltM: 10668, cruiseSpeedMs: 250,
    durationSec: 28800,
  },
];

/**
 * Build a single live flight state from its definition.
 * Position is calculated from wall-clock time so the plane advances
 * on every poll.
 */
function buildLiveFlight(def) {
  const dep = getAirportCoord(def.depIATA);
  const arr = getAirportCoord(def.arrIATA);
  const nowSec = Date.now() / 1000;

  if (!dep || !arr) return null;

  let fraction, pos, heading, status, alt, speed, onGround;

  if (def.landed) {
    // Parked at arrival
    pos = arr;
    heading = 0;
    status = 'landed';
    alt = 0;
    speed = 0;
    onGround = true;
  } else {
    // Use wall-clock time to determine position along the great-circle route.
    // Seed each flight at a different offset so they aren't all at the same phase.
    const seed = def.icao24.charCodeAt(0) + def.icao24.charCodeAt(1) * 31;
    const phase = (nowSec + seed * 137) % def.durationSec;
    fraction = phase / def.durationSec;

    // Add altitude curve — climb to cruise, cruise, then descend
    const climbFrac = 0.15, descendFrac = 0.85;
    if (fraction < climbFrac) {
      alt = Math.round((fraction / climbFrac) * def.cruiseAltM);
    } else if (fraction > descendFrac) {
      alt = Math.round(((1 - fraction) / (1 - descendFrac)) * def.cruiseAltM);
    } else {
      alt = def.cruiseAltM;
    }
    alt = Math.max(0, alt);

    speed = fraction < 0.05
      ? Math.round(def.cruiseSpeedMs * (fraction / 0.05))
      : fraction > 0.95
        ? Math.round(def.cruiseSpeedMs * ((1 - fraction) / 0.05))
        : def.cruiseSpeedMs;
    speed = Math.max(30, speed);

    onGround = alt < 50;
    status = fraction < 0.02 ? 'departed'
      : fraction > 0.98 ? 'landed'
      : 'en_route';

    // Current position along great-circle
    pos = greatCirclePoint(dep, arr, fraction);

    // Heading toward next point slightly ahead
    const nextFrac = Math.min(1, fraction + 0.001);
    const nextPt = greatCirclePoint(dep, arr, nextFrac);
    heading = greatCircleBearing(pos, nextPt);
  }

  const displayCallsign = def.callsigns[0].trim();

  return {
    icao24: def.icao24,
    callsign: displayCallsign,
    originCountry: def.originCountry,
    timePosition: Math.floor(nowSec),
    lastContact: Math.floor(nowSec),
    position: { lat: pos[0], lng: pos[1] },
    altitude: alt,
    altitudeMeters: alt,
    altitudeFeet: Math.round(alt * 3.28084),
    onGround,
    velocity: speed,
    velocityKmh: Math.round(speed * 3.6),
    velocityKnots: Math.round(speed * 1.94384),
    heading: Math.round(heading),
    verticalRate: status === 'en_route' ? 0 : (fraction < 0.5 ? 3 : -3),
    status,
    departure: def.depIATA,
    arrival: def.arrIATA,
    squawk: '1200',
    positionSource: 0,
    _mock: true,
  };
}

// Cache built flights for ~1 second to avoid jitter between rapid calls
const mockCache = new Map();
const MOCK_CACHE_TTL = 1000;

/**
 * Get mock flight data — flights MOVE in real time along their routes.
 */
export function getMockFlight(callsign) {
  const cleaned = callsign.trim().toUpperCase();

  // Check cache first
  const cached = mockCache.get(cleaned);
  if (cached && Date.now() - cached.ts < MOCK_CACHE_TTL) {
    return { found: true, flight: { ...cached.flight } };
  }

  // Search for matching flight definition
  let def = null;
  for (const d of MOCK_FLIGHT_DEFS) {
    if (d.callsigns.some(c => c.trim().toUpperCase() === cleaned)) {
      def = d;
      break;
    }
  }

  // Partial match
  if (!def) {
    def = MOCK_FLIGHT_DEFS.find(d =>
      d.callsigns.some(c => c.trim().toUpperCase().includes(cleaned))
    ) || null;
  }

  if (def) {
    const flight = buildLiveFlight(def);
    if (flight) {
      mockCache.set(cleaned, { flight, ts: Date.now() });
      return { found: true, flight: { ...flight } };
    }
  }

  // Unknown flight — generate a one-off simulated route
  const match = cleaned.match(/^([A-Z]+)(\d+)$/);
  if (match) {
    const airportCodes = Object.keys(AIRPORTS);
    const depIATA = airportCodes[Math.floor(Math.random() * airportCodes.length)];
    let arrIATA = airportCodes[Math.floor(Math.random() * airportCodes.length)];
    while (arrIATA === depIATA) arrIATA = airportCodes[Math.floor(Math.random() * airportCodes.length)];

    const fakeDef = {
      callsigns: [cleaned],
      icao24: Math.random().toString(16).slice(2, 8),
      originCountry: 'Unknown',
      depIATA, arrIATA,
      cruiseAltM: 9000 + Math.random() * 3000,
      cruiseSpeedMs: 220 + Math.random() * 40,
      durationSec: 7200 + Math.random() * 28800,
    };
    const flight = buildLiveFlight(fakeDef);
    if (flight) {
      flight._mock = true;
      mockCache.set(cleaned, { flight, ts: Date.now() });
      return { found: true, flight: { ...flight } };
    }
  }

  return { found: false, error: 'Flight not found' };
}
