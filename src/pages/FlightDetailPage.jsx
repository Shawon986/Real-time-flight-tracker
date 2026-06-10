import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFlightById } from '../services/mockFlights';
import { useCartDispatch } from '../context/CartContext';
import { AIRPORTS } from '../utils/constants';
import PageTransition from '../components/ui/PageTransition';
import AnimatedCounter from '../components/ui/AnimatedCounter';

export default function FlightDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cartDispatch = useCartDispatch();
  const flight = getFlightById(id);

  if (!flight) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Flight not found</p>
          <Link to="/search" className="text-primary-600 hover:underline mt-2 inline-block">Back to search</Link>
        </div>
      </PageTransition>
    );
  }

  const depAirport = AIRPORTS[flight.from];
  const arrAirport = AIRPORTS[flight.to];

  const addToCart = () => {
    cartDispatch({ type: 'ADD', item: {
      flightId: flight.id, flightNum: flight.flightNum, airline: flight.airline,
      from: flight.from, to: flight.to, depTime: flight.depTime, arrTime: flight.arrTime,
      duration: flight.duration, price: flight.price, stops: flight.stops, aircraft: flight.aircraft,
    }});
  };

  const bookNow = () => {
    addToCart();
    navigate('/book/' + flight.id);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">{flight.airline}</p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">{flight.flightNum}</h1>
            <p className="text-gray-500 dark:text-gray-400">{flight.aircraft} • {flight.class}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-primary-600 dark:text-primary-400">${flight.price}</p>
            <p className="text-xs text-gray-400">per passenger</p>
          </div>
        </div>

        {/* Route card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{flight.from}</p>
              <p className="text-sm text-gray-400 mt-1">{depAirport?.name || ''}</p>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-2">{flight.depTime}</p>
            </div>

            <div className="flex flex-col items-center px-6 flex-shrink-0">
              <p className="text-sm text-gray-400 font-medium mb-3">{flight.duration}</p>
              <div className="relative w-32">
                <div className="h-px bg-gray-200 dark:bg-gray-600" />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2"
                  animate={{ left: ['0%', '85%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
                </motion.div>
              </div>
              <p className="text-xs text-gray-400 mt-3">{flight.stops === 0 ? 'Direct Flight' : `${flight.stops} Stop`}</p>
            </div>

            <div className="text-center flex-1">
              <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{flight.to}</p>
              <p className="text-sm text-gray-400 mt-1">{arrAirport?.name || ''}</p>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-2">{flight.arrTime}</p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Duration', value: flight.duration },
            { label: 'Aircraft', value: flight.aircraft },
            { label: 'Rating', value: `★ ${flight.rating}/5` },
            { label: 'Seats Left', value: flight.seatsLeft.toString() },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200/60 dark:border-gray-700/40 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={bookNow}
            className="flex-1 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 transition-all"
          >
            Book Now — ${flight.price}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={addToCart}
            className="px-8 py-4 text-lg font-bold rounded-2xl border-2 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-all"
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
}
