import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/* ────────────────────────────────────────────
   Compass ring + needle that rotates to heading
   ──────────────────────────────────────────── */
function Compass({ heading = 0 }) {
  const groupRef = useRef();
  const targetRotation = useRef(heading * (Math.PI / 180));
  const currentRotation = useRef(targetRotation.current);

  useFrame((_, delta) => {
    targetRotation.current = heading * (Math.PI / 180);
    // Smooth rotation toward target
    currentRotation.current += (targetRotation.current - currentRotation.current) * Math.min(delta * 4, 1);
    if (groupRef.current) {
      groupRef.current.rotation.z = currentRotation.current;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[1.2, 0.04, 16, 64]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.2} emissive="#1d4ed8" emissiveIntensity={0.3} />
        </mesh>

        {/* Cardinal direction markers */}
        {['N', 'E', 'S', 'W'].map((dir, i) => {
          const angle = (i * Math.PI) / 2;
          const x = Math.sin(angle) * 1.05;
          const y = Math.cos(angle) * 1.05;
          return (
            <Text
              key={dir}
              position={[x, y, 0.05]}
              fontSize={0.18}
              color={dir === 'N' ? '#ef4444' : '#93c5fd'}
              fontWeight="bold"
              anchorX="center"
              anchorY="middle"
            >
              {dir}
            </Text>
          );
        })}

        {/* Tick marks every 30 degrees */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI) / 6;
          const inner = 1.02;
          const outer = 1.12;
          return (
            <group key={i} rotation={[0, 0, angle]}>
              <mesh position={[0, inner, 0.03]}>
                <boxGeometry args={[0.02, outer - inner, 0.01]} />
                <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={0.5} />
              </mesh>
            </group>
          );
        })}

        {/* Aircraft needle (points to heading direction) */}
        <group position={[0, 0, 0.04]}>
          {/* North-pointing needle */}
          <mesh position={[0, 0.65, 0]}>
            <coneGeometry args={[0.06, 0.3, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
          </mesh>
          {/* South-pointing tail */}
          <mesh position={[0, -0.55, 0]}>
            <coneGeometry args={[0.04, 0.2, 8]} />
            <meshStandardMaterial color="#9ca3af" emissive="#6b7280" emissiveIntensity={0.4} />
          </mesh>

          {/* Wings */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.03, 0.06]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.2} emissive="#f59e0b" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* Center dot */}
        <mesh position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      </group>
    </Float>
  );
}

export default function HeadingCompass({ heading = 0, height = 250 }) {
  return (
    <div style={{ width: '100%', height }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 2, 3]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[-2, -1, 2]} intensity={0.3} color="#8b5cf6" />
        <Compass heading={heading} />
      </Canvas>
    </div>
  );
}
