// ── Expanded mock flight database for search, booking, dashboard ──
// Each flight has realistic pricing, times, and details.

export const MOCK_FLIGHTS = [
  { id: 'FL001', airline: 'United Airlines', iata: 'UA', flightNum: 'UA123', callsign: 'UAL123', from: 'EWR', to: 'LHR', depTime: '08:30', arrTime: '20:45', duration: '7h 15m', price: 487, stops: 0, aircraft: 'Boeing 787-9', class: 'Economy', seatsLeft: 42, rating: 4.3 },
  { id: 'FL002', airline: 'British Airways', iata: 'BA', flightNum: 'BA249', callsign: 'BAW249', from: 'LHR', to: 'JFK', depTime: '10:15', arrTime: '13:30', duration: '8h 15m', price: 523, stops: 0, aircraft: 'Airbus A380', class: 'Economy', seatsLeft: 28, rating: 4.5 },
  { id: 'FL003', airline: 'Lufthansa', iata: 'LH', flightNum: 'LH400', callsign: 'DLH400', from: 'FRA', to: 'DXB', depTime: '14:00', arrTime: '22:30', duration: '6h 30m', price: 412, stops: 0, aircraft: 'Boeing 747-8', class: 'Economy', seatsLeft: 55, rating: 4.4 },
  { id: 'FL004', airline: 'Emirates', iata: 'EK', flightNum: 'EK202', callsign: 'UAE202', from: 'DXB', to: 'JFK', depTime: '02:30', arrTime: '08:45', duration: '14h 15m', price: 687, stops: 0, aircraft: 'Airbus A380', class: 'Economy', seatsLeft: 18, rating: 4.7 },
  { id: 'FL005', airline: 'Singapore Airlines', iata: 'SQ', flightNum: 'SQ321', callsign: 'SIA321', from: 'SIN', to: 'LHR', depTime: '23:45', arrTime: '06:30', duration: '13h 45m', price: 745, stops: 0, aircraft: 'Airbus A350-900', class: 'Economy', seatsLeft: 31, rating: 4.8 },
  { id: 'FL006', airline: 'Qantas', iata: 'QF', flightNum: 'QF12', callsign: 'QFA12', from: 'SYD', to: 'LAX', depTime: '11:00', arrTime: '06:30', duration: '13h 30m', price: 812, stops: 0, aircraft: 'Boeing 787-9', class: 'Economy', seatsLeft: 22, rating: 4.5 },
  { id: 'FL007', airline: 'Delta', iata: 'DL', flightNum: 'DL456', callsign: 'DAL456', from: 'ATL', to: 'LHR', depTime: '17:30', arrTime: '06:15', duration: '8h 45m', price: 498, stops: 0, aircraft: 'Airbus A330-300', class: 'Economy', seatsLeft: 37, rating: 4.2 },
  { id: 'FL008', airline: 'Air France', iata: 'AF', flightNum: 'AF007', callsign: 'AFR007', from: 'CDG', to: 'JFK', depTime: '13:30', arrTime: '16:00', duration: '8h 30m', price: 445, stops: 0, aircraft: 'Boeing 777-300ER', class: 'Economy', seatsLeft: 44, rating: 4.3 },
  { id: 'FL009', airline: 'Cathay Pacific', iata: 'CX', flightNum: 'CX888', callsign: 'CPA888', from: 'HKG', to: 'JFK', depTime: '09:00', arrTime: '15:30', duration: '15h 30m', price: 678, stops: 0, aircraft: 'Airbus A350-1000', class: 'Economy', seatsLeft: 26, rating: 4.6 },
  { id: 'FL010', airline: 'Turkish Airlines', iata: 'TK', flightNum: 'TK001', callsign: 'THY001', from: 'IST', to: 'JFK', depTime: '07:15', arrTime: '12:00', duration: '10h 45m', price: 389, stops: 0, aircraft: 'Boeing 777-300ER', class: 'Economy', seatsLeft: 51, rating: 4.4 },
  { id: 'FL011', airline: 'Qatar Airways', iata: 'QR', flightNum: 'QR701', callsign: 'QTR701', from: 'DOH', to: 'JFK', depTime: '01:00', arrTime: '07:30', duration: '13h 30m', price: 567, stops: 0, aircraft: 'Airbus A350-1000', class: 'Economy', seatsLeft: 33, rating: 4.7 },
  { id: 'FL012', airline: 'KLM', iata: 'KL', flightNum: 'KL641', callsign: 'KLM641', from: 'AMS', to: 'JFK', depTime: '10:45', arrTime: '13:15', duration: '8h 30m', price: 432, stops: 0, aircraft: 'Boeing 787-10', class: 'Economy', seatsLeft: 41, rating: 4.3 },
  { id: 'FL013', airline: 'American Airlines', iata: 'AA', flightNum: 'AA100', callsign: 'AAL100', from: 'JFK', to: 'LHR', depTime: '18:00', arrTime: '06:15', duration: '7h 15m', price: 512, stops: 0, aircraft: 'Boeing 777-200ER', class: 'Economy', seatsLeft: 39, rating: 4.1 },
  { id: 'FL014', airline: 'ANA', iata: 'NH', flightNum: 'NH110', callsign: 'ANA110', from: 'HND', to: 'JFK', depTime: '10:45', arrTime: '10:30', duration: '12h 45m', price: 623, stops: 0, aircraft: 'Boeing 777-300ER', class: 'Economy', seatsLeft: 29, rating: 4.6 },
  { id: 'FL015', airline: 'Korean Air', iata: 'KE', flightNum: 'KE081', callsign: 'KAL081', from: 'ICN', to: 'JFK', depTime: '10:00', arrTime: '10:30', duration: '14h 30m', price: 598, stops: 0, aircraft: 'Boeing 747-8', class: 'Economy', seatsLeft: 35, rating: 4.4 },
  { id: 'FL016', airline: 'United Airlines', iata: 'UA', flightNum: 'UA890', callsign: 'UAL890', from: 'SFO', to: 'HND', depTime: '11:30', arrTime: '15:00', duration: '12h 30m', price: 756, stops: 0, aircraft: 'Boeing 787-9', class: 'Economy', seatsLeft: 19, rating: 4.3 },
  { id: 'FL017', airline: 'Delta', iata: 'DL', flightNum: 'DL201', callsign: 'DAL201', from: 'JFK', to: 'CDG', depTime: '19:30', arrTime: '08:45', duration: '7h 15m', price: 478, stops: 0, aircraft: 'Airbus A330-900neo', class: 'Economy', seatsLeft: 48, rating: 4.2 },
  { id: 'FL018', airline: 'Air Canada', iata: 'AC', flightNum: 'AC870', callsign: 'ACA870', from: 'YYZ', to: 'LHR', depTime: '20:00', arrTime: '08:00', duration: '7h 0m', price: 467, stops: 0, aircraft: 'Boeing 787-9', class: 'Economy', seatsLeft: 36, rating: 4.1 },
  { id: 'FL019', airline: 'JetBlue', iata: 'B6', flightNum: 'B61623', callsign: 'JBU1623', from: 'JFK', to: 'LAX', depTime: '07:00', arrTime: '10:15', duration: '6h 15m', price: 289, stops: 0, aircraft: 'Airbus A321neo', class: 'Economy', seatsLeft: 62, rating: 4.0 },
  { id: 'FL020', airline: 'Southwest', iata: 'WN', flightNum: 'WN3456', callsign: 'SWA3456', from: 'DEN', to: 'LAX', depTime: '14:30', arrTime: '16:00', duration: '2h 30m', price: 178, stops: 0, aircraft: 'Boeing 737 MAX 8', class: 'Economy', seatsLeft: 78, rating: 3.9 },
  { id: 'FL021', airline: 'Emirates', iata: 'EK', flightNum: 'EK502', callsign: 'UAE502', from: 'DXB', to: 'BOM', depTime: '09:00', arrTime: '13:30', duration: '3h 0m', price: 312, stops: 0, aircraft: 'Boeing 777-300ER', class: 'Economy', seatsLeft: 54, rating: 4.5 },
  { id: 'FL022', airline: 'Lufthansa', iata: 'LH', flightNum: 'LH760', callsign: 'DLH760', from: 'FRA', to: 'DEL', depTime: '12:00', arrTime: '23:30', duration: '8h 0m', price: 534, stops: 0, aircraft: 'Airbus A350-900', class: 'Economy', seatsLeft: 43, rating: 4.3 },
  { id: 'FL023', airline: 'British Airways', iata: 'BA', flightNum: 'BA117', callsign: 'BAW117', from: 'LHR', to: 'JFK', depTime: '08:00', arrTime: '11:15', duration: '8h 15m', price: 556, stops: 0, aircraft: 'Boeing 777-300ER', class: 'Business', seatsLeft: 12, rating: 4.6 },
  { id: 'FL024', airline: 'Virgin Atlantic', iata: 'VS', flightNum: 'VS025', callsign: 'VIR025', from: 'LHR', to: 'MIA', depTime: '11:00', arrTime: '16:00', duration: '10h 0m', price: 502, stops: 0, aircraft: 'Airbus A350-1000', class: 'Economy', seatsLeft: 28, rating: 4.4 },
  { id: 'FL025', airline: 'Etihad', iata: 'EY', flightNum: 'EY101', callsign: 'ETD101', from: 'AUH', to: 'JFK', depTime: '03:00', arrTime: '09:30', duration: '14h 30m', price: 612, stops: 0, aircraft: 'Boeing 787-9', class: 'Economy', seatsLeft: 24, rating: 4.5 },
  { id: 'FL026', airline: 'Swiss', iata: 'LX', flightNum: 'LX016', callsign: 'SWR016', from: 'ZRH', to: 'JFK', depTime: '10:00', arrTime: '13:00', duration: '9h 0m', price: 478, stops: 0, aircraft: 'Airbus A330-300', class: 'Economy', seatsLeft: 38, rating: 4.5 },
  { id: 'FL027', airline: 'Finnair', iata: 'AY', flightNum: 'AY005', callsign: 'FIN005', from: 'HEL', to: 'JFK', depTime: '14:00', arrTime: '16:00', duration: '9h 0m', price: 502, stops: 0, aircraft: 'Airbus A350-900', class: 'Economy', seatsLeft: 31, rating: 4.3 },
  { id: 'FL028', airline: 'Iberia', iata: 'IB', flightNum: 'IB6251', callsign: 'IBE6251', from: 'MAD', to: 'JFK', depTime: '12:30', arrTime: '15:00', duration: '8h 30m', price: 445, stops: 0, aircraft: 'Airbus A330-200', class: 'Economy', seatsLeft: 44, rating: 4.2 },
  { id: 'FL029', airline: 'Aeromexico', iata: 'AM', flightNum: 'AM404', callsign: 'AMX404', from: 'MEX', to: 'JFK', depTime: '08:00', arrTime: '14:00', duration: '5h 0m', price: 345, stops: 0, aircraft: 'Boeing 787-8', class: 'Economy', seatsLeft: 49, rating: 4.0 },
  { id: 'FL030', airline: 'LATAM', iata: 'LA', flightNum: 'LA800', callsign: 'LAN800', from: 'GRU', to: 'MIA', depTime: '23:00', arrTime: '06:00', duration: '8h 0m', price: 567, stops: 0, aircraft: 'Boeing 777-300ER', class: 'Economy', seatsLeft: 27, rating: 4.1 },
];

