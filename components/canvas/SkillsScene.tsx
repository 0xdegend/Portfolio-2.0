import { useEffect, useRef } from "react";
import { useFrame, useThree, invalidate } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { TerminalPlane, TerminalPlaneProps } from "../canvas/TerminalPlane";

const ACCENT = "#C9A87C";

const TERMINAL_CODE = [
  // Terminal A — Frontend
  `// components/Hero.tsx
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1,
        duration: 0.8, ease: 'expo.out' }
    );
  }, []);

  return (
    <main className="hero">
      <h1 ref={titleRef}>
        Crafting elegant experiences.
      </h1>
    </main>
  );
}`,

  // Terminal B — Tools
  `#!/bin/bash
# deploy.sh — production pipeline

set -euo pipefail

echo "→ Running tests..."
pnpm vitest run

echo "→ Type-checking..."
pnpm tsc --noEmit

echo "→ Building image..."
docker build -t app:latest .
docker push registry/app:latest

echo "→ Rolling deploy..."
aws ecs update-service \\
  --cluster prod \\
  --service app \\
  --force-new-deployment

echo "✓ Deployed."`,
];
export function SceneContent({ activeTerminal }: { activeTerminal: number }) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      invalidate();
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    camera.position.set(
      Math.sin(t * 0.11) * 0.09 + mouseRef.current.x * 0.13,
      -Math.sin(t * 0.08) * 0.045 - mouseRef.current.y * 0.08,
      5 + Math.sin(t * 0.07) * 0.18,
    );
    camera.lookAt(0, 0, 0);
  });

  const accentPos: [number, number, number][] = [
    [-3.6, 0.25, -0.5],
    [0, 0, 0.2],
    [3.6, 0.25, -0.5],
  ];

  const terminals: TerminalPlaneProps[] = [
    {
      position: [-3.6, 0.25, -0.5],
      rotation: [0, 0.28, 0],
      codeText: TERMINAL_CODE[0],
      startDelay: 200,
      isActive: activeTerminal === 0,
    },
    {
      position: [0, 0, 0.2],
      rotation: [0, 0, 0],
      codeText: TERMINAL_CODE[1],
      startDelay: 900,
      isActive: activeTerminal === 1,
    },
  ];

  return (
    <>
      <ambientLight intensity={0.16} />
      <directionalLight
        color="#FFE4B5"
        intensity={1.6}
        position={[4, 5, 6]}
        castShadow
      />
      <pointLight color="#4466FF" intensity={0.9} position={[-5, 2, 3]} />
      <pointLight color="#FF6633" intensity={0.45} position={[0, -3, -3]} />
      {/* Accent key light tracks active terminal */}
      <pointLight
        color={ACCENT}
        intensity={0.7}
        position={accentPos[activeTerminal]}
        distance={7}
      />

      {terminals.map((p, i) => (
        <TerminalPlane key={i} {...p} />
      ))}

      <mesh position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial
          color="#060810"
          roughness={0.03}
          metalness={0.0}
          transparent
          opacity={0.65}
        />
      </mesh>

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.22}
          luminanceSmoothing={0.9}
          intensity={1.0}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0016, 0.0016)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.38} darkness={0.72} />
      </EffectComposer>
    </>
  );
}
