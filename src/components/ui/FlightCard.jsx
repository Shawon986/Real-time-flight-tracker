import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartDispatch } from '../../context/CartContext';

export default function FlightCard({ flight, index = 0, showBook = true }) {
  const navigate = useNavigate();
  const cartDispatch = useCartDispatch();

  const addToCart = (e) => {
    e.stopPropagation();
    cartDispatch({
      type: 'ADD',
      item: {
        flightId: flight.id, flightNum: flight.flightNum, airline: flight.airline,
        from: flight.from, to: flight.to, depTime: flight.depTime, arrTime: flight.arrTime,
        duration: flight.duration, price: flight.price, stops: flight.stops, aircraft: flight.aircraft,
      },
    });
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/flight/${flight.id}`)}
      className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 cursor-pointer hover:border-[#0066ff]/20 hover:bg-white/[0.04] transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-[#7a8ba0] font-semibold uppercase tracking-wider">{flight.airline}</p>
          <p className="text-lg font-bold text-white">{flight.flightNum}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#3399ff]">${flight.price}</p>
          <p className="text-[10px] text-[#7a8ba0]">{flight.class}</p>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xl font-bold text-white">{flight.from}</p>
          <p className="text-xs text-[#7a8ba0]">{flight.depTime}</p>
        </div>
        <div className="flex flex-col items-center px-3">
          <p className="text-[10px] text-[#7a8ba0] mb-1">{flight.duration}</p>
          <div className="flex items-center gap-1">
            <div className="h-px w-8 bg-white/[0.06]" />
            <svg className="w-3.5 h-3.5 text-[#0066ff]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
            <div className="h-px w-8 bg-white/[0.06]" />
          </div>
          <p className="text-[10px] text-[#7a8ba0] mt-1">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">{flight.to}</p>
          <p className="text-xs text-[#7a8ba0]">{flight.arrTime}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="text-yellow-500 text-xs">★ {flight.rating}</span>
          <span className="text-[10px] text-[#7a8ba0]">{flight.aircraft}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#7a8ba0]">{flight.seatsLeft} seats</span>
          {showBook && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={addToCart}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-[#0066ff] to-[#3399ff] text-white hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] transition-all"
            >
              Book
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
