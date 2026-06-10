import { AIRLINE_CODES, AIRPORTS } from './constants';

/**
 * Converts an IATA callsign (AA100) to ICAO format (AAL100).
 * Returns both formats for API search.
 */
export function expandCallsign(callsign) {
  const cleaned = callsign.trim().toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return [];

  const variants = [cleaned];

  // If starts with 2-letter IATA code, add 3-letter ICAO variant
  const iataMatch = cleaned.match(/^([A-Z]{2})(\d+)$/);
  if (iataMatch) {
    const [, iataCode, flightNum] = iataMatch;
    const icaoCode = AIRLINE_CODES[iataCode];
    if (icaoCode) {
      variants.unshift(`${icaoCode}${flightNum}`);
    }
  }

  // If starts with 3-letter code, also try 2-letter reverse
  const icaoMatch = cleaned.match(/^([A-Z]{3})(\d+)$/);
  if (icaoMatch) {
    const [, icaoCode, flightNum] = icaoMatch;
    for (const [iata, icao] of Object.entries(AIRLINE_CODES)) {
      if (icao === icaoCode) {
        variants.push(`${iata}${flightNum}`);
        break;
      }
    }
  }

  return variants;
}

/**
 * Derives flight status from OpenSky state data.
 */
export function deriveStatus(state) {
  if (!state) return 'unknown';
  if (state.on_ground && state.velocity < 10) return 'landed';
  if (state.velocity > 50) return 'en_route';
  if (state.velocity > 5) return 'departed';
  return 'scheduled';
}

/**
 * Converts a raw OpenSky state vector to our internal FlightState format.
 */
export function normalizeFlightState(stateVector, searchedCallsign) {
  if (!stateVector || !Array.isArray(stateVector)) return null;

  const [
    icao24,           // 0  - Unique ICAO 24-bit address
    callsign,         // 1  - Callsign
    origin_country,   // 2  - Country of origin
    time_position,    // 3  - Unix timestamp of last position update
    last_contact,     // 4  - Unix timestamp of last contact
    longitude,        // 5  - WGS-84 longitude
    latitude,         // 6  - WGS-84 latitude
    baro_altitude,    // 7  - Barometric altitude (m)
    on_ground,        // 8  - On ground boolean
    velocity,         // 9  - Velocity (m/s)
    true_track,       // 10 - True track in degrees (0-360)
    vertical_rate,    // 11 - Vertical rate (m/s, +climb -descend)
    sensors,          // 12 - Sensor IDs
    geo_altitude,     // 13 - Geometric altitude (m)
    squawk,           // 14 - Squawk code
    spi,              // 15 - SPI flag
    position_source,  // 16 - Position source
  ] = stateVector;

  const status = deriveStatus({ on_ground: !!on_ground, velocity: velocity || 0 });
  const displayCallsign = (callsign || searchedCallsign || 'N/A').trim();
  const altitude = baro_altitude ?? geo_altitude ?? null;

  // Parse departure/arrival from callsign pattern if available
  const depArr = extractRouteFromCallsign(displayCallsign);

  return {
    icao24: icao24 || '',
    callsign: displayCallsign,
    originCountry: origin_country || '',
    timePosition: time_position || null,
    lastContact: last_contact || null,
    position: {
      lat: latitude ?? null,
      lng: longitude ?? null,
    },
    altitude: altitude !== null ? Math.round(altitude) : null,
    altitudeMeters: altitude !== null ? Math.round(altitude) : null,
    altitudeFeet: altitude !== null ? Math.round(altitude * 3.28084) : null,
    onGround: !!on_ground,
    velocity: velocity !== null ? Math.round(velocity) : null,
    velocityKmh: velocity !== null ? Math.round(velocity * 3.6) : null,
    velocityKnots: velocity !== null ? Math.round(velocity * 1.94384) : null,
    heading: true_track !== null ? Math.round(true_track) : null,
    verticalRate: vertical_rate !== null ? Math.round(vertical_rate) : null,
    status,
    departure: depArr.departure || null,
    arrival: depArr.arrival || null,
    squawk: squawk || null,
    positionSource: position_source || null,
  };
}

