"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { projects } from "../../app/utils/data/project";
import { ProjectMedia } from "../ui/ProjectMedia";
import { BentoCard } from "../ui/BentoCard";

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

        // ── Featured hero ───────────────────────────────────────
        const feat = root.querySelector(".proj-featured");
        if (feat) {
          gsap.fromTo(
            ".proj-featured-media",
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 1.1,
              ease: "expo.out",
              scrollTrigger: { trigger: feat, start: "top 78%", once: true },
            },
          );
          gsap.fromTo(
            ".proj-featured-index",
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "expo.out",
              scrollTrigger: { trigger: feat, start: "top 80%", once: true },
            },
          );
          const titleEl = feat.querySelector(".proj-featured-title");
          if (titleEl) {
            const split = new SplitText(titleEl, { type: "chars" });
            gsap.fromTo(
              split.chars,
              { y: 70, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.03,
                ease: "expo.out",
                scrollTrigger: { trigger: feat, start: "top 78%", once: true },
                onComplete: () => split.revert(),
              },
            );
          }
          gsap.fromTo(
            ".proj-featured-fade",
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: "power2.out",
              delay: 0.2,
              scrollTrigger: { trigger: feat, start: "top 72%", once: true },
            },
          );
        }

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
      <div className="proj-featured grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-24 lg:mb-36">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <span
            className="proj-featured-index block font-display font-light leading-none text-7xl md:text-8xl lg:text-[9rem]"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px var(--accent)",
            }}
          >
            {featured.number}
          </span>

          <h3 className="proj-featured-title font-display text-5xl md:text-6xl lg:text-7xl font-light text-ink mt-4 mb-5">
            {featured.title}
          </h3>

          <span className="proj-featured-fade section-label block mb-5 text-accent">
            {featured.category} · {featured.year}
          </span>

          <p className="proj-featured-fade text-stone text-base leading-relaxed font-light max-w-xl mb-7">
            {featured.description}
          </p>

          <div className="proj-featured-fade flex flex-wrap gap-2 mb-9">
            {featured.tech.map((t) => (
              <span
                key={t}
                className="font-mono text-xs px-2.5 py-1 border border-muted text-stone/70 rounded-sm"
              >
                {t}
              </span>
            ))}
          </div>

          <a
            href={featured.link}
            target="_blank"
            rel="noopener noreferrer"
            className="proj-featured-fade group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-ink"
          >
            <span className="relative">
              View project
              <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
            </span>
            <span className="text-base transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
              ↗
            </span>
          </a>
        </div>

        <div className="lg:col-span-6 order-1 lg:order-2">
          <a
            href={featured.link}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            className="proj-featured-media group block relative aspect-[16/11] overflow-hidden rounded-2xl border border-muted bg-muted"
          >
            <ProjectMedia
              project={featured}
              eager
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
            <span className="absolute bottom-4 right-4 font-mono text-xs text-cream/90 tracking-widest">
              {featured.year}
            </span>
          </a>
        </div>
      </div>

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