export function searchFlights(query = '', filters = {}) {
  let results = [...MOCK_FLIGHTS];
  const q = query.trim().toLowerCase();

  if (q) {
    results = results.filter(f =>
      f.flightNum.toLowerCase().includes(q) ||
      f.callsign.toLowerCase().includes(q) ||
      f.airline.toLowerCase().includes(q) ||
      f.from.toLowerCase().includes(q) ||
      f.to.toLowerCase().includes(q) ||
      f.aircraft.toLowerCase().includes(q)
    );
  }

  if (filters.maxPrice) results = results.filter(f => f.price <= filters.maxPrice);
  if (filters.stops !== undefined && filters.stops !== '') results = results.filter(f => f.stops === Number(filters.stops));
  if (filters.airline) results = results.filter(f => f.airline === filters.airline);
  if (filters.from) results = results.filter(f => f.from === filters.from);
  if (filters.to) results = results.filter(f => f.to === filters.to);

  // Sort
  const sort = filters.sort || 'price';
  results.sort((a, b) => {
    if (sort === 'price') return a.price - b.price;
    if (sort === 'duration') return a.duration.localeCompare(b.duration);
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'departure') return a.depTime.localeCompare(b.depTime);
    return 0;
  });

  return results;
}

export function getFlightById(id) {
  return MOCK_FLIGHTS.find(f => f.id === id) || null;
}

export function getUniqueAirlines() {
  return [...new Set(MOCK_FLIGHTS.map(f => f.airline))].sort();
}

export function getUniqueAirports() {
  const from = new Set(MOCK_FLIGHTS.map(f => f.from));
  const to = new Set(MOCK_FLIGHTS.map(f => f.to));
  return [...new Set([...from, ...to])].sort();
}
