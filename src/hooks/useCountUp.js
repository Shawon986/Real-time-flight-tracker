import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 (or `from`) to `to` with easing.
 */
export function useCountUp(to, { from = 0, duration = 1500, startOnMount = true, easing = 'easeOut' } = {}) {
  const [value, setValue] = useState(from);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  const easeFn = easing === 'easeOut'
    ? t => 1 - Math.pow(1 - t, 3)           // ease-out cubic
    : t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out

  useEffect(() => {
    if (!startOnMount) return;
    startAnimation();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [to, from, duration]);

  function startAnimation() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const startValue = from;
    const delta = to - startValue;
    if (delta === 0) { setValue(to); return; }

    startTimeRef.current = performance.now();

    function step(now) {
      const elapsed = now - startTimeRef.current;
      const raw = Math.min(elapsed / duration, 1);
      const t = easeFn(raw);
      setValue(Math.round(startValue + delta * t));
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setValue(to);
      }
    }
    rafRef.current = requestAnimationFrame(step);
  }

  return value;
}
