import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SceneContent } from "./SkillsScene";
export function TerminalCanvas({ activeTerminal }: { activeTerminal: number }) {
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
      }}
      shadows
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <color attach="background" args={["#06080D"]} />
      <Suspense fallback={null}>
        <SceneContent activeTerminal={activeTerminal} />
      </Suspense>
    </Canvas>
  );
}
