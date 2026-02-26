import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
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
const KnotParticles = ({ active }: { active: boolean }) => {
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
};

export default KnotParticles;
