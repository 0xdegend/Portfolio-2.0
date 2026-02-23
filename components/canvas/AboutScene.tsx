"use client";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useGLTF,
  Float,
} from "@react-three/drei";
import * as THREE from "three";

function Model() {
  const { scene } = useGLTF("/models/mascot.glb");

  // Make all materials slightly rough for an editorial look
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.roughness = Math.max(mat.roughness ?? 0.5, 0.3);
      }
    }
  });

  return (
    <Float speed={0.8} floatIntensity={0.4} rotationIntensity={0.1}>
      <primitive object={scene} scale={0.015} position={[0, -2, 0]} />
    </Float>
  );
}

// Fallback geometry shown until user provides their model
function FallbackModel() {
  return (
    <Float speed={0.8} floatIntensity={0.5}>
      <mesh>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color="#C9A96E"
          roughness={0.3}
          metalness={0.6}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

function SceneContent() {
  // Try loading the model; if it fails, show the fallback
  // In production, swap FallbackModel for <Model /> after adding your .glb
  return (
    <>
      {/* TODO: Replace FallbackModel with <Model /> after placing your .glb in /public/models/ */}
      <Model />
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.15}
        scale={6}
        blur={2}
        far={4}
        color="#0F0E0C"
      />
    </>
  );
}

export default function AboutScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 4, 4]} intensity={2} castShadow />
      <pointLight position={[-4, 2, -2]} intensity={0.5} color="#C9A96E" />

      <Suspense fallback={null}>
        <SceneContent />
        <Environment preset="studio" />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.6}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </Canvas>
  );
}
