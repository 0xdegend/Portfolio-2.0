"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Single shared Lenis instance for the whole page. Exposed so scroll-driven
 * effects (velocity skew, the horizontal Projects track, etc.) can read scroll
 * velocity / position without re-initialising smooth scroll.
 */
let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/**
 * Wires Lenis smooth scroll into the GSAP ticker and keeps ScrollTrigger in
 * sync, the way evok / lindaikechukwu do it. Honors `prefers-reduced-motion`
 * (falls back to native scroll) and only runs once `enabled` is true — so it
 * doesn't fight the preloader, which locks scrolling until the page is revealed.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    lenis = new Lenis({
      duration: 1.1,
      // expo-style ease — snappy start, long glide. Matches the reference sites.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // native scroll on touch — better mobile UX
      anchors: true, // smooth in-page nav (#about, #projects, …) for free
    });

    // Drive ScrollTrigger off Lenis' scroll, and Lenis off GSAP's ticker.
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Positions changed now that the page is revealed — recalc triggers.
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refresh);
      gsap.ticker.remove(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, [enabled]);
}
