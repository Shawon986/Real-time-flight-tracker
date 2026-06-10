import { useRef, useState, useCallback } from 'react';

/**
 * CSS 3D perspective card that tilts toward the mouse cursor.
 * Pure CSS transform — no Three.js needed.
 */
export default function TiltCard({ children, className = '', maxTilt = 8, scale = 1.03 }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale3d(1,1,1)`,
      transition: 'transform 0.1s ease-out',
    });
  }, [maxTilt]);

  const handleLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)',
      transition: 'transform 0.5s ease-out',
    });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={style}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}
