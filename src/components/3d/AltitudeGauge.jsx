import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/* ────────────────────────────────────────────
   Vertical altitude tape that scrolls
   ──────────────────────────────────────────── */
function Tape({ altitudeFt = 0 }) {
  const groupRef = useRef();
  const targetY = useRef(0);

  // Map altitude to vertical offset. 0 ft → y=0, 40000 ft → y=-4 (scrolls down as alt increases)
  const maxAlt = 45000;
  const clampedAlt = Math.max(0, Math.min(altitudeFt, maxAlt));

  useFrame((_, delta) => {
    targetY.current = (clampedAlt / maxAlt) * -4.5;
    if (groupRef.current) {
      groupRef.current.position.y +=
        (targetY.current - groupRef.current.position.y) * Math.min(delta * 5, 1);
    }
  });

  // Generate tick marks
  const marks = [];
  for (let alt = 0; alt <= maxAlt; alt += 2000) {
    const y = (alt / maxAlt) * 4.5;
    const isMajor = alt % 10000 === 0;
    marks.push(
      <group key={alt} position={[0, y, 0]}>
        {/* Tick line */}
        <mesh position={[0.15, 0, 0]}>
          <boxGeometry args={[isMajor ? 0.5 : 0.3, 0.01, 0.01]} />
          <meshStandardMaterial color={isMajor ? '#ffffff' : '#94a3b8'} />
        </mesh>
        {isMajor && (
          <Text position={[0.55, 0, 0]} fontSize={0.12} color="#e2e8f0" anchorX="left" anchorY="middle">
            {`${(alt / 1000).toFixed(0)}k`}
          </Text>
        )}
      </group>
    );
  }

  return (
    <group ref={groupRef}>{marks}</group>
  );
}

/* ────────────────────────────────────────────
   Altitude gauge — shows current altitude with a scrolling tape
   ──────────────────────────────────────────── */
function Gauge({ altitudeFt = 0 }) {
  return (
    <Float speed={0.3} rotationIntensity={0.02} floatIntensity={0.1}>
      <group>
        {/* Frame / background */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[1.6, 4, 0.05]} />
          <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Border */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[1.65, 4.05, 0.02]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.2} />
        </mesh>

        {/* Viewport cutout — masks the tape */}
        <group>
          {/* We use a stencil-like approach: render the tape, and a box covers the edges */}
          <mesh position={[0, -2.6, 0.02]}>
            <boxGeometry args={[1.8, 1.2, 0.01]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 2.6, 0.02]}>
            <boxGeometry args={[1.8, 1.2, 0.01]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Current altitude indicator line + text */}
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[1.6, 0.02, 0.01]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1} />
        </mesh>
        <Text position={[0, -0.35, 0.04]} fontSize={0.2} color="#fbbf24" fontWeight="bold" anchorX="center" anchorY="top">
          {`${Math.round(altitudeFt).toLocaleString()} ft`}
        </Text>
        <Text position={[0, 0.25, 0.04]} fontSize={0.08} color="#94a3b8" anchorX="center" anchorY="bottom">
          ALTITUDE
        </Text>

        {/* Scrolling tape */}
        <group position={[0, 2.25, 0.03]}>
          <Tape altitudeFt={altitudeFt} />
        </group>

        {/* Glow line at center */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.4, 0.005, 0.005]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </mesh>
      </group>
    </Float>
  );
}

export default function AltitudeGauge({ altitudeFt = 0, height = 350 }) {
  return (
    <div style={{ width: '100%', height }}>
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[1, 1, 2]} intensity={0.6} color="#fbbf24" />
        <pointLight position={[-1, -1, 1]} intensity={0.3} color="#3b82f6" />
        <Gauge altitudeFt={altitudeFt} />
      </Canvas>
    </div>
  );
}
