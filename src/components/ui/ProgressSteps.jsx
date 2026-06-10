import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { key: 'passengers', label: 'Passengers', icon: '👤' },
  { key: 'seats', label: 'Seats', icon: '💺' },
  { key: 'addons', label: 'Add-ons', icon: '🎒' },
  { key: 'review', label: 'Review', icon: '✅' },
];

export default function ProgressSteps({ currentStep, onStepClick }) {
  const idx = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isDone = i < idx;
        const isCurrent = i === idx;
        const isFuture = i > idx;

        return (
          <div key={step.key} className="flex items-center relative pb-6 sm:pb-8">
            {/* Connecting line (before) */}
            {i > 0 && (
              <div className={`h-1 w-8 sm:w-12 rounded-full transition-colors duration-500 ${isDone || isCurrent ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}

            {/* Step circle */}
            <button
              onClick={() => (isDone ? onStepClick(step.key) : null)}
              disabled={isFuture}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300
                ${isDone ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700'
                  : isCurrent ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900 scale-110'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
            >
              <AnimatePresence mode="wait">
                {isDone ? (
                  <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>✓</motion.span>
                ) : (
                  <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{step.icon}</motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Label — positioned below the circle */}
            <span
              className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 text-[10px] font-semibold whitespace-nowrap hidden sm:block
                ${isCurrent ? 'text-primary-600 dark:text-primary-400' : isDone ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
