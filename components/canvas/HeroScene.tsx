"use client";
import { Suspense, useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
const PARTICLE_COUNT = 60;
const PARTICLE_DATA = Array.from({ length: PARTICLE_COUNT }, () => ({
  theta: Math.random() * Math.PI * 2,
  phi: Math.acos(2 * Math.random() - 1),
  speed: 0.4 + Math.random() * 0.8,
  phase: Math.random() * Math.PI * 2,
  radius: 1.4 + Math.random() * 1.2,
  // Size variation
  size: 0.012 + Math.random() * 0.022,
}));

function KnotParticles({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Track per-particle animated radius (for burst effect)
  const radii = useRef(PARTICLE_DATA.map(() => 0));
  const opacities = useRef(PARTICLE_DATA.map(() => 0));

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;

    PARTICLE_DATA.forEach((p, i) => {
      // Lerp radius in/out based on hover state
      const targetRadius = active ? p.radius : 0;
      radii.current[i] += (targetRadius - radii.current[i]) * 0.06;

      const targetOpacity = active ? 1 : 0;
      opacities.current[i] += (targetOpacity - opacities.current[i]) * 0.05;

      const r = radii.current[i];
      const angle = t * p.speed + p.phase;

      // Spherical coordinates → Cartesian, offset to knot position
      const x = 1.8 + r * Math.sin(p.phi) * Math.cos(angle);
      const y = r * Math.sin(p.phi) * Math.sin(angle * 0.7);
      const z = r * Math.cos(p.phi);

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(
        p.size * (0.7 + Math.sin(t * p.speed + p.phase) * 0.3),
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    (mesh.material as THREE.MeshStandardMaterial).opacity =
      Math.max(
        ...opacities.current.map(
          (o, i) =>
            o *
            (0.5 + Math.sin(clock.elapsedTime * PARTICLE_DATA[i].speed) * 0.3),
        ),
      ) * 0.9;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#C9A96E"
        emissive="#C9A96E"
        emissiveIntensity={0.6}
        transparent
        opacity={0}
        roughness={0}
        metalness={0.4}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

const RING_COUNT = 3;
const RING_INITIAL = [
  { progress: 0, opacity: 0 },
  { progress: 0.33, opacity: 0 },
  { progress: 0.66, opacity: 0 },
];

function RippleRings({ active }: { active: boolean }) {
  // Mutable animation state lives in a ref — never read during render
  const rings = useRef(RING_INITIAL.map((r) => ({ ...r })));
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({}, delta) => {
    rings.current.forEach((ring, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      if (active) {
        ring.progress = (ring.progress + delta * 0.35) % 1;
        ring.opacity = Math.sin(ring.progress * Math.PI) * 0.55;
      } else {
        ring.opacity += (0 - ring.opacity) * 0.08;
      }

      mesh.scale.setScalar(0.8 + ring.progress * 2.4);
      (mesh.material as THREE.MeshStandardMaterial).opacity = ring.opacity;
    });
  });

  return (
    <>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={[1.8, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          {/* <torusGeometry args={[1, 0.012, 8, 64]} />
          <meshStandardMaterial
            color="#C9A96E"
            emissive="#C9A96E"
            emissiveIntensity={0.4}
            transparent
            opacity={0}
            depthWrite={false}
          /> */}
        </mesh>
      ))}
    </>
  );
}

function usePointerForce(active: boolean) {
  const { size, camera } = useThree();
  const force = useRef(new THREE.Vector2(0, 0));
  const rawPointer = useRef(new THREE.Vector2(0, 0));

  useFrame(({ pointer }) => {
    if (!active) {
      force.current.lerp(new THREE.Vector2(0, 0), 0.08);
      return;
    }
    rawPointer.current.set(pointer.x, pointer.y);
    force.current.lerp(rawPointer.current, 0.1);
  });

  return force;
}

const HOVER_COLORS = [
  "#D4B483",
  "#C9A87C",
  "#DEC49A",
  "#C4A882",
  "#D8BF9E",
  "#BFA070",
];
function GlassKnot() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const force = usePointerForce(hovered);
  const currentColor = useRef(new THREE.Color("#E8D5B0"));
  const targetColor = useRef(new THREE.Color("#E8D5B0"));
  const colorIndex = useRef(0);

  const lerpedProps = useRef({
    thickness: 0.3,
    aberration: 0.06,
    distortion: 0.1,
  });
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleClick = () => {
    setClicked(true);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClicked(false), 3000);
  };
  useEffect(() => {
    if (hovered) {
      colorIndex.current = (colorIndex.current + 1) % HOVER_COLORS.length;
      targetColor.current.set(HOVER_COLORS[colorIndex.current]);
    } else {
      targetColor.current.set("#E8D5B0"); // idle cream
    }
  }, [hovered]);
  useEffect(() => {
    if (clicked) targetColor.current.set("#E8C060");
  }, [clicked]);

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current || !matRef.current) return;
    const t = state.clock.elapsedTime;

    // Base rotation
    meshRef.current.rotation.x = t * 0.08;
    meshRef.current.rotation.y = t * 0.12;

    // Pointer tilt
    groupRef.current.rotation.x +=
      (-force.current.y * 0.35 - groupRef.current.rotation.x) * 0.08;
    groupRef.current.rotation.y +=
      (force.current.x * 0.35 - groupRef.current.rotation.y) * 0.08;

    // Scale
    const targetScale = clicked ? 1.1 : hovered ? 1.06 : 1.0;
    groupRef.current.scale.setScalar(
      groupRef.current.scale.x +
        (targetScale - groupRef.current.scale.x) * 0.06,
    );
    currentColor.current.lerp(targetColor.current, 0.022);
    matRef.current.color.copy(currentColor.current);
    const p = lerpedProps.current;
    const speed = 0.04;
    p.thickness +=
      ((clicked ? 0.7 : hovered ? 0.5 : 0.3) - p.thickness) * speed;
    p.aberration +=
      ((clicked ? 0.18 : hovered ? 0.12 : 0.06) - p.aberration) * speed;
    p.distortion +=
      ((clicked ? 0.28 : hovered ? 0.18 : 0.1) - p.distortion) * speed;

    // MeshTransmissionMaterial extends MeshPhysicalMaterial — cast to access custom props
    const mat = matRef.current as THREE.MeshPhysicalMaterial & {
      thickness: number;
      chromaticAberration: number;
      distortion: number;
    };
    mat.thickness = p.thickness;
    mat.chromaticAberration = p.aberration;
    mat.distortion = p.distortion;
  });

  return (
    <>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group ref={groupRef}>
          <mesh
            ref={meshRef}
            position={[1.8, 0, 0]}
            onPointerEnter={() => {
              setHovered(true);
              document.body.style.cursor = "pointer";
            }}
            onPointerLeave={() => {
              setHovered(false);
              document.body.style.cursor = "auto";
            }}
            onClick={handleClick}
          >
            <torusKnotGeometry args={[1.2, 0.38, 200, 32, 6, 3]} />

            <MeshTransmissionMaterial
              // @ts-expect-error MeshTransmissionMaterial extends MeshPhysicalMaterial but types don't reflect custom props
              ref={matRef as React.Ref<THREE.MeshPhysicalMaterial>}
              backside
              samples={8}
              thickness={0.3}
              anisotropy={0.3}
              chromaticAberration={0.06}
              distortion={0.1}
              distortionScale={0.3}
              temporalDistortion={0.05}
              transmission={1}
              roughness={0.4}
              color="#E8D5B0"
            />
          </mesh>
        </group>
      </Float>
      <KnotParticles active={clicked} />
      {/* <RippleRings active={clicked} /> */}
    </>
  );
}

function SmallSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.6) * 0.4 - 0.5;
    ref.current.position.x =
      Math.cos(state.clock.elapsedTime * 0.4) * 0.5 + 2.2;
  });
  return (
    <mesh ref={ref} position={[2.2, -0.5, -0.5]}>
      <sphereGeometry args={[0.12, 32, 32]} />
      <meshStandardMaterial color="#C9A96E" roughness={0.2} metalness={0.8} />
    </mesh>
  );
}

function Ring() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.3;
    ref.current.rotation.z = state.clock.elapsedTime * 0.15;
  });
  return (
    <mesh ref={ref} position={[3.2, 1.2, -1.5]}>
      <torusGeometry args={[0.6, 0.03, 16, 80]} />
      <meshStandardMaterial color="#8C8580" roughness={0.5} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-3, -3, -3]} intensity={1} color="#C9A96E" />
      <Suspense fallback={null}>
        <GlassKnot />
        <SmallSphere />
        <Ring />
        <Environment preset="studio" />
      </Suspense>
      {/* <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.6}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
        makeDefault
      /> */}
    </Canvas>
  );
}
