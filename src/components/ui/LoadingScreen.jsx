import { motion } from 'framer-motion';

/**
 * Full-screen loading overlay with animated airplane, radar rings, progress bar.
 * Usage: <LoadingScreen message="Searching flights..." />
 */
export default function LoadingScreen({ message = 'Loading...', progress = null }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-md"
    >
      <div className="text-center space-y-8">
        {/* Animated airplane */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          {/* Radar rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-24 h-24 rounded-full border-2 border-primary-400/30 absolute"
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="w-24 h-24 rounded-full border-2 border-primary-400/20 absolute"
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
            />
            <motion.div
              className="w-24 h-24 rounded-full border-2 border-primary-400/10 absolute"
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
            />
          </div>

          {/* Plane icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/40 relative z-10"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.div>
        </div>

        {/* Message */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg font-semibold text-gray-700 dark:text-gray-300"
        >
          {message}
        </motion.p>

        {/* Progress bar */}
        {progress !== null && (
          <div className="w-64 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
