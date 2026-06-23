"use client";
import React, { useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ProjectMedia } from "./ProjectMedia";
import type { Project } from "../../app/utils/data/project";

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

type QuickTo = ReturnType<typeof gsap.quickTo>;

/**
 * The featured project hero. Treats the screenshot as a live app on a dark
 * "stage": an aurora glow bleeds behind a browser-framed panel with terminal
 * corner brackets and a live badge. Scroll parallax (panel / glow / numeral
 * drift at different rates) plus a subtle cursor tilt give it depth. All motion
 * honors prefers-reduced-motion.
 */
export function FeaturedProject({ project }: { project: Project }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);
  const tiltRef = useRef<HTMLAnchorElement | null>(null);
  const mediaInnerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const qRotX = useRef<QuickTo | null>(null);
  const qRotY = useRef<QuickTo | null>(null);
  const qGlowX = useRef<QuickTo | null>(null);
  const qGlowY = useRef<QuickTo | null>(null);
  const stageRect = useRef<DOMRect | null>(null);

  const host = project.link.replace(/^https?:\/\//, "").replace(/\/$/, "");

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ── Entrance ─────────────────────────────────────────────
        gsap.fromTo(
          numRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: root, start: "top 80%", once: true },
          },
        );

        const titleEl = root.querySelector(".feat-title");
        if (titleEl) {
          const split = new SplitText(titleEl, { type: "chars" });
          gsap.fromTo(
            split.chars,
            { y: 80, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.04,
              ease: "expo.out",
              scrollTrigger: { trigger: root, start: "top 78%", once: true },
              onComplete: () => split.revert(),
            },
          );
        }

        gsap.fromTo(
          ".feat-fade",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: { trigger: root, start: "top 72%", once: true },
          },
        );

        gsap.fromTo(
          stageRef.current,
          { opacity: 0, y: 60, scale: 0.94, clipPath: "inset(0 0 100% 0)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            clipPath: "inset(0 0 0% 0)",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: root, start: "top 76%", once: true },
          },
        );
        gsap.fromTo(
          glowRef.current,
          { opacity: 0, scale: 0.7 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.6,
            ease: "power2.out",
            delay: 0.2,
            scrollTrigger: { trigger: root, start: "top 76%", once: true },
          },
        );

        // ── Scroll parallax (different rates → depth) ─────────────
        const scrub = {
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6 as const,
        };
        gsap.to(parallaxRef.current, { yPercent: -6, ease: "none", scrollTrigger: scrub });
        gsap.to(glowRef.current, { yPercent: 14, ease: "none", scrollTrigger: scrub });
        gsap.to(numRef.current, { yPercent: -28, ease: "none", scrollTrigger: scrub });

        // ── Cursor tilt setup ────────────────────────────────────
        qRotX.current = gsap.quickTo(tiltRef.current, "rotationX", {
          duration: 0.6,
          ease: "power2.out",
        });
        qRotY.current = gsap.quickTo(tiltRef.current, "rotationY", {
          duration: 0.6,
          ease: "power2.out",
        });
        qGlowX.current = gsap.quickTo(glowRef.current, "xPercent", {
          duration: 0.9,
          ease: "power2.out",
        });
        qGlowY.current = gsap.quickTo(glowRef.current, "yPercent", {
          duration: 0.9,
          ease: "power2.out",
        });
        if (tiltRef.current) tiltRef.current.style.transformStyle = "preserve-3d";
      });
    },
    { scope: rootRef },
  );

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!qRotX.current) return; // reduced-motion: never set up
    const r = stageRect.current;
    if (!r) return;
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    qRotY.current?.(nx * 5);
    qRotX.current?.(-ny * 5);
    qGlowX.current?.(nx * 4);
    qGlowY.current?.(ny * 4);
  }, []);

  const handleEnter = useCallback(() => {
    if (!qRotX.current) return;
    stageRect.current = stageRef.current?.getBoundingClientRect() ?? null;
    gsap.to(mediaInnerRef.current, { scale: 1.04, duration: 0.7, ease: "power3.out" });
  }, []);

  const handleLeave = useCallback(() => {
    if (!qRotX.current) return;
    qRotX.current(0);
    qRotY.current?.(0);
    qGlowX.current?.(0);
    qGlowY.current?.(0);
    gsap.to(mediaInnerRef.current, { scale: 1, duration: 0.7, ease: "power3.out" });
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative mb-24 lg:mb-36 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
    >
      {/* Oversized ghost index */}
      <span
        ref={numRef}
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 lg:-top-20 left-0 lg:left-[34%] z-0 font-display font-light leading-none text-[8rem] lg:text-[16rem] select-none"
        style={{ color: "transparent", WebkitTextStroke: "1px rgba(201,169,110,0.25)" }}
      >
        {project.number}
      </span>

      {/* Text column */}
      <div className="relative z-10 lg:col-span-5 order-2 lg:order-1">
        <div className="feat-fade flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-accent" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Featured · {project.number} / 05
          </span>
        </div>

        <h3 className="feat-title font-display text-5xl md:text-6xl lg:text-7xl font-light text-ink mb-5">
          {project.title}
        </h3>

        <span className="feat-fade section-label block mb-5 text-stone/70">
          {project.category} · {project.year}
        </span>

        <p className="feat-fade text-stone text-base leading-relaxed font-light max-w-xl mb-7">
          {project.description}
        </p>

        <div className="feat-fade flex flex-wrap gap-2 mb-9">
          {project.tech.map((t) => (
            <span
              key={t}
              className="font-mono text-xs px-2.5 py-1 border border-muted text-stone/70 rounded-sm"
            >
              {t}
            </span>
          ))}
        </div>

        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="feat-fade group inline-flex items-center gap-3 px-6 py-3 rounded-full border border-ink/20 font-mono text-xs uppercase tracking-[0.25em] text-ink transition-colors duration-300 hover:bg-ink hover:text-cream hover:border-ink"
        >
          View project
          <span className="text-base transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </a>
      </div>

      {/* Media stage */}
      <div
        className="relative z-10 lg:col-span-7 order-1 lg:order-2"
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div ref={parallaxRef} className="relative" style={{ perspective: "1200px" }}>
          {/* Aurora glow */}
          <div
            ref={glowRef}
            aria-hidden="true"
            className="pointer-events-none absolute -inset-10 lg:-inset-16 z-0"
          >
            <div
              className="absolute left-[8%] top-[12%] w-2/3 h-2/3 rounded-full blur-3xl opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(46,158,143,0.55), transparent 70%)",
              }}
            />
            <div
              className="absolute right-[4%] bottom-[6%] w-1/2 h-1/2 rounded-full blur-3xl opacity-55"
              style={{
                background:
                  "radial-gradient(circle, rgba(201,169,110,0.6), transparent 70%)",
              }}
            />
          </div>

          {/* Framed panel */}
          <a
            ref={tiltRef}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            className="block relative z-10 will-change-transform"
          >
            <div
              ref={stageRef}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12] shadow-[0_40px_80px_-30px_rgba(15,14,12,0.55)]"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 h-9 px-4 border-b border-white/5 bg-[#15171d]">
                <span className="flex gap-1.5">
                  <i className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/70" />
                  <i className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/70" />
                  <i className="w-2.5 h-2.5 rounded-full bg-[#28c840]/70" />
                </span>
                <span className="mx-auto font-mono text-[0.65rem] text-white/40 tracking-wide">
                  {host}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-emerald-300/90">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>

              {/* Screenshot */}
              <div ref={mediaInnerRef} className="relative aspect-[16/10] will-change-transform">
                <ProjectMedia
                  project={project}
                  eager
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Terminal corner brackets */}
              <span className="pointer-events-none absolute top-12 left-3 w-5 h-5 border-l border-t border-accent/40" />
              <span className="pointer-events-none absolute top-12 right-3 w-5 h-5 border-r border-t border-accent/40" />
              <span className="pointer-events-none absolute bottom-3 left-3 w-5 h-5 border-l border-b border-accent/40" />
              <span className="pointer-events-none absolute bottom-3 right-3 w-5 h-5 border-r border-b border-accent/40" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
