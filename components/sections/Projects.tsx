"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { projects } from "../../app/utils/data/project";
import { BentoCard } from "../ui/BentoCard";
import { FeaturedProject } from "../ui/FeaturedProject";

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

const featured = projects[0];
const rest = projects.slice(1);
const [big, sideTop, sideBottom, banner] = rest;

// Subtle film grain — inline SVG noise, no asset required.
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ── Header ──────────────────────────────────────────────
        gsap.fromTo(
          ".projects-header-label",
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 82%", once: true },
          },
        );
        gsap.fromTo(
          ".projects-heading-word",
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "expo.out",
            delay: 0.1,
            scrollTrigger: { trigger: root, start: "top 80%", once: true },
          },
        );

        // ── Bento grid entrance (staggered rise + settle) ───────
        gsap.fromTo(
          ".bento-card",
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.09,
            ease: "expo.out",
            scrollTrigger: {
              trigger: ".bento-grid",
              start: "top 85%",
              once: true,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative px-8 md:px-16 lg:py-32 py-16 max-w-7xl mx-auto"
    >
      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 mix-blend-multiply opacity-[0.05]"
        style={{ backgroundImage: GRAIN_URI, backgroundSize: "160px 160px" }}
      />

      {/* Header */}
      <div className="flex items-center gap-6 mb-16">
        <span className="projects-header-label section-label">02 — Projects</span>
        <div className="flex-1 rule-accent" />
      </div>

      <div className="flex items-end justify-between mb-16 lg:mb-24">
        <h2 className="font-display text-5xl md:text-6xl font-light text-ink leading-tight">
          <span className="projects-heading-word inline-block">Selected</span>
          <br />
          <em className="projects-heading-word inline-block text-stone">
            projects
          </em>
        </h2>
        <a
          href="https://github.com/0xdegend"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-2 section-label text-stone hover:text-ink transition-colors duration-300"
        >
          GitHub <span className="text-base">↗</span>
        </a>
      </div>

      {/* ── Featured hero (project 01) ───────────────────────────── */}
      <FeaturedProject project={featured} />

      {/* ── Bento grid (projects 02→) ────────────────────────────── */}
      <div className="bento-grid flex flex-col gap-4 lg:gap-5">
        {/* Row 1: big feature + stacked pair */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          <div className="lg:col-span-8">
            <BentoCard project={big} large className="h-full" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-5">
            <BentoCard project={sideTop} />
            <BentoCard project={sideBottom} />
          </div>
        </div>

        {/* Row 2: full-width banner */}
        <BentoCard project={banner} wide />
      </div>
    </section>
  );
}
