import { createContext, useContext, useReducer, useEffect } from 'react';

const BookingContext = createContext(null);
const BookingDispatch = createContext(null);

const STORAGE_KEY = 'ft_bookings';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function save(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

function reducer(state, action) {
  let next;
  switch (action.type) {
    case 'ADD': {
      const booking = {
        ...action.booking,
        id: `BK${Date.now()}`,
        bookedAt: new Date().toISOString(),
        status: 'confirmed',
      };
      next = [booking, ...state];
      break;
    }
    case 'CANCEL':
      next = state.map(b =>
        b.id === action.id ? { ...b, status: 'cancelled' } : b
      );
      break;
    default:
      return state;
  }
  save(next);
  return next;
}

export function BookingProvider({ children }) {
  const [bookings, dispatch] = useReducer(reducer, [], load);
  useEffect(() => { save(bookings); }, [bookings]);
  return (
    <BookingContext.Provider value={bookings}>
      <BookingDispatch.Provider value={dispatch}>
        {children}
      </BookingDispatch.Provider>
    </BookingContext.Provider>
  );
}

export function useBookings() { return useContext(BookingContext); }
export function useBookingDispatch() { return useContext(BookingDispatch); }
