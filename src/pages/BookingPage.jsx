import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlightById } from '../services/mockFlights';
import { useBookingDispatch } from '../context/BookingContext';
import { useCartDispatch } from '../context/CartContext';
import { AIRPORTS } from '../utils/constants';
import PageTransition from '../components/ui/PageTransition';
import ProgressSteps from '../components/ui/ProgressSteps';
import PassengerForm from '../components/booking/PassengerForm';
import SeatMap from '../components/ui/SeatMap';
import AddOnsSelector, { getAddOnsTotal } from '../components/booking/AddOnsSelector';
import ParticleBurst from '../components/ui/ParticleBurst';

const STEPS = ['passengers', 'seats', 'addons', 'review'];

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const flight = getFlightById(id);
  const bookingDispatch = useBookingDispatch();
  const cartDispatch = useCartDispatch();

  const [step, setStep] = useState(0);
  const [passenger, setPassenger] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [addons, setAddons] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!flight) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Flight not found</p>
          <button onClick={() => navigate('/search')} className="text-primary-600 hover:underline mt-2">Search flights</button>
        </div>
      </PageTransition>
    );
  }

  const depAirport = AIRPORTS[flight.from];
  const arrAirport = AIRPORTS[flight.to];
  const seatPremium = selectedSeats.reduce((s, seat) => s + (parseInt(seat) <= 4 ? 45 : 0), 0);
  const addonsTotal = getAddOnsTotal(addons);
  const total = flight.price + seatPremium + addonsTotal;

  const toggleSeat = (seat) => {
    setSelectedSeats(prev => prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const confirmBooking = () => {
    const booking = {
      flightId: flight.id,
      flightNum: flight.flightNum,
      airline: flight.airline,
      from: flight.from,
      to: flight.to,
      depTime: flight.depTime,
      arrTime: flight.arrTime,
      duration: flight.duration,
      price: total,
      seats: selectedSeats,
      addons,
      passenger,
      date: new Date().toISOString().split('T')[0],
    };
    bookingDispatch({ type: 'ADD', booking });
    // Remove from cart if it was there
    cartDispatch({ type: 'REMOVE', flightId: flight.id });
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      navigate('/bookings');
    }, 3000);
  };

  return (
    <PageTransition>
      <ParticleBurst trigger={showConfetti} />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Flight summary bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{flight.airline} — {flight.flightNum}</p>
                <p className="text-xs text-gray-400">{flight.from} → {flight.to} • {flight.depTime} – {flight.arrTime}</p>
              </div>
            </div>
            <p className="text-xl font-black text-primary-600 dark:text-primary-400">${flight.price}</p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="pt-2 pb-6 relative">
          <ProgressSteps currentStep={STEPS[step]} onStepClick={(s) => setStep(STEPS.indexOf(s))} />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="passengers" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Passenger Details</h3>
              <PassengerForm data={passenger} onChange={setPassenger} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="seats" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Select Your Seat</h3>
              <SeatMap selectedSeats={selectedSeats} onToggleSeat={toggleSeat} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="addons" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Travel Add-ons</h3>
              <AddOnsSelector selected={addons} onChange={setAddons} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6 space-y-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Review Your Booking</h3>

              {/* Flight info */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Flight</span><span className="font-bold text-gray-900 dark:text-gray-100">{flight.flightNum} ({flight.from} → {flight.to})</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Departure</span><span className="font-bold text-gray-900 dark:text-gray-100">{flight.depTime} • {depAirport?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Arrival</span><span className="font-bold text-gray-900 dark:text-gray-100">{flight.arrTime} • {arrAirport?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Duration</span><span className="font-bold text-gray-900 dark:text-gray-100">{flight.duration}</span></div>
              </div>

              {/* Passenger */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Passenger</p>
                <p className="text-sm text-gray-500">{passenger.firstName || '—'} {passenger.lastName || '—'} • {passenger.email || '—'}</p>
              </div>

              {/* Seats */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Seats</p>
                <p className="text-sm text-gray-500">{selectedSeats.length > 0 ? selectedSeats.sort().join(', ') : 'No seat selected'}</p>
                {seatPremium > 0 && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">+${seatPremium} premium row fee</p>}
              </div>

              {/* Add-ons */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Add-ons</p>
                <p className="text-sm text-gray-500">{addons.length > 0 ? addons.join(', ') : 'None'}</p>
                {addonsTotal > 0 && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">+${addonsTotal}</p>}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-lg font-black text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-3xl font-black text-primary-600 dark:text-primary-400">${total}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="px-5 py-2.5 text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2.5 text-sm font-bold rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all active:scale-95"
            >
              Continue →
            </button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={confirmBooking}
              className="px-8 py-3 text-base font-bold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/25 hover:shadow-2xl transition-all"
            >
              ✓ Confirm & Book
            </motion.button>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
