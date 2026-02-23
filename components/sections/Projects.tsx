"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const projects = [
  {
    number: "01",
    title: "Design System",
    category: "Frontend Engineering",
    year: "2024",
    description:
      "A comprehensive component library and design system built with React, Storybook, and TypeScript — used across 4 products with 200+ components.",
    tech: ["React", "TypeScript", "Storybook", "Radix UI"],
    link: "#",
  },
  {
    number: "02",
    title: "E-Commerce Platform",
    category: "Full-Stack",
    year: "2024",
    description:
      "High-performance storefront with server components, edge caching, and real-time inventory. 98 Lighthouse score across all metrics.",
    tech: ["Next.js", "Prisma", "Stripe", "Vercel"],
    link: "#",
  },
  {
    number: "03",
    title: "Data Dashboard",
    category: "Full-Stack",
    year: "2023",
    description:
      "Real-time analytics dashboard processing 50M+ events per day with sub-second query performance and rich data visualizations.",
    tech: ["Next.js", "Clickhouse", "D3.js", "tRPC"],
    link: "#",
  },
  {
    number: "04",
    title: "AI Writing Tool",
    category: "Product Engineering",
    year: "2023",
    description:
      "AI-assisted long-form writing application with streaming responses, version history, and collaborative editing built on top of Tiptap.",
    tech: ["Next.js", "OpenAI", "Tiptap", "Supabase"],
    link: "#",
  },
];

function ProjectCard({
  project,
}: {
  project: (typeof projects)[0];
  index: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null); // trigger — never animated, always stable
  const cardRef = useRef<HTMLDivElement>(null); // animation target only
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current, // trigger on wrapper, not the animated el
            start: "top 85%",
            toggleActions: "play none none reverse", // clean reverse on scroll back up
          },
        },
      );
    },
    { scope: wrapperRef }, // scope to the stable wrapper
  );

  // Hover handlers — imperative gsap.to, intentionally outside useGSAP
  const onEnter = () => {
    gsap.to(lineRef.current, { scaleX: 1, duration: 0.4, ease: "power3.out" });
  };
  const onLeave = () => {
    gsap.to(lineRef.current, { scaleX: 0, duration: 0.3, ease: "power2.in" });
  };

  return (
    <div ref={wrapperRef}>
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div
          ref={cardRef}
          className="group border-t border-muted py-8 grid grid-cols-12 gap-6 items-start hover:bg-muted/20 transition-colors duration-300 px-2 -mx-2 rounded-sm"
        >
          {/* Number */}
          <div className="col-span-1">
            <span className="font-mono text-xs text-stone/50">
              {project.number}
            </span>
          </div>

          {/* Title & desc */}
          <div className="col-span-12 md:col-span-6">
            <h3 className="font-display text-3xl md:text-4xl font-light text-ink mb-3 group-hover:text-accent transition-colors duration-300">
              {project.title}
            </h3>
            <p className="text-stone text-sm leading-relaxed font-light max-w-md">
              {project.description}
            </p>
          </div>

          {/* Meta */}
          <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
            <span className="section-label text-stone/70">
              {project.category}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="font-mono text-xs px-2 py-0.5 border border-muted text-stone rounded-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Year + arrow */}
          <div className="col-span-12 md:col-span-2 flex md:flex-col md:items-end gap-4 md:gap-2 justify-between items-center">
            <span className="font-mono text-xs text-stone/50">
              {project.year}
            </span>
            <span className="text-ink group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 text-xl">
              ↗
            </span>
          </div>
        </div>

        {/* Accent underline */}
        <div
          ref={lineRef}
          className="h-px bg-accent origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </a>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="py-32 px-8 md:px-16 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex items-center gap-6 mb-20">
        <span className="section-label">02 — Work</span>
        <div className="flex-1 rule-accent" />
      </div>

      <div className="flex items-end justify-between mb-12">
        <h2 className="font-display text-5xl md:text-6xl font-light text-ink leading-tight">
          Selected
          <br />
          <em className="text-stone">projects</em>
        </h2>
        <a
          href="https://github.com/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 section-label text-stone hover:text-ink transition-colors duration-300"
        >
          GitHub <span className="text-base">↗</span>
        </a>
      </div>

      {/* Project list */}
      <div>
        {projects.map((project, i) => (
          <ProjectCard key={project.number} project={project} index={i} />
        ))}
        {/* Final rule */}
        <div className="border-t border-muted" />
      </div>
    </section>
  );
}
