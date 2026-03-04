"use client";
import { useRef, useCallback, RefObject } from "react";
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
  const currentSrc = useRef<string>("");
  const slot = useRef<"a" | "b">("a"); // which img is "on top"
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
    });
  }, []);
  const swapImage = useCallback((newSrc: string) => {
    if (newSrc === currentSrc.current) return;
    currentSrc.current = newSrc;

    const a = imgARef.current;
    const b = imgBRef.current;
    if (!a || !b) return;

    tlImg.current?.kill();
    const tl = gsap.timeline();

    if (slot.current === "a") {
      b.src = newSrc;
      gsap.set(b, { opacity: 0, rotationY: -25, scale: 0.9 });
      tl.to(
        a,
        {
          opacity: 0,
          rotationY: 25,
          scale: 0.9,
          duration: 0.38,
          ease: "power2.in",
        },
        0,
      );
      tl.to(
        b,
        {
          opacity: 1,
          rotationY: 0,
          scale: 1,
          duration: 0.42,
          ease: "expo.out",
        },
        0.12,
      );
      slot.current = "b";
    } else {
      a.src = newSrc;
      gsap.set(a, { opacity: 0, rotationY: -25, scale: 0.9 });
      tl.to(
        b,
        {
          opacity: 0,
          rotationY: 25,
          scale: 0.9,
          duration: 0.38,
          ease: "power2.in",
        },
        0,
      );
      tl.to(
        a,
        {
          opacity: 1,
          rotationY: 0,
          scale: 1,
          duration: 0.42,
          ease: "expo.out",
        },
        0.12,
      );
      slot.current = "a";
    }

    tlImg.current = tl;
  }, []);
  const show = useCallback(
    (_num?: string, imageSrc?: string) => {
      if (!wrapRef.current) return;
      const section = sectionRef.current;
      if (section) section.addEventListener("mousemove", onMouseMove);

      if (imageSrc) swapImage(imageSrc);

      if (!visible.current) {
        visible.current = true;
        startRAF();
        gsap.to(wrapRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.38,
          ease: "back.out(1.4)",
        });
      }
    },
    [sectionRef, onMouseMove, swapImage, startRAF],
  );

  const hide = useCallback(() => {
    if (!wrapRef.current) return;
    const section = sectionRef.current;
    if (section) section.removeEventListener("mousemove", onMouseMove);

    visible.current = false;
    stopRAF();

    gsap.to(wrapRef.current, {
      opacity: 0,
      scale: 0.88,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => {
        if (wrapRef.current) gsap.set(wrapRef.current, { x: -9999, y: -9999 });
        if (innerRef.current)
          gsap.set(innerRef.current, { rotationX: 0, rotationY: 0 });
      },
    });
  }, [sectionRef, onMouseMove, stopRAF]);

  const initNumLabel = useCallback(() => {}, []);
  const initArrow = useCallback(() => {}, []);
  const initImageRef = useCallback(() => {}, []);

  return { initFollower, initNumLabel, initArrow, initImageRef, show, hide };
}
