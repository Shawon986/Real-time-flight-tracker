import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ────────────────────────────────────────────
   Geometric airplane built from primitives
   ──────────────────────────────────────────── */
function Airplane() {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef} scale={1.2}>
        {/* Fuselage */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 1.2, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Nose cone */}
        <mesh position={[0, 0, 0.65]}>
          <coneGeometry args={[0.12, 0.25, 16, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Tail cone */}
        <mesh position={[0, 0, -0.65]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.2, 16, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Main wings */}
        <mesh position={[0, 0, -0.05]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.8, 0.03, 0.25]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Left wing sweep */}
        <mesh position={[-0.7, 0, -0.05]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.5, 0.025, 0.2]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Right wing sweep */}
        <mesh position={[0.7, 0, -0.05]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.5, 0.025, 0.2]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Tail horizontal stabilizer */}
        <mesh position={[0, 0, -0.5]}>
          <boxGeometry args={[0.6, 0.02, 0.12]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Tail vertical stabilizer */}
        <mesh position={[0, 0.2, -0.55]}>
          <boxGeometry args={[0.03, 0.35, 0.18]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Engines (2, under wings) */}
        {[[-0.4, -0.08, 0.05], [0.4, -0.08, 0.05]].map((pos, i) => (
          <mesh key={i} position={pos}>
            <cylinderGeometry args={[0.06, 0.06, 0.2, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.2} />
          </mesh>
        ))}

        {/* Engine intake rings */}
        {[[-0.4, -0.08, 0.16], [0.4, -0.08, 0.16]].map((pos, i) => (
          <mesh key={`ring-${i}`} position={pos}>
            <torusGeometry args={[0.06, 0.012, 8, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.2} />
          </mesh>
        ))}

        {/* Cockpit window */}
        <mesh position={[0, 0.06, 0.6]} rotation={[0.25, 0, 0]}>
          <sphereGeometry args={[0.06, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial color="#60a5fa" metalness={0.1} roughness={0.1} emissive="#3b82f6" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

/* ────────────────────────────────────────────
   Public 3D Airplane component
   ──────────────────────────────────────────── */
export default function AirplaneModel({ height = 300, className = '' }) {
  return (
    <div className={className} style={{ width: '100%', height }}>
      <Canvas
        camera={{ position: [0, 0.6, 3.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 2, -3]} intensity={0.3} />
        <pointLight position={[0, 1, 2]} intensity={0.5} color="#60a5fa" />
        <Airplane />
      </Canvas>
    </div>
  );
}
