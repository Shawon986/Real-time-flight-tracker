// ── Shared framer-motion animation variants ──

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export const slideLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export const slideRight = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.9, transition: { duration: 0.25 } },
};

// Staggered children
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Cards
export const cardHover = {
  rest:  { y: 0, scale: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  hover: { y: -6, scale: 1.02, boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', transition: { type: 'spring', stiffness: 350, damping: 25 } },
  tap:   { scale: 0.97 },
};

// List item remove
export const listItemRemove = {
  exit: { opacity: 0, x: 120, transition: { duration: 0.35, ease: 'easeIn' } },
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
