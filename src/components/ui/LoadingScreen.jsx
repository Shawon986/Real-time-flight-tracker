import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Preparing for takeoff...',
  'Loading flight data...',
  'Calibrating instruments...',
  'Checking airspace...',
  'Fueling up...',
  'Boarding passengers...',
  'Running pre-flight checks...',
  'Contacting tower...',
];

export default function LoadingScreen({ message = '', progress = null }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const displayMsg = message || MESSAGES[msgIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#050b14]/95 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg mx-auto px-6">
        {/* ── Radar sweep circle ── */}
        <div className="relative mx-auto w-72 h-72 mb-8">
          {/* Outer radar rings */}
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-[#00e676]/10"
              style={{ margin: `${i * 20}px` }}
            />
          ))}

          {/* Radar sweep line */}
          <div className="absolute inset-0" style={{ animation: 'radarSweep 3s linear infinite' }}>
            <div
              className="absolute top-0 left-1/2 w-[2px] h-1/2 origin-bottom"
              style={{
                background: 'linear-gradient(to top, rgba(0,230,118,0.8), rgba(0,230,118,0))',
                boxShadow: '0 0 12px rgba(0,230,118,0.3)',
              }}
            />
          </div>

          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full bg-[#00e676] shadow-[0_0_20px_#00e676]" />
            <div className="absolute inset-0 w-4 h-4 rounded-full bg-[#00e676] animate-ping opacity-40" />
          </div>
        </div>

        {/* ── Plane flying across ── */}
        <div className="relative h-16 mb-10 overflow-hidden">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            animate={{
              left: ['-15%', '105%'],
              top: ['50%', '40%', '55%', '45%', '50%'],
            }}
            transition={{
              left: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              top: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            {/* Contrail particles */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#00e676]/40"
                  animate={{ opacity: [0.6, 0], scale: [1, 0.2] }}
                  transition={{ duration: 1.2, delay: i * 0.12, repeat: Infinity, ease: 'easeOut' }}
                  style={{ marginLeft: `${i * 8}px` }}
                />
              ))}
            </div>

            {/* Plane SVG */}
            <svg className="w-10 h-10 drop-shadow-[0_0_12px_rgba(0,230,118,0.5)]" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" fill="url(#loaderPlaneGrad)" stroke="#00e676" strokeWidth="1.5" />
              <path d="M14 4l3.5 10h10L21 18.5l2.2 8.5L14 23l-9.2 4 2.2-8.5L.5 14h10z" fill="#fff" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
              <defs>
                <radialGradient id="loaderPlaneGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#00e676" />
                  <stop offset="100%" stopColor="#0066ff" />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
        </div>

        {/* ── Message ── */}
        <AnimatePresence mode="wait">
          <motion.p
            key={displayMsg}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-center text-sm font-semibold text-[#00e676]/80 tracking-wide uppercase"
          >
            {displayMsg}
          </motion.p>
        </AnimatePresence>

        {/* ── Progress bar ── */}
        {progress !== null && (
          <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #0066ff, #00e676)',
                boxShadow: '0 0 12px rgba(0,230,118,0.4)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}

        {/* ── Altitude-style loading text ── */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-[#00e676]/60 animate-pulse" />
            LOADING
            <span className="w-2 h-2 rounded-full bg-[#00e676]/60 animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── Grid background ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,230,118,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,230,118,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </motion.div>
  );
}
