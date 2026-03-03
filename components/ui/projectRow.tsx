"use client";
import React, { useRef, useEffect, useCallback, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../utils/data/project";
gsap.registerPlugin(ScrollTrigger, SplitText);

type Project = (typeof projects)[number];

const DESCRIPTION_CHAR_THRESHOLD = 120;

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
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const extraRef = useRef<HTMLSpanElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const qArrX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qArrY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qTiltX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qTiltY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const [expanded, setExpanded] = useState(false);

  const needsTruncation =
    project.description.length > DESCRIPTION_CHAR_THRESHOLD;
  const shortText = needsTruncation
    ? project.description.slice(0, DESCRIPTION_CHAR_THRESHOLD).trimEnd()
    : project.description;
  const restText = needsTruncation
    ? project.description.slice(DESCRIPTION_CHAR_THRESHOLD)
    : "";

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const extra = extraRef.current;
      const btn = toggleRef.current;
      if (!extra || !btn) return;

      if (!expanded) {
        gsap.set(extra, { display: "inline" });
        gsap.fromTo(
          extra,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.38, ease: "expo.out" },
        );
        gsap.fromTo(
          btn,
          { opacity: 1 },
          { opacity: 0.7, duration: 0.15, yoyo: true, repeat: 1 },
        );
      } else {
        gsap.to(extra, {
          opacity: 0,
          y: 6,
          duration: 0.22,
          ease: "power2.in",
          //@ts-expect-error Typescript Error
          onComplete: () => gsap.set(extra, { display: "none" }),
        });
        gsap.fromTo(
          btn,
          { opacity: 1 },
          { opacity: 0.7, duration: 0.15, yoyo: true, repeat: 1 },
        );
      }

      setExpanded((v) => !v);
    },
    [expanded],
  );

  // ── Scroll-in entrance ────────────────────────────────────────────────────
  useGSAP(
    () => {
      const row = rowRef.current;
      if (!row) return;
      gsap.fromTo(
        numRef.current,
        { x: -16, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 88%", once: true },
          delay: index * 0.06,
        },
      );
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
            scrollTrigger: { trigger: row, start: "top 88%", once: true },
            delay: index * 0.06 + 0.06,
            onComplete: () => split.revert(),
          },
        );
      }
      gsap.fromTo(
        row.querySelector(".proj-desc"),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 86%", once: true },
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
          scrollTrigger: { trigger: row, start: "top 86%", once: true },
          delay: index * 0.06 + 0.22,
        },
      );
    },
    { scope: rowRef },
  );

  // ── Magnetic arrow + tilt setup ───────────────────────────────────────────
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
    qTiltX.current = gsap.quickTo(rowRef.current, "rotationX", {
      duration: 0.45,
      ease: "power2.out",
    });
    qTiltY.current = gsap.quickTo(rowRef.current, "rotationY", {
      duration: 0.45,
      ease: "power2.out",
    });
    if (rowRef.current) {
      rowRef.current.style.transformStyle = "preserve-3d";
      rowRef.current.style.willChange = "transform";
    }
    return () => {
      qArrX.current = null;
      qArrY.current = null;
      qTiltX.current = null;
      qTiltY.current = null;
    };
  }, []);

  const handleEnter = useCallback(() => {
    onEnter(project.number, project.image);
    if (prefersReducedMotion) {
      if (numRef.current) numRef.current.style.transform = "translateX(4px)";
      if (glowRef.current) glowRef.current.style.opacity = "1";
      if (lineRef.current) lineRef.current.style.transform = "scaleX(1)";
      return;
    }
    gsap.to(numRef.current, {
      x: 6,
      color: "var(--accent)",
      duration: 0.28,
      ease: "power2.out",
    });
    gsap.fromTo(
      glowRef.current,
      { scaleX: 0, opacity: 1, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.46, ease: "expo.out" },
    );
    gsap.to(lineRef.current, { scaleX: 1, duration: 0.42, ease: "expo.out" });
    gsap.to(titleRef.current, {
      y: -4,
      duration: 0.4,
      ease: "power2.out",
      overwrite: true,
    });
    gsap.fromTo(
      arrowRef.current,
      { scale: 0.9, opacity: 0.75 },
      { scale: 1, opacity: 1, duration: 0.28, ease: "back.out(2)" },
    );
  }, [onEnter, project.number, project.image, prefersReducedMotion]);

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
    qArrX.current?.(0);
    qArrY.current?.(0);
    qTiltX.current?.(0);
    qTiltY.current?.(0);
  }, [onLeave, prefersReducedMotion]);

  const handleMouseMoveLocal = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion) return;
      const row = rowRef.current;
      const arrow = arrowRef.current;
      if (!row) return;
      const rect = row.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      qTiltX.current?.(-ny * 4);
      qTiltY.current?.(nx * 6);
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
          onFocus={handleEnter}
          onBlur={handleLeave}
        >
          {/* Number */}
          <div className="col-span-1 pt-1">
            <span
              ref={numRef}
              className="font-mono text-xs text-stone/40 inline-block"
              style={{ willChange: "transform, color" }}
            >
              {project.number}
            </span>
          </div>

          {/* Title + description */}
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

            <p
              ref={descRef}
              className="proj-desc text-stone text-sm leading-relaxed font-light max-w-md"
            >
              {needsTruncation ? (
                <>
                  {/* Short portion — always visible */}
                  <span>{shortText}</span>

                  {/* Rest — always in DOM, GSAP shows/hides it */}
                  <span ref={extraRef} style={{ display: "none" }}>
                    {restText}
                  </span>

                  {/* Ellipsis — visible only when collapsed */}
                  {!expanded && <span className="text-stone/50">…</span>}

                  {/* Toggle */}
                  <button
                    ref={toggleRef}
                    onClick={handleToggle}
                    className="ml-1.5 inline-flex items-center gap-1 font-mono text-[0.65rem] tracking-widest uppercase"
                    style={{
                      color: "var(--accent, #C9A87C)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0 2px",
                      verticalAlign: "middle",
                    }}
                    aria-expanded={expanded}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        transition:
                          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      ↓
                    </span>
                    {expanded ? "less" : "more"}
                  </button>
                </>
              ) : (
                project.description
              )}
            </p>
          </div>

          {/* Category + tech */}
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

          {/* Year + arrow */}
          <div className="col-span-12 md:col-span-2 flex md:flex-col md:items-end gap-4 md:gap-2 justify-between items-center">
            <span className="proj-meta-item font-mono text-xs text-stone/40">
              {project.year}
            </span>
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
