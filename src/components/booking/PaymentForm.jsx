import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Payment form with a 3D CSS card-flip animation.
 * Front = card number + expiry. Back = CVV (shown on CVV field focus).
 */
export default function PaymentForm({ data, onChange, onPay }) {
  const [flipped, setFlipped] = useState(false);
  const [processing, setProcessing] = useState(false);

  const update = (field, value) => onChange({ ...data, [field]: value });

  const handlePay = async () => {
    setProcessing(true);
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1800));
    setProcessing(false);
    onPay();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* ── 3D Card ── */}
      <div className="flex justify-center mb-8">
        <div
          className="relative w-full max-w-sm h-52"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between text-white overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 40%, #8b5cf6 100%)',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Card brand */}
              <div className="flex justify-between items-start">
                <span className="text-lg font-black tracking-wider">SKYTRACK</span>
                <span className="text-sm opacity-70">Platinum</span>
              </div>
              {/* Chip */}
              <div className="w-10 h-7 rounded bg-gradient-to-b from-yellow-400 to-yellow-600 opacity-80" />
              {/* Number */}
              <div>
                <p className="text-xl font-mono tracking-widest">
                  {data.cardNumber || '•••• •••• •••• ••••'}
                </p>
              </div>
              {/* Expiry + name */}
              <div className="flex justify-between text-xs opacity-80 font-mono">
                <span>{data.cardHolder || 'CARD HOLDER'}</span>
                <span>{data.expiry || 'MM/YY'}</span>
              </div>
              {/* Glare effect */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-xl" />
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between text-white"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 40%, #8b5cf6 100%)',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Magnetic stripe */}
              <div className="h-10 -mx-6 bg-gray-900/80" />
              {/* CVV strip */}
              <div className="flex justify-end items-center gap-3">
                <span className="text-[10px] opacity-60">CVV</span>
                <div className="w-20 h-8 rounded bg-white/10 flex items-center justify-end px-3">
                  <span className="font-mono text-sm tracking-widest">{data.cvv || '•••'}</span>
                </div>
              </div>
              <div className="text-[9px] opacity-40 text-right">This card is issued by SkyTrack Bank. For customer service, call 1-800-SKY-TRAK.</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Form fields ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Card Number</label>
          <input
            type="text"
            maxLength={19}
            value={data.cardNumber || ''}
            onChange={e => update('cardNumber', e.target.value)}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Card Holder</label>
          <input
            type="text"
            value={data.cardHolder || ''}
            onChange={e => update('cardHolder', e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Expiry</label>
            <input
              type="text"
              maxLength={5}
              value={data.expiry || ''}
              onChange={e => update('expiry', e.target.value)}
              placeholder="MM/YY"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">CVV</label>
            <input
              type="text"
              maxLength={4}
              value={data.cvv || ''}
              onChange={e => update('cvv', e.target.value)}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              placeholder="123"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Pay button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        disabled={processing}
        onClick={handlePay}
        className="w-full mt-6 py-3.5 text-base font-bold rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white
                   hover:from-primary-700 hover:to-primary-800
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-xl shadow-primary-600/25
                   transition-all duration-200 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay & Confirm Booking
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
