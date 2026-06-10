import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Full-screen confetti/particle celebration.
 * Usage: <ParticleBurst trigger={showConfetti} />
 */
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];
const PARTICLE_COUNT = 80;

export default function ParticleBurst({ trigger = false, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) { setParticles([]); return; }
    const items = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 720 - 360,
      duration: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 0.4,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }));
    setParticles(items);
    if (onComplete) {
      const t = setTimeout(onComplete, 3500);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 z-[1000] pointer-events-none overflow-hidden">
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ y: '110vh', opacity: 0, rotate: p.rotation, scale: [1, 1.3, 0.7] }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute"
              style={{
                width: p.size,
                height: p.size,
                borderRadius: p.shape === 'circle' ? '50%' : '2px',
                backgroundColor: p.color,
              }}
            />
          ))}
          {/* Central burst text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: '40vh' }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.9], y: '35vh' }}
            transition={{ duration: 2.5, delay: 0.3 }}
            className="absolute inset-x-0 flex justify-center"
          >
            <span className="text-3xl sm:text-4xl font-black text-primary-600 dark:text-primary-400 drop-shadow-lg">
              ✈️ Booked!
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
