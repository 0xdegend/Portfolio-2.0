import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
const Ring = () => {
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
};

export default Ring;
