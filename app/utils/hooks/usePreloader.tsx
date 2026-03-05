"use client";
import { useState, useCallback, useRef, useEffect } from "react";

export function usePreloader(taskNames: string[]) {
  const completed = useRef<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simVal = useRef(0);
  const released = useRef(false); // true once ceiling is lifted to 100

  // Lift the 89% ceiling — called when all tasks done OR timeout fires
  const release = useCallback(() => {
    if (released.current) return;
    released.current = true;
  }, []);

  const startSim = useCallback(() => {
    if (timerRef.current) return;

    // Safety timeout — if tasks never fire (e.g. mobile WebGL slow / hidden canvas)
    // release the ceiling after 6s so the user is never stuck
    const safetyTimeout = setTimeout(() => release(), 6000);

    timerRef.current = setInterval(() => {
      const allDone = completed.current.size >= taskNames.length;
      if (allDone) release();

      const ceil = released.current ? 100 : 89;
      simVal.current +=
        Math.random() *
        (simVal.current < 60
          ? 4
          : simVal.current < 80
            ? 1.5
            : simVal.current < ceil - 2
              ? 0.4
              : 0.05); // crawl near ceiling so it doesn't freeze visually
      simVal.current = Math.min(simVal.current, ceil);

      setProgress(Math.round(simVal.current));

      if (simVal.current >= 100 && timerRef.current) {
        clearInterval(timerRef.current);
        clearTimeout(safetyTimeout);
        timerRef.current = null;
      }
    }, 60);

    return () => {
      clearInterval(timerRef.current!);
      clearTimeout(safetyTimeout);
    };
  }, [taskNames.length, release]);

  const registerTask = useCallback(
    (name: string) => {
      completed.current.add(name);
      // If all tasks now done, release immediately
      if (completed.current.size >= taskNames.length) release();
    },
    [taskNames.length, release],
  );

  return { progress, registerTask, startSim };
}
