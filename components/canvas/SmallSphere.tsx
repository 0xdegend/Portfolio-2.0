import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
const SmallSphere = () => {
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
};

export default SmallSphere;
