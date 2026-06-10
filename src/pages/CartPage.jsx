import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, useCartDispatch, useCartTotal } from '../context/CartContext';
import PageTransition from '../components/ui/PageTransition';
import { listItemRemove } from '../utils/animations';

export default function CartPage() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const total = useCartTotal();

  const removeItem = (flightId) => {
    dispatch({ type: 'REMOVE', flightId });
  };

  const updateQty = (flightId, qty) => {
    dispatch({ type: 'UPDATE_QTY', flightId, quantity: qty });
  };

  if (cart.length === 0) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6"
          >
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Your cart is empty</h2>
          <p className="text-gray-400 mt-2 mb-6">Start adding flights to your booking cart!</p>
          <Link
            to="/search"
            className="inline-block px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all active:scale-95"
          >
            Browse Flights
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Booking Cart ({cart.length})</h2>
          <button
            onClick={() => dispatch({ type: 'CLEAR' })}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Clear All
          </button>
        </div>

        <AnimatePresence>
          {cart.map(item => (
            <motion.div
              key={item.flightId}
              layout
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={listItemRemove.exit}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-5"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 9h9l-7 5 2 8-7-4-7 4 2-8-7-5h9z" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{item.airline} — {item.flightNum}</p>
                    <p className="text-sm text-gray-400">{item.from} → {item.to} • {item.depTime} – {item.arrTime}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.duration} • {item.aircraft}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.flightId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >−</button>
                    <span className="w-6 text-center font-bold text-gray-900 dark:text-gray-100">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.flightId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >+</button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="text-xl font-black text-primary-600 dark:text-primary-400">${item.price * item.quantity}</p>
                    <p className="text-[10px] text-gray-400">${item.price} × {item.quantity}</p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeItem(item.flightId)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              <div className="mt-3 flex gap-3">
                <Link
                  to={`/book/${item.flightId}`}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Book with seat selection →
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Total + Checkout */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-400">Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)</p>
            <p className="text-3xl font-black text-gray-900 dark:text-gray-100">${total.toLocaleString()}</p>
          </div>
          <Link
            to="/checkout"
            className="px-8 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 transition-all"
          >
            Proceed to Checkout →
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
