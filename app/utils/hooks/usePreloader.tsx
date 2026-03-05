"use client";
import { useState, useCallback, useRef } from "react";

export function usePreloader(taskNames: string[]) {
  const completed = useRef<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simVal = useRef(0);
  const released = useRef(false);

  const release = useCallback(() => {
    if (released.current) return;
    released.current = true;
  }, []);

  const startSim = useCallback(() => {
    if (timerRef.current) return;

    // Safety timeout — 2.5s max, not 6s
    const safetyTimeout = setTimeout(() => release(), 2500);

    timerRef.current = setInterval(() => {
      const allDone = completed.current.size >= taskNames.length;
      if (allDone) release();

      const ceil = released.current ? 100 : 89;

      // Fast increments — no more crawling near the ceiling
      const increment =
        simVal.current < 50
          ? 6 + Math.random() * 6 // 6–12 per tick
          : simVal.current < 75
            ? 4 + Math.random() * 4 // 4–8
            : simVal.current < 88
              ? 2 + Math.random() * 2 // 2–4
              : released.current
                ? 3 + Math.random() * 3 // 3–6 sprint to 100
                : 0.3; // hold just below 89

      simVal.current = Math.min(simVal.current + increment, ceil);
      setProgress(Math.round(simVal.current));

      if (simVal.current >= 100 && timerRef.current) {
        clearInterval(timerRef.current);
        clearTimeout(safetyTimeout);
        timerRef.current = null;
      }
    }, 40); // 40ms ticks instead of 60ms

    return () => {
      clearInterval(timerRef.current!);
      clearTimeout(safetyTimeout);
    };
  }, [taskNames.length, release]);

  const registerTask = useCallback(
    (name: string) => {
      completed.current.add(name);
      if (completed.current.size >= taskNames.length) release();
    },
    [taskNames.length, release],
  );

  return { progress, registerTask, startSim };
}
