"use client";
import { useRef, useCallback, useEffect, RefObject } from "react";
import { gsap } from "gsap";

export function useCursorFollower_rAF(
  sectionRef: RefObject<HTMLElement | null>,
) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const imgARef = useRef<HTMLImageElement | null>(null);
  const imgBRef = useRef<HTMLImageElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const visible = useRef(false);
  const parked = useRef(true); // box is off-screen and needs to snap on next show
  const currentSrc = useRef<string>("");
  const slot = useRef<"a" | "b">("a"); // which img is currently front
  const tlImg = useRef<gsap.core.Timeline | null>(null);

  // ── Init refs ────────────────────────────────────────────────────────────
  const initFollower = useCallback((el: HTMLDivElement | null) => {
    wrapRef.current = el;
    if (!el) return;
    innerRef.current = el.querySelector(
      "[data-cursor-inner]",
    ) as HTMLDivElement;
    imgARef.current = el.querySelector(
      "[data-cursor-img-a]",
    ) as HTMLImageElement;
    imgBRef.current = el.querySelector(
      "[data-cursor-img-b]",
    ) as HTMLImageElement;
  }, []);

  const startRAF = useCallback(() => {
    if (rafId.current) return;
    const loop = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.1;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.1;
      if (wrapRef.current) {
        gsap.set(wrapRef.current, {
          x: pos.current.x + 20,
          y: pos.current.y - 65,
        });
      }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
  }, []);

  const stopRAF = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  // A single mousemove listener kept alive for the lifetime of the section so
  // mouse.current is always fresh (needed to snap the box to the cursor on
  // show). Tilt only runs while the box is visible.
  const onMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
    const inner = innerRef.current;
    if (!inner || !visible.current) return;
    const rect = inner.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    gsap.to(inner, {
      rotationY: nx * 14,
      rotationX: -ny * 8,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.addEventListener("mousemove", onMouseMove);
    return () => section.removeEventListener("mousemove", onMouseMove);
  }, [sectionRef, onMouseMove]);

  // Crossfade + 3D flip that self-heals if interrupted: every call kills any
  // in-flight tweens on BOTH images and always drives the outgoing slot to
  // opacity 0 and the incoming slot to opacity 1, so we can never get stuck
  // with two half-rotated images on screen.
  const swapImage = useCallback((newSrc: string) => {
    if (newSrc === currentSrc.current) return;
    currentSrc.current = newSrc;

    const a = imgARef.current;
    const b = imgBRef.current;
    if (!a || !b) return;

    const front = slot.current === "a" ? a : b;
    const back = slot.current === "a" ? b : a;

    tlImg.current?.kill();
    gsap.killTweensOf([a, b]);

    back.src = newSrc;
    gsap.set(back, { opacity: 0, rotationY: -22, scale: 0.92, zIndex: 2 });
    gsap.set(front, { zIndex: 1 });

    const tl = gsap.timeline();
    tl.to(
      front,
      {
        opacity: 0,
        rotationY: 22,
        scale: 0.92,
        duration: 0.34,
        ease: "power2.in",
        overwrite: true,
      },
      0,
    );
    tl.to(
      back,
      {
        opacity: 1,
        rotationY: 0,
        scale: 1,
        duration: 0.42,
        ease: "expo.out",
        overwrite: true,
      },
      0.1,
    );

    slot.current = slot.current === "a" ? "b" : "a";
    tlImg.current = tl;
  }, []);

  const show = useCallback(
    (_num?: string, imageSrc?: string) => {
      if (!wrapRef.current) return;

      if (imageSrc) swapImage(imageSrc);

      if (!visible.current) {
        visible.current = true;
        // If the box was parked off-screen, snap it to the cursor so it fades
        // in at the pointer instead of flying across the screen.
        if (parked.current) {
          pos.current.x = mouse.current.x;
          pos.current.y = mouse.current.y;
          parked.current = false;
          if (wrapRef.current) {
            gsap.set(wrapRef.current, {
              x: pos.current.x + 20,
              y: pos.current.y - 65,
            });
          }
        }
        startRAF();
        gsap.to(wrapRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.38,
          ease: "back.out(1.4)",
          overwrite: true,
        });
      }
    },
    [swapImage, startRAF],
  );

  const hide = useCallback(() => {
    if (!wrapRef.current) return;

    visible.current = false;
    stopRAF();

    gsap.to(wrapRef.current, {
      opacity: 0,
      scale: 0.88,
      duration: 0.28,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => {
        // Only park if a new row hasn't re-shown the box in the meantime.
        if (visible.current) return;
        parked.current = true;
        if (wrapRef.current) gsap.set(wrapRef.current, { x: -9999, y: -9999 });
        if (innerRef.current)
          gsap.set(innerRef.current, { rotationX: 0, rotationY: 0 });
      },
    });
  }, [stopRAF]);

  const initNumLabel = useCallback(() => {}, []);
  const initArrow = useCallback(() => {}, []);
  const initImageRef = useCallback(() => {}, []);

  return { initFollower, initNumLabel, initArrow, initImageRef, show, hide };
}
