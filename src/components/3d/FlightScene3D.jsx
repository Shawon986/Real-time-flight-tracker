import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Line, Text, Sky, Cloud, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { AIRPORTS } from '../../utils/constants';

/* ═══════════════════════════════════════════════
   Sky + fog atmosphere
   ═══════════════════════════════════════════════ */
function Atmosphere() {
  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[100, 80, 50]}
        inclination={0.5}
        azimuth={0.25}
        turbidity={8}
        rayleigh={2}
      />
      <fog attach="fog" args={['#060d1a', 30, 80]} />
    </>
  );
}

/* ═══════════════════════════════════════════════
   Enhanced ground plane — terrain colors
   ═══════════════════════════════════════════════ */
function TerrainGround() {
  return (
    <group>
      {/* Base land */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0a1628" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Radar grid — main lines */}
      <gridHelper args={[80, 50, '#0d2240', '#0d2240']} position={[0, -0.59, 0]} />

      {/* Glowing radar concentric rings */}
      {[4, 8, 12, 16, 20, 24, 28, 32, 36].map(r => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.58, 0]}>
          <ringGeometry args={[r - 0.06, r, 100]} />
          <meshBasicMaterial
            color={r % 8 === 0 ? '#00e678' : '#0066ff'}
            opacity={r % 8 === 0 ? 0.04 : 0.02}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Radar sweep lines (static pattern) */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const isCardinal = i % 4 === 0;
        return (
          <mesh
            key={`radial-${i}`}
            rotation={[-Math.PI / 2, 0, angle]}
            position={[0, -0.57, 0]}
          >
            <planeGeometry args={[40, isCardinal ? 0.03 : 0.015]} />
            <meshBasicMaterial
              color={isCardinal ? '#00e678' : '#0066ff'}
              opacity={isCardinal ? 0.05 : 0.02}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Ocean-like dark patches */}
      {[[-15, -15], [15, 10], [-10, 20], [20, -10], [0, -20]].map(([x, z], i) => (
        <mesh key={`ocean-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.57, z]}>
          <circleGeometry args={[3 + i * 1.5, 32]} />
          <meshBasicMaterial color="#040d1a" opacity={0.4} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Cloud layer
   ═══════════════════════════════════════════════ */
function CloudLayer() {
  return (
    <group>
      {Array.from({ length: 20 }).map((_, i) => (
        <Cloud
          key={i}
          position={[
            (Math.random() - 0.5) * 50,
            6 + Math.random() * 8,
            (Math.random() - 0.5) * 50,
          ]}
          speed={0.15}
          opacity={0.25}
          width={2 + Math.random() * 4}
          depth={0.5 + Math.random() * 1}
          segments={12}
        />
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Detailed aircraft model
   ═══════════════════════════════════════════════ */
function DetailedAircraft({ position, heading = 0, altitude = 10000, speed = 250 }) {
  const groupRef = useRef();
  const targetRot = useRef(0);
  const currentRot = useRef(0);
  const engineGlow = useRef(null);

  useFrame((_, delta) => {
    targetRot.current = (heading - 90) * (Math.PI / 180);
    currentRot.current += (targetRot.current - currentRot.current) * Math.min(delta * 4, 1);
    if (groupRef.current) {
      groupRef.current.rotation.y = currentRot.current;
    }
    // Pulse engine glow
    if (engineGlow.current) {
      engineGlow.current.intensity = 0.6 + Math.sin(Date.now() * 0.01) * 0.2;
    }
  });

  const altY = Math.max(1.2, altitude / 35000 * 10);

  return (
    <Float speed={0.6} rotationIntensity={0.015} floatIntensity={0.12}>
      <group ref={groupRef} position={[position[0], altY, position[2]]} scale={0.55}>
        {/* ── Fuselage (main body) ── */}
        <mesh castShadow>
          <capsuleGeometry args={[0.18, 1.4, 8, 16]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.15} roughness={0.25} />
        </mesh>

        {/* ── Fuselage stripe ── */}
        <mesh>
          <capsuleGeometry args={[0.185, 1.38, 4, 16]} />
          <meshBasicMaterial color="#0066ff" opacity={0.15} transparent />
        </mesh>

        {/* ── Nose cone ── */}
        <mesh position={[0, 0, 0.78]} castShadow>
          <sphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.1} roughness={0.2} />
        </mesh>

        {/* ── Cockpit windows ── */}
        <mesh position={[0, 0.06, 0.68]} rotation={[0.3, 0, 0]}>
          <sphereGeometry args={[0.07, 8, 4, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial color="#60a5fa" metalness={0.1} roughness={0.0} emissive="#3b82f6" emissiveIntensity={0.4} />
        </mesh>

        {/* ── Tail cone ── */}
        <mesh position={[0, -0.02, -0.78]}>
          <coneGeometry args={[0.1, 0.32, 12, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.15} roughness={0.25} />
        </mesh>

        {/* ── Wings (main) ── */}
        <group position={[0, -0.02, -0.05]}>
          {/* Left wing */}
          <mesh position={[-0.9, 0, 0]} rotation={[0, 0, 0.06]} castShadow>
            <boxGeometry args={[1.2, 0.04, 0.3]} />
            <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.25} />
          </mesh>
          {/* Right wing */}
          <mesh position={[0.9, 0, 0]} rotation={[0, 0, -0.06]} castShadow>
            <boxGeometry args={[1.2, 0.04, 0.3]} />
            <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.25} />
          </mesh>
          {/* Wing connection */}
          <mesh>
            <boxGeometry args={[0.6, 0.04, 0.3]} />
            <meshStandardMaterial color="#475569" metalness={0.3} roughness={0.25} />
          </mesh>
        </group>

        {/* ── Horizontal stabilizer ── */}
        <group position={[0, 0.05, -0.65]}>
          <mesh position={[-0.3, 0, 0]}>
            <boxGeometry args={[0.35, 0.025, 0.15]} />
            <meshStandardMaterial color="#475569" metalness={0.25} roughness={0.3} />
          </mesh>
          <mesh position={[0.3, 0, 0]}>
            <boxGeometry args={[0.35, 0.025, 0.15]} />
            <meshStandardMaterial color="#475569" metalness={0.25} roughness={0.3} />
          </mesh>
        </group>

        {/* ── Vertical stabilizer (tail fin) ── */}
        <mesh position={[0, 0.28, -0.72]}>
          <boxGeometry args={[0.04, 0.4, 0.22]} />
          <meshStandardMaterial color="#1e40af" metalness={0.2} roughness={0.3} />
        </mesh>
        {/* Tail fin accent */}
        <mesh position={[0, 0.32, -0.72]}>
          <boxGeometry args={[0.045, 0.38, 0.08]} />
          <meshBasicMaterial color="#00e676" opacity={0.3} transparent />
        </mesh>

        {/* ── Engines (underwing, 2) ── */}
        {[[-0.45, -0.15, 0.08], [0.45, -0.15, 0.08]].map((pos, i) => (
          <group key={i} position={pos}>
            {/* Nacelle */}
            <mesh>
              <cylinderGeometry args={[0.09, 0.09, 0.28, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.15} />
            </mesh>
            {/* Intake ring */}
            <mesh position={[0, 0, 0.15]}>
              <torusGeometry args={[0.09, 0.016, 8, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.1} />
            </mesh>
            {/* Exhaust glow */}
            <mesh position={[0, 0, -0.16]}>
              <torusGeometry args={[0.07, 0.01, 8, 16]} />
              <meshStandardMaterial
                ref={i === 0 ? engineGlow : undefined}
                color="#00e676"
                emissive="#00e676"
                emissiveIntensity={0.8}
                metalness={0.1}
                roughness={0.1}
              />
            </mesh>
          </group>
        ))}

        {/* ── Landing gear (retracted, small bumps) ── */}
        {[[-0.2, -0.2, 0.0], [0.2, -0.2, 0.0], [0, -0.18, -0.35]].map((pos, i) => (
          <mesh key={`gear-${i}`} position={pos}>
            <boxGeometry args={[0.06, 0.08, 0.1]} />
            <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.2} />
          </mesh>
        ))}

        {/* ── Position lights ── */}
        {/* Left wingtip (red) */}
        <mesh position={[-1.5, -0.02, -0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
        </mesh>
        {/* Right wingtip (green) */}
        <mesh position={[1.5, -0.02, -0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1.5} />
        </mesh>
        {/* Tail beacon (white strobe) */}
        <mesh position={[0, 0.45, -0.82]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.5 + Math.sin(Date.now() * 0.005) * 0.5}
          />
        </mesh>

        {/* ── Subtle contrail exhaust ── */}
        <mesh position={[0, -0.05, -0.85]}>
          <coneGeometry args={[0.04, 0.4, 8]} />
          <meshBasicMaterial color="#ffffff" opacity={0.08} transparent />
        </mesh>
      </group>
    </Float>
  );
}

/* ═══════════════════════════════════════════════
   Flight arc with accurate projection
   ═══════════════════════════════════════════════ */
function FlightPathArc3D({ depLat, depLng, arrLat, arrLng, progress = 0.5, centerLat, centerLng }) {
  const scale = 25;
  const cos = Math.cos((centerLat || 30) * Math.PI / 180);

  const project = (lat, lng) =>
    new THREE.Vector3((lng - centerLng) * scale * cos, 0, -(lat - centerLat) * scale);

  const points = useMemo(() => {
    if (depLat == null || arrLat == null) return [];
    const start = project(depLat, depLng);
    const end = project(arrLat, arrLng);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const dist = start.distanceTo(end);
    mid.y += dist * 0.22;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(120);
  }, [depLat, depLng, arrLat, arrLng]);

  if (points.length < 2) return null;

  const progressIdx = Math.floor(progress * (points.length - 1));
  const traveled = points.slice(0, Math.max(2, progressIdx + 1));

  return (
    <group>
      {/* Full ghost path */}
      <Line points={points} color="#ffffff" opacity={0.06} lineWidth={0.5} transparent />

      {/* Traveled path glow */}
      {traveled.length > 1 && (
        <>
          <Line points={traveled} color="#00e678" opacity={0.65} lineWidth={1.2} transparent />
          <Line points={traveled} color="#00e678" opacity={0.25} lineWidth={3} transparent />
        </>
      )}

      {/* Remaining path */}
      {points.slice(progressIdx).length > 1 && (
        <Line
          points={points.slice(progressIdx)}
          color="#0066ff"
          opacity={0.3}
          lineWidth={0.6}
          transparent
          dashed
          dashSize={1.5}
          gapSize={1}
        />
      )}

      {/* Waypoint markers */}
      {[0.25, 0.5, 0.75].map(f => {
        const idx = Math.floor(f * (points.length - 1));
        const pt = points[idx];
        const isPast = f < progress;
        return (
          <group key={f} position={[pt.x, pt.y, pt.z]}>
            <mesh>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial
                color={isPast ? '#00e678' : '#0066ff'}
                emissive={isPast ? '#00e678' : '#0066ff'}
                emissiveIntensity={isPast ? 0.6 : 0.3}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshBasicMaterial color={isPast ? '#00e678' : '#0066ff'} opacity={0.2} transparent />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Airport beacon (3D)
   ═══════════════════════════════════════════════ */
function AirportBeacon3D({ lat, lng, centerLat, centerLng, label, color = '#00e678' }) {
  if (lat == null || lng == null) return null;
  const scale = 25;
  const cos = Math.cos((centerLat || 30) * Math.PI / 180);
  const x = (lng - centerLng) * scale * cos;
  const z = -(lat - centerLat) * scale;

  return (
    <group position={[x, 0.1, z]}>
      {/* Base ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.35, 32]} />
        <meshBasicMaterial color={color} opacity={0.5} transparent side={THREE.DoubleSide} />
      </mesh>
      {/* Inner ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      {/* Beacon pillar */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.7, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {/* Top glow sphere */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      {/* Label */}
      <Text position={[0, 1.0, 0]} fontSize={0.22} color={color} anchorX="center" anchorY="middle" fontWeight="black">
        {label || ''}
      </Text>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Chase camera
   ═══════════════════════════════════════════════ */
function ChaseCamera({ target, heading = 0 }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 3, 10));

  useFrame((_, delta) => {
    if (!target) return;
    const hRad = (heading - 90) * (Math.PI / 180);
    const altY = target[1] || 2;
    const behindX = Math.sin(hRad) * 8;
    const behindZ = Math.cos(hRad) * 8;
    const desired = new THREE.Vector3(
      target[0] + behindX,
      altY + 4.5,
      target[2] + behindZ,
    );
    targetPos.current.lerp(desired, delta * 2);
    camera.position.copy(targetPos.current);
    camera.lookAt(target[0], altY, target[2]);
  });

  return null;
}

/* ═══════════════════════════════════════════════
   MAIN SCENE
   ═══════════════════════════════════════════════ */
function Scene({ flight, progress = 0.5 }) {
  const dep = flight?.departure ? AIRPORTS[flight.departure] : null;
  const arr = flight?.arrival ? AIRPORTS[flight.arrival] : null;

  const lat = flight?.position?.lat ?? 30;
  const lng = flight?.position?.lng ?? 0;
  const altM = flight?.altitudeMeters ?? 10000;
  const altY = altM / 35000 * 10;

  const centerLat = dep && arr ? (dep.lat + arr.lat) / 2 : lat;
  const centerLng = dep && arr ? (dep.lon + arr.lon) / 2 : lng;
  const cos = Math.cos(centerLat * Math.PI / 180);
  const ax = (lng - centerLng) * 25 * cos;
  const az = -(lat - centerLat) * 25;
  const aircraftPos = [ax, altY, az];

  return (
    <>
      <Atmosphere />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[20, 25, 10]}
        intensity={0.5}
        color="#ffeedd"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-10, 5, -10]} intensity={0.15} color="#4488cc" />
      <hemisphereLight args={['#8899cc', '#112244', 0.3]} />

      <TerrainGround />

      {/* Clouds */}
      <Suspense fallback={null}>
        <CloudLayer />
      </Suspense>

      {/* Flight path */}
      {dep && arr && (
        <FlightPathArc3D
          depLat={dep.lat} depLng={dep.lon}
          arrLat={arr.lat} arrLng={arr.lon}
          progress={progress}
          centerLat={centerLat}
          centerLng={centerLng}
        />
      )}

      {/* Airport beacons */}
      {dep && (
        <AirportBeacon3D lat={dep.lat} lng={dep.lon} centerLat={centerLat} centerLng={centerLng} label={flight.departure} color="#ff9800" />
      )}
      {arr && (
        <AirportBeacon3D lat={arr.lat} lng={arr.lon} centerLat={centerLat} centerLng={centerLng} label={flight.arrival} color="#00e678" />
      )}

      {/* Altitude ring on ground below aircraft */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ax, -0.56, az]}>
        <ringGeometry args={[0.4, 0.55, 32]} />
        <meshBasicMaterial color="#00e678" opacity={0.5} transparent side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[ax, altY * 0.3, az]} intensity={0.6} color="#00e678" distance={12} />

      {/* Aircraft */}
      <DetailedAircraft
        position={[ax, altY, az]}
        heading={flight?.heading ?? 0}
        altitude={altM}
        speed={flight?.velocity ?? 0}
      />

      {/* Camera */}
      <ChaseCamera target={[ax, altY, az]} heading={flight?.heading ?? 0} />

      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        minDistance={2.5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.1}
        target={new THREE.Vector3(ax, altY * 0.4, az)}
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
      className="rounded-2xl overflow-hidden border border-white/[0.05] shadow-2xl shadow-black/40 relative"
    >
      <Canvas
        camera={{ position: [0, 6, 14], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#060d1a' }}
        shadows
      >
        <Suspense fallback={null}>
          <Scene flight={flight} progress={progress} />
        </Suspense>
      </Canvas>

      {/* Overlay */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/[0.08] text-xs text-white font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e678] animate-pulse" />
          {flight.callsign?.trim()} · {flight.status === 'en_route' ? 'EN ROUTE' : flight.status?.toUpperCase()}
        </div>
      </div>
      <div className="absolute top-3 right-3 z-10 pointer-events-none text-[10px] text-[#7a8ba0]/60 bg-black/30 backdrop-blur-sm rounded-lg px-2.5 py-1">
        Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}
