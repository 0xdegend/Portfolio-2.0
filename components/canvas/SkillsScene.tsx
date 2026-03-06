import { useEffect, useRef } from "react";
import { useFrame, useThree, invalidate } from "@react-three/fiber";
import { gsap } from "gsap";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { TerminalPlane } from "../canvas/TerminalPlane";

const ACCENT = "#C9A87C";
const TERMINAL_CODE = [
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

  `# PROJ-142 · feat: hero animation refactor

$ git add -A
$ git commit -m "feat(hero): gsap entrance + scroll trigger
  closes PROJ-142"
$ git push origin feat/hero-animation

  ▲ Vercel · Preview → building... ✓ 28s
  ↗ https://app-git-feat-hero.vercel.app

$ gh pr create --reviewer @lead
  ✓ PR #38 · CI passed · ready to merge

$ git checkout main && git merge feat/hero-animation
$ git push origin main

  ▲ Vercel · Production · 0 errors · 98  lighthouse
  ✓ Jira PROJ-142 → Done · sprint 12 closed

  ✓ Deployed to production.`,
];

const CENTER_POSITION: [number, number, number] = [0, 0, 0];
const CENTER_ROTATION: [number, number, number] = [0, 0, 0];

export function SceneContent({ activeTerminal }: { activeTerminal: number }) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const camRef = useRef({ x: 0, y: 0, z: 5 });

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      invalidate();
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  useEffect(() => {
    const targets = [
      { x: -0.15, y: 0.05, z: 5 },
      { x: 0.1, y: -0.05, z: 5 },
    ];
    gsap.killTweensOf(camRef.current);
    gsap.to(camRef.current, {
      ...targets[activeTerminal],
      duration: 1.2,
      ease: "expo.inOut",
      onUpdate: () => invalidate(),
    });
  }, [activeTerminal]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    camera.position.set(
      camRef.current.x + Math.sin(t * 0.11) * 0.06 + mouseRef.current.x * 0.1,
      camRef.current.y - Math.sin(t * 0.08) * 0.03 - mouseRef.current.y * 0.06,
      camRef.current.z + Math.sin(t * 0.07) * 0.12,
    );
    camera.lookAt(0, 0, 0);
  });

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
      <pointLight
        color={ACCENT}
        intensity={0.8}
        position={[0, 2, 3]}
        distance={8}
      />
      <TerminalPlane
        key={activeTerminal}
        position={CENTER_POSITION}
        rotation={CENTER_ROTATION}
        codeText={TERMINAL_CODE[activeTerminal]}
        startDelay={0}
        isActive={true}
      />

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
