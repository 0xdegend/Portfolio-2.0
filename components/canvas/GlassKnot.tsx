"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  PerformanceMonitor,
  usePerformanceMonitor,
} from "@react-three/drei";
import * as THREE from "three";
import KnotParticles from "./KnotParticles";

// ─── Module-level constants — never allocated inside render / frame loops ──────
const ZERO_VEC2 = new THREE.Vector2(0, 0);
const _scratchVec2 = new THREE.Vector2();

const HOVER_COLORS = [
  "#D4B483",
  "#C9A87C",
  "#DEC49A",
  "#C4A882",
  "#D8BF9E",
  "#BFA070",
] as const;

const IDLE_COLOR = "#E8D5B0";
const CLICK_COLOR = "#E8C060";

// ─── Pointer force hook ────────────────────────────────────────────────────────
function usePointerForce(active: boolean) {
  const force = useRef(new THREE.Vector2(0, 0));

  useFrame(({ pointer }) => {
    if (!active) {
      force.current.lerp(ZERO_VEC2, 0.08);
      return;
    }
    _scratchVec2.set(pointer.x, pointer.y);
    force.current.lerp(_scratchVec2, 0.1);
  });

  return force;
}
export default function GlassKnot() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const force = usePointerForce(hovered);

  const currentColor = useRef(new THREE.Color(IDLE_COLOR));
  const targetColor = useRef(new THREE.Color(IDLE_COLOR));
  const colorIndex = useRef(0);

  const lerpedProps = useRef({
    thickness: 0.3,
    aberration: 0.06,
    distortion: 0.1,
  });

  // Adaptive samples — safe now because <PerformanceMonitor> is an ancestor
  const samplesRef = useRef(4);
  usePerformanceMonitor({
    onIncline: () => {
      samplesRef.current = 4;
    },
    onDecline: () => {
      samplesRef.current = 2;
    },
  });

  // Click timer
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleClick = () => {
    setClicked(true);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClicked(false), 3000);
  };
  useEffect(() => {
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

  // Target color on hover / click state change
  useEffect(() => {
    if (hovered) {
      colorIndex.current = (colorIndex.current + 1) % HOVER_COLORS.length;
      targetColor.current.set(HOVER_COLORS[colorIndex.current]);
    } else {
      targetColor.current.set(IDLE_COLOR);
    }
  }, [hovered]);

  useEffect(() => {
    if (clicked) targetColor.current.set(CLICK_COLOR);
  }, [clicked]);

  // Memoized geometry args — prevents geometry rebuild on re-render
  const knotArgs = useMemo<[number, number, number, number, number, number]>(
    () => [1.2, 0.38, 200, 32, 6, 3],
    [],
  );

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

    // Dead-band scale lerp
    const targetScale = clicked ? 1.1 : hovered ? 1.06 : 1.0;
    const scaleDiff = targetScale - groupRef.current.scale.x;
    if (Math.abs(scaleDiff) > 0.001) {
      groupRef.current.scale.setScalar(
        groupRef.current.scale.x + scaleDiff * 0.06,
      );
    }

    // Dead-band color lerp
    if (
      Math.abs(currentColor.current.r - targetColor.current.r) > 0.001 ||
      Math.abs(currentColor.current.g - targetColor.current.g) > 0.001
    ) {
      currentColor.current.lerp(targetColor.current, 0.022);
      matRef.current.color.copy(currentColor.current);
    }

    // Dead-band material prop lerps
    const p = lerpedProps.current;
    const tgtThick = clicked ? 0.7 : hovered ? 0.5 : 0.3;
    const tgtAberr = clicked ? 0.18 : hovered ? 0.12 : 0.06;
    const tgtDist = clicked ? 0.28 : hovered ? 0.18 : 0.1;

    const thickDiff = tgtThick - p.thickness;
    const aberrDiff = tgtAberr - p.aberration;
    const distDiff = tgtDist - p.distortion;

    if (
      Math.abs(thickDiff) > 0.001 ||
      Math.abs(aberrDiff) > 0.001 ||
      Math.abs(distDiff) > 0.001
    ) {
      p.thickness += thickDiff * 0.04;
      p.aberration += aberrDiff * 0.04;
      p.distortion += distDiff * 0.04;

      const mat = matRef.current as THREE.MeshPhysicalMaterial & {
        thickness: number;
        chromaticAberration: number;
        distortion: number;
        samples: number;
      };
      mat.thickness = p.thickness;
      mat.chromaticAberration = p.aberration;
      mat.distortion = p.distortion;
      mat.samples = samplesRef.current;
    }
  });

  return (
    <>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group ref={groupRef}>
          <mesh
            ref={meshRef}
            position={[0.5, -0.2, 0]}
            scale={1.1}
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
            <torusKnotGeometry args={knotArgs} />
            <MeshTransmissionMaterial
              // @ts-expect-error — MeshTransmissionMaterial has props not reflected in MeshPhysicalMaterial types
              ref={matRef as React.Ref<THREE.MeshPhysicalMaterial>}
              backside
              samples={4}
              thickness={0.3}
              anisotropy={0.3}
              chromaticAberration={0.06}
              distortion={0.1}
              distortionScale={0.3}
              temporalDistortion={0.05}
              transmission={1}
              roughness={0.4}
              color={IDLE_COLOR}
            />
          </mesh>
        </group>
      </Float>
      <KnotParticles active={clicked} />
    </>
  );
}