/**
 * Try to extract route info from callsign (some airlines encode this).
 * This is a best-effort — OpenSky doesn't provide route data for free.
 */
function extractRouteFromCallsign(callsign) {
  // Most airlines don't encode route in callsign.
  // We return null and let the airport search provide this data.
  return { departure: null, arrival: null };
}

/**
 * Format altitude for display.
 */
export function formatAltitude(meters) {
  if (meters === null || meters === undefined) return 'N/A';
  const feet = Math.round(meters * 3.28084);
  return `${feet.toLocaleString()} ft`;
}

/**
 * Format speed for display.
 */
export function formatSpeed(metersPerSecond) {
  if (metersPerSecond === null || metersPerSecond === undefined) return 'N/A';
  const knots = Math.round(metersPerSecond * 1.94384);
  const kmh = Math.round(metersPerSecond * 3.6);
  return `${knots} kts (${kmh} km/h)`;
}

/**
 * Format heading in degrees with cardinal direction.
 */
export function formatHeading(degrees) {
  if (degrees === null || degrees === undefined) return 'N/A';
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(degrees / 45) % 8;
  return `${Math.round(degrees)}° ${cardinals[idx]}`;
}

/**
 * Format a Unix timestamp to local time string.
 */
export function formatTimestamp(unixSeconds) {
  if (!unixSeconds) return 'N/A';
  return new Date(unixSeconds * 1000).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format time since last update ("30s ago", "2m ago").
 */
export function formatTimeAgo(unixSeconds) {
  if (!unixSeconds) return 'N/A';
  const now = Date.now() / 1000;
  const diff = Math.max(0, now - unixSeconds);
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/**
 * Look up airport info by IATA code.
 */
export function getAirportInfo(iataCode) {
  return AIRPORTS[iataCode?.toUpperCase()] || null;
}

/* ────────────────────────────────────────────
   Great-circle navigation utilities
   ──────────────────────────────────────────── */

/**
 * Interpolate a point along the great circle from start → end.
 * @param {[number,number]} start [lat, lng]
 * @param {[number,number]} end   [lat, lng]
 * @param {number} fraction 0–1
 * @returns {[number,number]} [lat, lng]
 */
export function greatCirclePoint(start, end, fraction) {
  const [lat1, lng1] = [start[0] * Math.PI / 180, start[1] * Math.PI / 180];
  const [lat2, lng2] = [end[0] * Math.PI / 180, end[1] * Math.PI / 180];
  const d = Math.acos(
    Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
  );
  if (Math.abs(d) < 1e-10) return start;
  const a = Math.sin((1 - fraction) * d) / Math.sin(d);
  const b = Math.sin(fraction * d) / Math.sin(d);
  const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
  const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
  const z = a * Math.sin(lat1) + b * Math.sin(lat2);
  return [Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI, Math.atan2(y, x) * 180 / Math.PI];
}

/**
 * Calculate the initial bearing (forward azimuth) from start → end.
 */
export function greatCircleBearing(start, end) {
  const [lat1, lng1] = [start[0] * Math.PI / 180, start[1] * Math.PI / 180];
  const [lat2, lng2] = [end[0] * Math.PI / 180, end[1] * Math.PI / 180];
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

// Re-export for convenience
export { greatCirclePoint as getGreatCirclePosition };

/**
 * Get airline name from callsign.
 */
export function getAirlineFromCallsign(callsign) {
  if (!callsign) return null;
  const code3 = callsign.slice(0, 3);
  const code2 = callsign.slice(0, 2);
  for (const [iata, icao] of Object.entries(AIRLINE_CODES)) {
    if (icao === code3) return { iata, icao };
  }
  // Check if it already starts with IATA code
  if (AIRLINE_CODES[code2]) return { iata: code2, icao: AIRLINE_CODES[code2] };
  return null;
}
