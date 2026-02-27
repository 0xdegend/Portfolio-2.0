import { useRef, useCallback, useEffect } from "react";

export function useCursorFollower_rAF(
  sectionRef: React.RefObject<HTMLElement | null>,
) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const numLabelRef = useRef<HTMLSpanElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);

  const mouseRef = useRef({ x: -9999, y: -9999 });
  const currentRef = useRef({ x: -9999, y: -9999 });
  const trackingRef = useRef(false); // when true we follow the pointer
  const visibleRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const ease = 0.18;
  const offset = { x: 20, y: -28 };
  const followerSize = { w: 180, h: 48 };

  const clampToViewport = (x: number, y: number) => {
    const padding = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = Math.min(Math.max(padding, x), vw - followerSize.w - padding);
    const cy = Math.min(Math.max(padding, y), vh - followerSize.h - padding);
    return { x: cx, y: cy };
  };
  const tick = useCallback(function tick() {
    const el = elRef.current;
    // if no element, cancel any scheduled loop
    if (!el) {
      rafRef.current = null;
      return;
    }

    // If we're not tracking, stop the loop immediately.
    // This is the key fix to prevent "sticky" chasing after hide().
    if (!trackingRef.current) {
      rafRef.current = null;
      return;
    }

    // Lerp current -> target (viewport coords)
    const mx = mouseRef.current.x + offset.x;
    const my = mouseRef.current.y + offset.y;

    const cx = currentRef.current.x + (mx - currentRef.current.x) * ease;
    const cy = currentRef.current.y + (my - currentRef.current.y) * ease;

    // Clamp so follower doesn't overflow the viewport
    const padding = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clx = Math.min(Math.max(padding, cx), vw - followerSize.w - padding);
    const cly = Math.min(Math.max(padding, cy), vh - followerSize.h - padding);

    currentRef.current.x = clx;
    currentRef.current.y = cly;
    el.style.transform = `translate3d(${clx}px, ${cly}px, 0)`;

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startLoop = useCallback(() => {
    // Ensure we only schedule once
    if (rafRef.current == null) {
      currentRef.current.x = mouseRef.current.x + offset.x;
      currentRef.current.y = mouseRef.current.y + offset.y;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);
  useEffect(() => {
    const section = sectionRef.current || window;
    if (!section) return;

    const handler = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    // responds when the pointer is inside the Projects area
    // @ts-expect-error DOM typing flexible for section/window
    section.addEventListener("pointermove", handler, { passive: true });

    return () => {
      // @ts-expect-error Typescript
      section.removeEventListener("pointermove", handler);
    };
  }, [sectionRef]);
  const show = useCallback(
    (num?: string, imageSrc?: string) => {
      const el = elRef.current;
      if (!el) return;

      // set numeric label if provided
      if (num && numLabelRef.current) numLabelRef.current.textContent = num;

      // set image src if provided
      if (imageSrc && imageRef.current) {
        // set immediately so image is visible on reveal
        imageRef.current.src = imageSrc;
      }

      trackingRef.current = true;
      visibleRef.current = true;

      // position follower immediately under mouse
      currentRef.current.x = mouseRef.current.x + offset.x;
      currentRef.current.y = mouseRef.current.y + offset.y;
      el.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px,0)`;

      el.style.transition =
        "opacity 0.22s cubic-bezier(.22,.9,.3,1), transform 0.18s";
      el.style.opacity = "1";
      el.style.scale = "1";

      // start the loop
      startLoop();
    },
    [startLoop],
  );

  const hide = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    trackingRef.current = false;
    visibleRef.current = false;
    stopLoop();
    el.style.transition = "opacity 0.16s ease-in, transform 0.18s";
    el.style.opacity = "0";
    el.style.scale = "0.96";
    if (arrowRef.current) {
      arrowRef.current.style.transform = "translateZ(0)";
    }
  }, [stopLoop]);
  const initFollower = useCallback((el: HTMLDivElement | null) => {
    elRef.current = el;
    if (!el) return;
    el.style.position = "fixed";
    el.style.left = "0";
    el.style.top = "0";
    el.style.pointerEvents = "none";
    el.style.willChange = "transform, opacity";
    el.style.opacity = "0";
    el.style.transform = "translate3d(-9999px, -9999px, 0)";
    el.style.zIndex = "9999";
  }, []);

  const initNumLabel = useCallback((el: HTMLSpanElement | null) => {
    numLabelRef.current = el;
  }, []);

  const initArrow = useCallback((el: HTMLSpanElement | null) => {
    arrowRef.current = el;
    if (el) {
      el.style.willChange = "transform";
      el.style.transform = "translateZ(0)";
    }
  }, []);

  const initImageRef = useCallback((el: HTMLImageElement | null) => {
    imageRef.current = el;
  }, []);

  // disable on touch devices
  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      const el = elRef.current;
      if (el) el.style.display = "none";
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    initFollower,
    initNumLabel,
    initArrow,
    initImageRef, // <- new
    show,
    hide,
  };
}
