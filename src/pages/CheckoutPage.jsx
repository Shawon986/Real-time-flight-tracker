import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart, useCartTotal, useCartDispatch } from '../context/CartContext';
import { useBookingDispatch } from '../context/BookingContext';
import PageTransition from '../components/ui/PageTransition';
import PaymentForm from '../components/booking/PaymentForm';
import ParticleBurst from '../components/ui/ParticleBurst';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const total = useCartTotal();
  const cartDispatch = useCartDispatch();
  const bookingDispatch = useBookingDispatch();

  const [payment, setPayment] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [step, setStep] = useState('review'); // 'review' | 'pay'

  if (cart.length === 0 && !showConfetti) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">No items to checkout</h2>
          <Link to="/search" className="text-primary-600 hover:underline mt-2 inline-block">Browse Flights</Link>
        </div>
      </PageTransition>
    );
  }

  const handlePay = () => {
    // Save all cart items as bookings
    cart.forEach(item => {
      bookingDispatch({
        type: 'ADD',
        booking: {
          flightId: item.flightId,
          flightNum: item.flightNum,
          airline: item.airline,
          from: item.from,
          to: item.to,
          depTime: item.depTime,
          arrTime: item.arrTime,
          duration: item.duration,
          price: item.price * item.quantity,
          seats: [],
          addons: [],
          passenger: { firstName: 'Card', lastName: 'Holder' },
          date: new Date().toISOString().split('T')[0],
        },
      });
    });

    cartDispatch({ type: 'CLEAR' });
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
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Checkout</h2>

        {/* Order summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6 space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">Order Summary</h3>
          {cart.map(item => (
            <div key={item.flightId} className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{item.airline} — {item.flightNum}</p>
                <p className="text-xs text-gray-400">{item.from} → {item.to} • {item.depTime}</p>
              </div>
              <p className="font-bold text-gray-900 dark:text-gray-100">${item.price * item.quantity}</p>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-lg font-black text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-2xl font-black text-primary-600 dark:text-primary-400">${total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-5">Payment Details</h3>
          <PaymentForm data={payment} onChange={setPayment} onPay={handlePay} />
        </div>
      </div>
    </PageTransition>
  );
}
