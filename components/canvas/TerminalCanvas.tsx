import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SceneContent } from "./SkillsScene";

interface TerminalCanvasProps {
  activeTerminal: number;
  onCreated?: () => void; // ← add this
}
export function TerminalCanvas({
  activeTerminal,
  onCreated,
}: TerminalCanvasProps) {
  const dpr =
    typeof window !== "undefined" ? Math.min(1.5, window.devicePixelRatio) : 1;

  return (
    <Canvas
      camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 5] }}
      dpr={dpr}
      frameloop="demand"
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: "high-performance",
      }}
      shadows
      onWheel={(e) => e.stopPropagation()} // ✅ stop wheel hijack
      style={{ width: "100%", height: "100%", display: "block" }}
      onCreated={() => onCreated?.()}
    >
      <color attach="background" args={["#06080D"]} />
      <Suspense fallback={null}>
        <SceneContent activeTerminal={activeTerminal} />
      </Suspense>
    </Canvas>
  );
}
