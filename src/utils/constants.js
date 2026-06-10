// ── Flight status enums ──
export const FLIGHT_STATUS = {
  EN_ROUTE: 'en_route',
  LANDED: 'landed',
  DEPARTED: 'departed',
  SCHEDULED: 'scheduled',
  CANCELLED: 'cancelled',
  DIVERTED: 'diverted',
  UNKNOWN: 'unknown',
};

// ── Status display config ──
export const STATUS_DISPLAY = {
  [FLIGHT_STATUS.EN_ROUTE]: { label: 'En Route', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', dot: 'bg-blue-500' },
  [FLIGHT_STATUS.LANDED]: { label: 'Landed', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', dot: 'bg-green-500' },
  [FLIGHT_STATUS.DEPARTED]: { label: 'Departed', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950', dot: 'bg-amber-500' },
  [FLIGHT_STATUS.SCHEDULED]: { label: 'Scheduled', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950', dot: 'bg-purple-500' },
  [FLIGHT_STATUS.CANCELLED]: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', dot: 'bg-red-500' },
  [FLIGHT_STATUS.DIVERTED]: { label: 'Diverted', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950', dot: 'bg-orange-500' },
  [FLIGHT_STATUS.UNKNOWN]: { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', dot: 'bg-gray-400' },
};

// ── IATA → ICAO airline code mapping (2-letter → 3-letter) ──
export const AIRLINE_CODES = {
  AA: 'AAL', DL: 'DAL', UA: 'UAL', BA: 'BAW', LH: 'DLH',
  AF: 'AFR', KL: 'KLM', EK: 'UAE', QR: 'QTR', SQ: 'SIA',
  CX: 'CPA', QF: 'QFA', NH: 'ANA', JL: 'JAL', KE: 'KAL',
  TK: 'THY', SU: 'AFL', CA: 'CCA', MU: 'CES', CZ: 'CSN',
  WN: 'SWA', B6: 'JBU', AS: 'ASA', NK: 'NKS', F9: 'FFT',
  HA: 'HAL', AC: 'ACA', WS: 'WJA', FR: 'RYR', U2: 'EZY',
  EI: 'EIN', IB: 'IBE', AZ: 'ITY', OS: 'AUA', SK: 'SAS',
  AY: 'FIN', LO: 'LOT', TP: 'TAP', LX: 'SWR', SN: 'BEL',
  EI: 'EIN', VY: 'VLG', W6: 'WZZ', DY: 'NOZ', SK: 'SAS',
  ET: 'ETH', MS: 'MSR', AT: 'RAM', TU: 'TAR', AH: 'DAH',
};

// ── Common airport data (IATA → { name, city, country, lat, lon }) ──
export const AIRPORTS = {
  JFK: { name: 'John F. Kennedy International', city: 'New York', country: 'USA', lat: 40.6413, lon: -73.7781 },
  LAX: { name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', lat: 33.9416, lon: -118.4085 },
  ORD: { name: 'O\'Hare International', city: 'Chicago', country: 'USA', lat: 41.9742, lon: -87.9073 },
  DFW: { name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', lat: 32.8998, lon: -97.0403 },
  DEN: { name: 'Denver International', city: 'Denver', country: 'USA', lat: 39.8561, lon: -104.6737 },
  ATL: { name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', country: 'USA', lat: 33.6407, lon: -84.4277 },
  SFO: { name: 'San Francisco International', city: 'San Francisco', country: 'USA', lat: 37.6213, lon: -122.3790 },
  SEA: { name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', lat: 47.4502, lon: -122.3088 },
  MIA: { name: 'Miami International', city: 'Miami', country: 'USA', lat: 25.7959, lon: -80.2870 },
  BOS: { name: 'Logan International', city: 'Boston', country: 'USA', lat: 42.3656, lon: -71.0096 },
  LHR: { name: 'Heathrow', city: 'London', country: 'UK', lat: 51.4700, lon: -0.4543 },
  CDG: { name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479 },
  FRA: { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622 },
  DXB: { name: 'Dubai International', city: 'Dubai', country: 'UAE', lat: 25.2532, lon: 55.3657 },
  HND: { name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798 },
  SIN: { name: 'Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915 },
  HKG: { name: 'Hong Kong International', city: 'Hong Kong', country: 'China', lat: 22.3080, lon: 113.9185 },
  SYD: { name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lon: 151.1753 },
  AMS: { name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683 },
  MAD: { name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', lat: 40.4983, lon: -3.5676 },
  ICN: { name: 'Incheon International', city: 'Seoul', country: 'South Korea', lat: 37.4602, lon: 126.4407 },
  DOH: { name: 'Hamad International', city: 'Doha', country: 'Qatar', lat: 25.2731, lon: 51.6081 },
  IST: { name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lon: 28.7519 },
  GRU: { name: 'São Paulo–Guarulhos', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lon: -46.4731 },
  MEX: { name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lon: -99.0721 },
  YYZ: { name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', lat: 43.6777, lon: -79.6248 },
  BOM: { name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656 },
  DEL: { name: 'Indira Gandhi International', city: 'Delhi', country: 'India', lat: 28.5562, lon: 77.1000 },
  PEK: { name: 'Beijing Capital International', city: 'Beijing', country: 'China', lat: 40.0799, lon: 116.6031 },
  PVG: { name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China', lat: 31.1443, lon: 121.8083 },
};

// ── Polling & map config ──
export const POLL_INTERVAL_MS = 15000;          // 15 seconds between position updates
export const MAP_DEFAULT_ZOOM = 5;
export const MAP_DEFAULT_CENTER = [30, 0];      // Shows Europe/Africa/Asia
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 2000;

// ── Cache keys ──
export const CACHE_KEY_LAST_FLIGHT = 'ft_last_flight';
