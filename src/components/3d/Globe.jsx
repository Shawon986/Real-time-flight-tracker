import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/* ────────────────────────────────────────────
   Earth sphere with texture
   ──────────────────────────────────────────── */
function Earth({ textureUrl }) {
  const meshRef = useRef();
  const texture = useTexture(textureUrl);

  // Slow auto-rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

/* ────────────────────────────────────────────
   Atmosphere glow (transparent outer sphere)
   ──────────────────────────────────────────── */
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[1.02, 64, 64]} />
      <meshPhongMaterial
        color="#4da6ff"
        transparent
        opacity={0.08}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ────────────────────────────────────────────
   Flight arc — quadratic bezier between 2 points
   ──────────────────────────────────────────── */
function FlightArc({ start, end, color = '#6366f1', delay = 0 }) {
  const lineRef = useRef();
  const materialRef = useRef();

  // Convert lat/lng → 3D position on unit sphere
  const toVec3 = (lat, lng, radius = 1.04) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  };

  const curve = useMemo(() => {
    const p0 = toVec3(start[0], start[1]);
    const p2 = toVec3(end[0], end[1]);
    // Midpoint pushed outward for the arc
    const mid = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
    const dist = p0.distanceTo(p2);
    mid.normalize().multiplyScalar(1 + dist * 0.65);
    return new THREE.QuadraticBezierCurve3(p0, mid, p2);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(80), [curve]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.dashOffset = -(clock.getElapsedTime() * 0.3 + delay);
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineDashedMaterial
        ref={materialRef}
        color={color}
        dashSize={0.12}
        gapSize={0.06}
        lineWidth={1}
        transparent
        opacity={0.7}
      />
    </line>
  );
}

/* ────────────────────────────────────────────
   Airport dot on the globe surface
   ──────────────────────────────────────────── */
function AirportDot({ lat, lng, color = '#8b5cf6' }) {
  const pos = useMemo(() => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const r = 1.05;
    return [
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    ];
  }, [lat, lng]);

  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.012, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/* ────────────────────────────────────────────
   Scene content
   ──────────────────────────────────────────── */
function Scene() {
  // Major world airports for arcs
  const routes = [
    { from: [40.64, -73.78], to: [51.47, -0.45], color: '#6366f1' },  // JFK→LHR
    { from: [51.47, -0.45], to: [25.25, 55.36], color: '#8b5cf6' },  // LHR→DXB
    { from: [25.25, 55.36], to: [1.36, 103.99], color: '#ec4899' },  // DXB→SIN
    { from: [33.94, -118.41], to: [35.55, 139.78], color: '#f59e0b' }, // LAX→HND
    { from: [37.62, -122.38], to: [-33.94, 151.18], color: '#10b981' },// SFO→SYD
    { from: [48.86, 2.35], to: [40.64, -73.78], color: '#3b82f6' },   // CDG→JFK
  ];

  const airports = [
    [40.64, -73.78], [51.47, -0.45], [25.25, 55.36], [1.36, 103.99],
    [33.94, -118.41], [35.55, 139.78], [37.62, -122.38], [-33.94, 151.18],
    [48.86, 2.35], [50.04, 8.56], [-26.20, 28.05],
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={0.9} />
      <directionalLight position={[-3, -1, -3]} intensity={0.3} />

      <Earth textureUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg" />
      <Atmosphere />

      {airports.map(([lat, lng], i) => (
        <AirportDot key={i} lat={lat} lng={lng} />
      ))}

      {routes.map((r, i) => (
        <FlightArc key={i} start={r.from} end={r.to} color={r.color} delay={i * 0.4} />
      ))}
    </>
  );
}

/* ────────────────────────────────────────────
   Public Globe component
   ──────────────────────────────────────────── */
export default function Globe({ className = '' }) {
  return (
    <div className={`${className}`} style={{ width: '100%', height: '500px', cursor: 'grab' }}>
      <Canvas
        camera={{ position: [0, 0.5, 2.6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={1.5}
            maxDistance={4}
            autoRotate={false}
            rotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
