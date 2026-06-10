import { useEffect, useRef, useState } from 'react';

/**
 * Animated number counter — counts up from 0 to `value` with easing.
 * Uses IntersectionObserver to start only when in view.
 */
export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1800, className = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          animate(0, value);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  function animate(from, to) {
    const start = performance.now();
    const delta = to - from;
    function step(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + delta * eased));
      if (t < 1) requestAnimationFrame(step);
      else setDisplay(to);
    }
    requestAnimationFrame(step);
  }

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}
