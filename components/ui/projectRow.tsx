"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../utils/data/project";
gsap.registerPlugin(ScrollTrigger, SplitText);

type Project = (typeof projects)[number];

export function ProjectRow({
  project,
  index,
  onEnter,
  onLeave,
}: {
  project: Project;
  index: number;
  onEnter: (num?: string, imageSrc?: string) => void;
  onLeave: () => void;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  // quickTo handles (magnetic arrow + tilt)
  const qArrX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qArrY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qTiltX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qTiltY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  // Respect reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll / entrance animations (SplitText)
  useGSAP(
    () => {
      const row = rowRef.current;
      if (!row) return;

      // Number slide-in
      gsap.fromTo(
        numRef.current,
        { x: -16, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 88%",
            once: true,
          },
          delay: index * 0.06,
        },
      );

      // Title word stagger
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: "words" });
        gsap.fromTo(
          split.words,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.72,
            stagger: 0.06,
            ease: "expo.out",
            scrollTrigger: {
              trigger: row,
              start: "top 88%",
              once: true,
            },
            delay: index * 0.06 + 0.06,
            onComplete: () => split.revert(),
          },
        );
      }

      // Description fade, tech pills pop (keeps your previous behavior)
      gsap.fromTo(
        row.querySelector(".proj-desc"),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: row,
            start: "top 86%",
            once: true,
          },
          delay: index * 0.06 + 0.16,
        },
      );

      gsap.fromTo(
        row.querySelectorAll(".proj-tech"),
        { scale: 0.78, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          stagger: 0.04,
          ease: "back.out(2.5)",
          scrollTrigger: {
            trigger: row,
            start: "top 86%",
            once: true,
          },
          delay: index * 0.06 + 0.22,
        },
      );
    },
    { scope: rowRef },
  );

  // Setup quickTo instances for arrow and tilt once
  useEffect(() => {
    if (!arrowRef.current || !rowRef.current) return;
    qArrX.current = gsap.quickTo(arrowRef.current, "x", {
      duration: 0.36,
      ease: "power2.out",
    });
    qArrY.current = gsap.quickTo(arrowRef.current, "y", {
      duration: 0.36,
      ease: "power2.out",
    });
    // tilt on row (rotationX / rotationY gives subtle 3D feel)
    qTiltX.current = gsap.quickTo(rowRef.current, "rotationX", {
      duration: 0.45,
      ease: "power2.out",
    });
    qTiltY.current = gsap.quickTo(rowRef.current, "rotationY", {
      duration: 0.45,
      ease: "power2.out",
    });

    // Ensure row preserves 3D visually
    if (rowRef.current) {
      rowRef.current.style.transformStyle = "preserve-3d";
      rowRef.current.style.willChange = "transform";
    }

    return () => {
      // kill any active quickTos on unmount
      qArrX.current = null;
      qArrY.current = null;
      qTiltX.current = null;
      qTiltY.current = null;
    };
  }, []);

  // Hover / focus enter
  const handleEnter = useCallback(() => {
    // expose preview box
    onEnter(project.number, project.image);

    if (prefersReducedMotion) {
      // subtle immediate styles for reduced motion users
      if (numRef.current) numRef.current.style.transform = "translateX(4px)";
      if (glowRef.current) glowRef.current.style.opacity = "1";
      if (lineRef.current) lineRef.current.style.transform = "scaleX(1)";
      return;
    }

    // number nudge + color
    gsap.to(numRef.current, {
      x: 6,
      color: "var(--accent)",
      duration: 0.28,
      ease: "power2.out",
    });

    // glow sweep
    gsap.fromTo(
      glowRef.current,
      { scaleX: 0, opacity: 1, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.46, ease: "expo.out" },
    );

    // underline sweep
    gsap.to(lineRef.current, { scaleX: 1, duration: 0.42, ease: "expo.out" });

    // title tiny micro-lift
    gsap.to(titleRef.current, {
      y: -4,
      duration: 0.4,
      ease: "power2.out",
      overwrite: true,
    });

    // arrow pop-in subtle scale
    gsap.fromTo(
      arrowRef.current,
      { scale: 0.9, opacity: 0.75 },
      { scale: 1, opacity: 1, duration: 0.28, ease: "back.out(2)" },
    );
  }, [onEnter, project.number, project.image, prefersReducedMotion]);

  // Leave / blur
  const handleLeave = useCallback(() => {
    onLeave();

    if (prefersReducedMotion) {
      if (numRef.current) numRef.current.style.transform = "";
      if (glowRef.current) glowRef.current.style.opacity = "";
      if (lineRef.current) lineRef.current.style.transform = "";
      return;
    }

    gsap.to(numRef.current, {
      x: 0,
      color: "",
      duration: 0.45,
      ease: "elastic.out(1, 0.5)",
    });

    gsap.to(glowRef.current, { opacity: 0, duration: 0.28, ease: "power2.in" });
    gsap.to(lineRef.current, { scaleX: 0, duration: 0.32, ease: "power2.in" });

    gsap.to(titleRef.current, {
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.6)",
    });

    // reset arrow quickTo
    qArrX.current?.(0);
    qArrY.current?.(0);

    // reset tilt
    qTiltX.current?.(0);
    qTiltY.current?.(0);
  }, [onLeave, prefersReducedMotion]);

  // Mouse move inside row: arrow magnetic + tilt
  const handleMouseMoveLocal = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion) return;
      const row = rowRef.current;
      const arrow = arrowRef.current;
      if (!row) return;

      const rect = row.getBoundingClientRect();
      // normalized -1..1
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // tilt: small rotation amounts
      qTiltX.current?.(-ny * 4); // tilt up/down
      qTiltY.current?.(nx * 6); // tilt left/right

      // arrow magnetic: if arrow present move small %
      if (arrow) {
        const arRect = arrow.getBoundingClientRect();
        const cx = arRect.left + arRect.width / 2;
        const cy = arRect.top + arRect.height / 2;
        const dx = (e.clientX - cx) * 0.18;
        const dy = (e.clientY - cy) * 0.14;
        qArrX.current?.(gsap.utils.clamp(-6, 6, dx));
        qArrY.current?.(gsap.utils.clamp(-6, 6, dy));
      }
    },
    [prefersReducedMotion],
  );

  // keyboard support: focus/blur on the row should behave like hover
  // attach onFocus/onBlur to row container below

  return (
    <div className="relative">
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
      >
        <div
          ref={rowRef}
          className="relative border-t border-muted py-8 grid grid-cols-12 gap-x-6 gap-y-4 items-start px-2 -mx-2"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onMouseMove={handleMouseMoveLocal}
          onFocus={handleEnter} // keyboard focus
          onBlur={handleLeave}
        >
          <div className="col-span-1 pt-1">
            <span
              ref={numRef}
              className="font-mono text-xs text-stone/40 inline-block"
              style={{ willChange: "transform, color" }}
            >
              {project.number}
            </span>
          </div>

          <div className="col-span-12 md:col-span-6">
            <div className="overflow-hidden mb-3">
              <h3
                ref={titleRef}
                className="font-display text-3xl md:text-4xl font-light text-ink"
                style={{ willChange: "transform" }}
              >
                {project.title}
              </h3>
            </div>
            <p className="proj-desc text-stone text-sm leading-relaxed font-light max-w-md">
              {project.description}
            </p>
          </div>

          <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
            <span className="proj-meta-item section-label text-stone/60">
              {project.category}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="proj-tech proj-meta-item font-mono text-xs px-2 py-0.5 border border-muted text-stone/70 rounded-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-2 flex md:flex-col md:items-end gap-4 md:gap-2 justify-between items-center">
            <span className="proj-meta-item font-mono text-xs text-stone/40">
              {project.year}
            </span>

            {/* arrow + warm glow + thin underline (for sweep) */}
            <div className="relative flex items-center">
              <div
                ref={glowRef}
                className="absolute inset-0 rounded-sm pointer-events-none"
                style={{
                  transformOrigin: "left center",
                  scale: 0,
                  opacity: 0,
                  background:
                    "linear-gradient(90deg, rgba(201,169,110,0.09), rgba(201,169,110,0.02))",
                  willChange: "transform, opacity",
                }}
              />
              <span
                ref={arrowRef}
                className="text-ink text-xl inline-block"
                style={{ willChange: "transform" }}
                aria-hidden="true"
              >
                ↗
              </span>
              <div
                ref={lineRef}
                className="h-px bg-accent origin-left pointer-events-none absolute left-0 right-0 -bottom-3"
                style={{
                  transform: "scaleX(0)",
                  transformOrigin: "left center",
                  willChange: "transform",
                }}
              />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
