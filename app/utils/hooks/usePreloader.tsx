"use client";
import { useState, useCallback, useRef } from "react";

/**
 * Tracks N named "tasks" (e.g. each 3D scene) and a simulated
 * background progress that holds below 90% until all tasks resolve.
 *
 * Usage:
 *   const { progress, registerTask } = usePreloader(["heroScene", "skillScene"]);
 *   // In HeroScene:  useEffect(() => { registerTask("heroScene") }, [])
 */
export function usePreloader(taskNames: string[]) {
  const completed = useRef<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simVal = useRef(0);

  // Start simulated crawl immediately — holds below 90 until tasks done
  const startSim = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      const allDone = completed.current.size >= taskNames.length;
      const ceil = allDone ? 100 : 89;
      simVal.current +=
        Math.random() *
        (simVal.current < 60 ? 4 : simVal.current < 80 ? 1.5 : 0.4);
      simVal.current = Math.min(simVal.current, ceil);

      setProgress(Math.round(simVal.current));

      if (simVal.current >= 100 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 60);
  }, [taskNames.length]);

  // Call this once inside each 3D scene when it's ready
  const registerTask = useCallback((name: string) => {
    completed.current.add(name);
    // Once all tasks are done, release the 90% ceiling
    // The interval will now crawl to 100
  }, []);

  return { progress, registerTask, startSim };
}
