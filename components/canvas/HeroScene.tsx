"use client";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";

function GlassKnot() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef} position={[1.8, 0, 0]} scale={1}>
        <torusKnotGeometry args={[1.2, 0.38, 200, 32, 2, 3]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.3}
          anisotropy={0.3}
          chromaticAberration={0.06}
          distortion={0.1}
          distortionScale={0.3}
          temporalDistortion={0.05}
          transmission={1}
          roughness={0.0}
          color="#E8D5B0"
        />
      </mesh>
    </Float>
  );
}

function SmallSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    // Orbits around the knot on the right side — clamped so it never drifts left
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
    // Tucked behind and to the right of the knot
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-3, -3, -3]} intensity={0.8} color="#C9A96E" />
      <Suspense fallback={null}>
        <GlassKnot />
        <SmallSphere />
        <Ring />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}
