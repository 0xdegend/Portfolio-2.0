import React, { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import KnotParticles from "./KnotParticles";

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

const GlassKnot = () => {
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
};

export default GlassKnot;
