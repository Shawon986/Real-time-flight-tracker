import { useState } from 'react';
import { motion } from 'framer-motion';

const ROWS = 20;
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
// Premium rows (1-4) cost more
const PREMIUM_ROWS = new Set([1, 2, 3, 4]);
// Pre-occupied seats (realistic scattered pattern)
const OCCUPIED = new Set([
  '1A','1C','1D','2B','2F','3A','3E','4C','4D',
  '5A','5B','7C','7F','8D','8E','10A','10B','11F',
  '12C','12D','14A','14E','15B','15C','17F','18A','19D','20B','20E',
]);

function seatPrice(row) {
  return PREMIUM_ROWS.has(row) ? 45 : 0;
}

const seatVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: i => ({ opacity: 1, scale: 1, transition: { delay: i * 0.003, type: 'spring', stiffness: 400, damping: 25 } }),
};

export default function SeatMap({ selectedSeats = [], onToggleSeat }) {
  const [hovered, setHovered] = useState(null);

  const isSelected = (seat) => selectedSeats.includes(seat);
  const isOccupied = (seat) => OCCUPIED.has(seat);

  // Calculate index for staggered animation
  let seatIdx = 0;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[300px] max-w-lg mx-auto">
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mb-6 text-xs font-medium">
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" /> Available</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-primary-500" /> Selected</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600" /> Occupied</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" /> Premium (+$45)</div>
        </div>

        {/* Plane shape */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          {/* Cockpit */}
          <div className="w-16 h-8 mx-auto mb-3 rounded-t-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Cockpit</span>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            <div className="text-center text-[10px] text-gray-400 font-bold"></div>
            {COLS.map(c => (
              <div key={c} className="text-center text-[10px] text-gray-400 font-bold">{c}</div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-1">
            {Array.from({ length: ROWS }, (_, i) => i + 1).map(row => (
              <div key={row} className="grid grid-cols-7 gap-1 items-center">
                {/* Row number */}
                <div className="text-center text-[10px] text-gray-400 font-bold">{row}</div>

                {/* Left seats (A, B, C) */}
                {COLS.slice(0, 3).map(col => {
                  const seat = `${row}${col}`;
                  const idx = seatIdx++;
                  return (
                    <SeatButton key={seat} seat={seat} idx={idx} isSelected={isSelected(seat)} isOccupied={isOccupied(seat)} row={row} hovered={hovered} setHovered={setHovered} onToggle={onToggleSeat} />
                  );
                })}

                {/* Aisle */}
                <div className="w-full" />

                {/* Right seats (D, E, F) */}
                {COLS.slice(3).map(col => {
                  const seat = `${row}${col}`;
                  const idx = seatIdx++;
                  return (
                    <SeatButton key={seat} seat={seat} idx={idx} isSelected={isSelected(seat)} isOccupied={isOccupied(seat)} row={row} hovered={hovered} setHovered={setHovered} onToggle={onToggleSeat} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected summary */}
        {selectedSeats.length > 0 && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-950/30 rounded-xl border border-primary-200 dark:border-primary-800">
            <p className="text-xs font-bold text-primary-700 dark:text-primary-300">
              Selected: {selectedSeats.sort().join(', ')}
              {selectedSeats.some(s => PREMIUM_ROWS.has(parseInt(s))) && (
                <span className="ml-2 text-amber-600 dark:text-amber-400">(+ premium row fees)</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SeatButton({ seat, idx, isSelected, isOccupied, row, hovered, setHovered, onToggle }) {
  const premium = PREMIUM_ROWS.has(row);
  const available = !isOccupied;

  let bg = 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600';
  if (isSelected) bg = 'bg-primary-500 border-primary-600 shadow-lg shadow-primary-500/30 scale-110';
  else if (isOccupied) bg = 'bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500 cursor-not-allowed';
  else if (premium) bg = 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700';

  return (
    <motion.button
      custom={idx}
      variants={seatVariants}
      initial="hidden"
      animate="visible"
      whileHover={available && !isSelected ? { scale: 1.2, transition: { type: 'spring', stiffness: 500, damping: 20 } } : {}}
      whileTap={available ? { scale: 0.9 } : {}}
      onClick={() => available && onToggle(seat)}
      onMouseEnter={() => setHovered(seat)}
      onMouseLeave={() => setHovered(null)}
      disabled={!available}
      className={`w-7 h-7 rounded-t-lg text-[8px] font-bold transition-colors ${bg} ${available && !isSelected ? 'hover:bg-primary-100 dark:hover:bg-primary-900/30 cursor-pointer' : ''}`}
      title={premium ? `${seat} (+$45 premium)` : seat}
    >
      {colOnly(seat)}
    </motion.button>
  );
}

function colOnly(seat) {
  return seat.replace(/[0-9]/g, '');
}
