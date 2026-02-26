"use client";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import Ring from "./Ring";
import SmallSphere from "./SmallSphere";
import GlassKnot from "./GlassKnot";

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
          <torusGeometry args={[1, 0.012, 8, 64]} />
          <meshStandardMaterial
            color="#C9A96E"
            emissive="#C9A96E"
            emissiveIntensity={0.4}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none", background: "transparent" }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={1.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-3, -3, -3]} intensity={1} color="#C9A96E" />
      <Suspense fallback={null}>
        <PerformanceMonitor onIncline={() => {}} onDecline={() => {}}>
          <GlassKnot />
        </PerformanceMonitor>
        <SmallSphere />
        <Ring />
        {/* <RippleRings active={true} /> */}
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
