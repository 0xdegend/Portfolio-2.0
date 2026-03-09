"use client";
import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerformanceMonitor } from "@react-three/drei";
import Ring from "./Ring";
import SmallSphere from "./SmallSphere";
import GlassKnot from "./GlassKnot";

interface HeroSceneProps {
  onReady?: () => void;
}

const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

export default function HeroScene({ onReady }: HeroSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%" }}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        style={{ background: "transparent" }}
        dpr={isMobile ? [0.8, 1] : [1, 1.5]}
        performance={{ min: 0.5 }}
        onWheel={(e) => e.stopPropagation()}
        onCreated={() => onReady?.()}
      >
        <ambientLight intensity={1.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-3, -3, -3]} intensity={1} color="#C9A96E" />

        <Suspense fallback={null}>
          <PerformanceMonitor onIncline={() => {}} onDecline={() => {}}>
            <GlassKnot />
          </PerformanceMonitor>
          {isMobile ? <></> : <SmallSphere />}
          {isMobile ? <></> : <Ring />}
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}
