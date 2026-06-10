import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { AIRPORTS } from '../../utils/constants';

/* ═══════════════════════════════════════════════
   Ground plane — radar grid
   ═══════════════════════════════════════════════ */
function GroundPlane() {
  return (
    <group>
      {/* Base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#060d1a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[60, 40, '#0a1a2e', '#0a1a2e']}
        position={[0, -0.48, 0]}
      />

      {/* Inner radar rings */}
      {[5, 10, 15, 20, 25].map(r => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
          <ringGeometry args={[r - 0.08, r, 80]} />
          <meshBasicMaterial color="#00e676" opacity={0.03} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Radar sweep line effect — static arcs */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh key={`sweep-${i}`} rotation={[-Math.PI / 2, 0, angle]} position={[0, -0.46, 0]}>
            <planeGeometry args={[30, 0.02]} />
            <meshBasicMaterial color="#00e676" opacity={0.04} transparent side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Flight path arc
   ═══════════════════════════════════════════════ */
function FlightPathArc({ depLat, depLng, arrLat, arrLng, progress = 0.5 }) {
  const points = useMemo(() => {
    if (depLat == null || arrLat == null) return [];

    // Project lat/lng onto the ground plane (scaled)
    const scale = 25; // map degrees to world units
    const centerLat = (depLat + arrLat) / 2;
    const centerLng = (depLng + arrLng) / 2;

    const project = (lat, lng) => {
      const x = (lng - centerLng) * scale * Math.cos(centerLat * Math.PI / 180);
      const z = -(lat - centerLat) * scale;
      return new THREE.Vector3(x, 0, z);
    };

    const start = project(depLat, depLng);
    const end = project(arrLat, arrLng);

    // Create a quadratic bezier with a raised midpoint
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const dist = start.distanceTo(end);
    mid.y += dist * 0.25; // arc height

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(100);
  }, [depLat, depLng, arrLat, arrLng]);

  if (points.length < 2) return null;

  // Current position along the path
  const progressIdx = Math.floor(progress * (points.length - 1));
  const traveledPoints = points.slice(0, progressIdx + 1);
  const remainingPoints = points.slice(progressIdx);

  return (
    <group>
      {/* Full path (dim) */}
      <Line
        points={points}
        color="#0066ff"
        opacity={0.2}
        lineWidth={0.5}
        transparent
      />

      {/* Traveled path (bright) */}
      {traveledPoints.length > 1 && (
        <Line
          points={traveledPoints}
          color="#00e676"
          opacity={0.7}
          lineWidth={1}
          transparent
        />
      )}

      {/* Remaining path (dashed look via dim color) */}
      {remainingPoints.length > 1 && (
        <Line
          points={remainingPoints}
          color="#0066ff"
          opacity={0.35}
          lineWidth={0.5}
          transparent
          dashed
          dashSize={1}
          gapSize={0.5}
        />
      )}

      {/* Waypoint dots every 25% */}
      {[0.25, 0.5, 0.75].map(f => {
        const idx = Math.floor(f * (points.length - 1));
        const pt = points[idx];
        return (
          <mesh key={f} position={[pt.x, pt.y + 0.3, pt.z]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={f < progress ? '#00e676' : '#0066ff'} opacity={0.6} transparent />
          </mesh>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Airport marker on the ground
   ═══════════════════════════════════════════════ */
function AirportMarker3D({ lat, lng, label, color = '#00e676' }) {
  const scale = 25;
  // Use a neutral center — we receive pre-projected positions from parent
  // For simplicity, just place at a scaled position

  if (lat == null || lng == null) return null;
  const x = lng * 0.25;
  const z = -lat * 0.25;

  return (
    <group position={[x, 0.05, z]}>
      {/* Vertical beacon pillar */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {/* Glowing top sphere */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      {/* Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial color={color} opacity={0.4} transparent side={THREE.DoubleSide} />
      </mesh>
      {label && (
        <Text position={[0, 0.85, 0]} fontSize={0.18} color={color} anchorX="center" anchorY="middle" fontWeight="bold">
          {label}
        </Text>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   3D Aircraft model (built inline from primitives)
   ═══════════════════════════════════════════════ */
function Aircraft3D({ position, heading = 0, altitude = 0, speed = 0 }) {
  const groupRef = useRef();
  const targetRot = useRef(0);
  const currentRot = useRef(0);

  useFrame((_, delta) => {
    targetRot.current = (heading - 90) * (Math.PI / 180);
    currentRot.current += (targetRot.current - currentRot.current) * Math.min(delta * 5, 1);
    if (groupRef.current) {
      groupRef.current.rotation.y = currentRot.current;
    }
  });

  const altY = Math.max(0.5, altitude / 35000 * 8);

  return (
    <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.15}>
      <group ref={groupRef} position={[position[0], altY, position[2]]} scale={0.6}>
        {/* Fuselage */}
        <mesh>
          <cylinderGeometry args={[0.12, 0.1, 1.4, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.3} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0, 0.75]}>
          <coneGeometry args={[0.12, 0.28, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.3} />
        </mesh>
        {/* Tail cone */}
        <mesh position={[0, 0, -0.75]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.22, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.3} roughness={0.3} />
        </mesh>
        {/* Wings */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[2.0, 0.03, 0.28]} />
          <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Tail stabilizers */}
        <mesh position={[0, 0, -0.55]}>
          <boxGeometry args={[0.7, 0.02, 0.14]} />
          <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.18, -0.6]}>
          <boxGeometry args={[0.03, 0.3, 0.18]} />
          <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Engines */}
        {[[-0.42, -0.1, 0.05], [0.42, -0.1, 0.05]].map((pos, i) => (
          <group key={i} position={pos}>
            <mesh>
              <cylinderGeometry args={[0.07, 0.07, 0.22, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.12]}>
              <torusGeometry args={[0.07, 0.014, 8, 12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} />
            </mesh>
          </group>
        ))}
        {/* Glow strip along fuselage */}
        <mesh position={[0, 0, 0]} scale={[1.01, 1.01, 1.01]}>
          <cylinderGeometry args={[0.12, 0.1, 1.4, 16]} />
          <meshBasicMaterial color="#00e676" opacity={0.1} transparent />
        </mesh>
      </group>
    </Float>
  );
}

/* ═══════════════════════════════════════════════
   Chase camera controller
   ═══════════════════════════════════════════════ */
function ChaseCamera({ target, heading = 0 }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 2, 8));

  useFrame((_, delta) => {
    if (!target) return;

    const hRad = (heading - 90) * (Math.PI / 180);
    const altY = Math.max(0.5, target[1] || 0);

    // Camera orbits behind and to the side of the aircraft
    const behindX = Math.sin(hRad) * 6;
    const behindZ = Math.cos(hRad) * 6;
    const desired = new THREE.Vector3(
      target[0] + behindX,
      altY + 3.5,
      target[2] + behindZ,
    );

    targetPos.current.lerp(desired, delta * 1.5);
    camera.position.copy(targetPos.current);
    camera.lookAt(target[0], altY, target[2]);
  });

  return null;
}

/* ═══════════════════════════════════════════════
   Particle trail
   ═══════════════════════════════════════════════ */
function ParticleTrail({ position }) {
  const pointsRef = useRef([]);
  const lineRef = useRef();

  useFrame(() => {
    if (!position) return;
    pointsRef.current.push(new THREE.Vector3(position[0], position[1], position[2]));
    if (pointsRef.current.length > 60) pointsRef.current.shift();
    if (lineRef.current && pointsRef.current.length > 1) {
      lineRef.current.geometry.setFromPoints(pointsRef.current);
    }
  });

  const geo = useMemo(() => new THREE.BufferGeometry(), []);

  return (
    <line ref={lineRef} geometry={geo}>
      <lineBasicMaterial color="#00e676" opacity={0.3} transparent linewidth={1} />
    </line>
  );
}

/* ═══════════════════════════════════════════════
   MAIN 3D FLIGHT SCENE
   ═══════════════════════════════════════════════ */
function Scene({ flight, progress = 0.5 }) {
  const dep = flight?.departure ? AIRPORTS[flight.departure] : null;
  const arr = flight?.arrival ? AIRPORTS[flight.arrival] : null;

  // Scale flight position onto the 3D grid
  const lat = flight?.position?.lat ?? 30;
  const lng = flight?.position?.lng ?? 0;
  const altY = (flight?.altitudeMeters ?? 10000) / 35000 * 8;

  // Center the scene roughly on the Atlantic
  const centerLat = dep && arr ? (dep.lat + arr.lat) / 2 : lat;
  const centerLng = dep && arr ? (dep.lon + arr.lon) / 2 : lng;

  const project = (la, lo) => {
    const cos = Math.cos(centerLat * Math.PI / 180);
    const x = (lo - centerLng) * 25 * cos;
    const z = -(la - centerLat) * 25;
    return [x, z];
  };

  const aircraftPos = project(lat, lng);
  const aircraft3DPos = [aircraftPos[0], altY, aircraftPos[1]];

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 15, 5]} intensity={0.4} color="#0066ff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.2} color="#00e676" />
      <pointLight position={aircraft3DPos} intensity={1.5} color="#00e676" distance={15} />

      <GroundPlane />

      {/* Flight path */}
      {dep && arr && (
        <FlightPathArc
          depLat={dep.lat} depLng={dep.lon}
          arrLat={arr.lat} arrLng={arr.lon}
          progress={progress}
        />
      )}

      {/* Airport markers */}
      {dep && (
        <AirportMarker3D
          lat={dep.lat} lng={dep.lon}
          label={flight.departure}
          color="#ff9800"
        />
      )}
      {arr && (
        <AirportMarker3D
          lat={arr.lat} lng={arr.lon}
          label={flight.arrival}
          color="#00e676"
        />
      )}

      {/* Altitude ring on ground below aircraft */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[aircraftPos[0], -0.45, aircraftPos[1]]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshBasicMaterial color="#00e676" opacity={0.5} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* Aircraft */}
      <Aircraft3D
        position={[aircraftPos[0], altY, aircraftPos[1]]}
        heading={flight?.heading ?? 0}
        altitude={flight?.altitudeMeters ?? 0}
        speed={flight?.velocity ?? 0}
      />

      {/* Chase camera */}
      <ChaseCamera target={aircraft3DPos} heading={flight?.heading ?? 0} />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.3}
        target={new THREE.Vector3(aircraftPos[0], altY * 0.5, aircraftPos[1])}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════
   PUBLIC COMPONENT
   ═══════════════════════════════════════════════ */
export default function FlightScene3D({ flight, progress = 0.5, height = 550 }) {
  if (!flight) {
    return (
      <div
        style={{ width: '100%', height }}
        className="bg-[#060d1a] rounded-2xl border border-white/[0.05] flex items-center justify-center"
      >
        <div className="text-center space-y-3">
          <svg className="w-12 h-12 text-[#7a8ba0]/30 mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <p className="text-[#7a8ba0]/50 text-sm">No flight data for 3D view</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ width: '100%', height, cursor: 'grab' }}
      className="rounded-2xl overflow-hidden border border-white/[0.05] shadow-2xl shadow-black/40"
    >
      <Canvas
        camera={{ position: [0, 5, 12], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#060d1a' }}
        onCreated={({ gl }) => { gl.setClearColor('#060d1a'); }}
      >
        <Scene flight={flight} progress={progress} />
      </Canvas>

      {/* Overlay: flight info badge */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/[0.08] text-xs text-white font-bold">
          {flight.callsign?.trim()} · {flight.status === 'en_route' ? '🟢 EN ROUTE' : flight.status?.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
