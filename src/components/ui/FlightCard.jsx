import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartDispatch } from '../../context/CartContext';
import { cardHover } from '../../utils/animations';

export default function FlightCard({ flight, index = 0, showBook = true }) {
  const navigate = useNavigate();
  const cartDispatch = useCartDispatch();

  const addToCart = (e) => {
    e.stopPropagation();
    cartDispatch({
      type: 'ADD',
      item: {
        flightId: flight.id,
        flightNum: flight.flightNum,
        airline: flight.airline,
        from: flight.from,
        to: flight.to,
        depTime: flight.depTime,
        arrTime: flight.arrTime,
        duration: flight.duration,
        price: flight.price,
        stops: flight.stops,
        aircraft: flight.aircraft,
      },
    });
  };

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={() => navigate(`/flight/${flight.id}`)}
      className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-5 cursor-pointer overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
    >
      {/* Airline + price header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">{flight.airline}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{flight.flightNum}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-primary-600 dark:text-primary-400">${flight.price}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">{flight.class}</p>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{flight.from}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{flight.depTime}</p>
        </div>
        <div className="flex flex-col items-center px-3">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">{flight.duration}</p>
          <div className="flex items-center gap-1">
            <div className="h-px w-8 bg-gray-200 dark:bg-gray-600" />
            <svg className="w-3.5 h-3.5 text-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
            <div className="h-px w-8 bg-gray-200 dark:bg-gray-600" />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{flight.to}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{flight.arrTime}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{flight.rating}</span>
          <span className="text-[10px] text-gray-400 ml-1">{flight.aircraft}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{flight.seatsLeft} seats</span>
          {showBook && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={addToCart}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-colors"
            >
              Book
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
