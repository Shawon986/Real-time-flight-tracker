import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookings, useBookingDispatch } from '../context/BookingContext';
import PageTransition from '../components/ui/PageTransition';
import { staggerContainer, staggerItem } from '../utils/animations';
import { AIRPORTS } from '../utils/constants';

export default function MyBookingsPage() {
  const bookings = useBookings();
  const dispatch = useBookingDispatch();

  const cancelBooking = (id) => {
    dispatch({ type: 'CANCEL', id });
  };

  const confirmed = bookings.filter(b => b.status !== 'cancelled');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">My Bookings</h2>
          <Link
            to="/search"
            className="px-5 py-2.5 text-sm font-bold rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all"
          >
            + Book New Flight
          </Link>
        </div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">No bookings yet</h3>
            <p className="text-gray-400 mt-1 mb-6">Book a flight to see it here</p>
            <Link to="/search" className="text-primary-600 hover:underline font-bold">Browse Flights →</Link>
          </motion.div>
        ) : (
          <>
            {/* Active bookings */}
            {confirmed.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Active ({confirmed.length})
                </h3>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  <AnimatePresence>
                    {confirmed.map(b => {
                      const depAirport = AIRPORTS[b.from];
                      const arrAirport = AIRPORTS[b.to];
                      return (
                        <motion.div
                          key={b.id}
                          variants={staggerItem}
                          layout
                          exit={{ opacity: 0, x: -100 }}
                          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-5"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100">{b.airline} — {b.flightNum}</p>
                                <p className="text-sm text-gray-400">
                                  {b.from} ({depAirport?.city || ''}) → {b.to} ({arrAirport?.city || ''})
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{b.date} • {b.depTime} – {b.arrTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg font-black text-gray-900 dark:text-gray-100">${b.price}</p>
                                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded-full">
                                  {b.status}
                                </span>
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => cancelBooking(b.id)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </div>
                          {b.seats?.length > 0 && (
                            <p className="text-xs text-gray-400 mt-2">Seats: {b.seats.join(', ')}</p>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Cancelled bookings */}
            {cancelled.length > 0 && (
              <div className="opacity-60">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Cancelled ({cancelled.length})
                </h3>
                <div className="space-y-3">
                  {cancelled.map(b => (
                    <div key={b.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/30">
                      <div className="flex justify-between">
                        <p className="font-bold text-gray-500 line-through">{b.airline} — {b.flightNum}</p>
                        <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full uppercase">Cancelled</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
