"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type Project } from "../../app/utils/data/project";
import { ProjectMedia } from "../ui/ProjectMedia";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ACCENT = "#c9a96e";

function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const host = project.link.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="project-card group block"
    >
      <div
        className={`relative overflow-hidden bg-muted shadow-[0_24px_50px_-24px_rgba(15,14,12,0.28)] transition-shadow duration-500 group-hover:shadow-[0_40px_70px_-26px_rgba(15,14,12,0.4)] ${
          featured
            ? "aspect-video rounded-tl-[2.75rem] rounded-br-[2.75rem]"
            : "aspect-16/10 rounded-tl-4xl rounded-br-4xl"
        }`}
      >
        <ProjectMedia
          project={project}
          eager={featured}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />

        {/* View chip — surfaces the link affordance on hover */}
        <span className="absolute right-4 top-4 flex -translate-y-1 items-center gap-1.5 rounded-full border border-white/20 bg-ink/40 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-cream/90 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View ↗
        </span>
      </div>

      {/* Caption — title + the actual project link. Stacks on small screens
          so the (sometimes long) host URL never collides or overflows. */}
      <div className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3
            className={`font-display font-light text-ink ${
              featured ? "text-2xl md:text-3xl" : "text-xl"
            }`}
          >
            {project.title}
          </h3>
          <span className="section-label mt-1 block text-stone/70">
            {project.category} · {project.year}
          </span>
        </div>
        <span className="flex min-w-0 max-w-full items-center gap-1.5 font-mono text-[0.7rem] text-stone transition-colors duration-300 group-hover:text-ink sm:mt-1">
          <span className="truncate">{host}</span>
          <span className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            ↗
          </span>
        </span>
      </div>
    </a>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".projects-head",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 80%", once: true },
          },
        );
        gsap.fromTo(
          ".project-card",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".projects-grid",
              start: "top 85%",
              once: true,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  const [featured, ...rest] = projects;

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative bg-cream px-8 pb-24 pt-32 md:px-16 lg:pb-32 lg:pt-44"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="projects-head mb-6 flex items-center gap-6">
          <span className="section-label">02 — Projects</span>
          <div className="rule-accent flex-1" />
        </div>
        <div className="mb-16 flex items-end justify-between gap-6 lg:mb-20">
          <h2 className="projects-head font-display text-5xl font-light leading-tight text-ink md:text-6xl">
            Selected Projects<span style={{ color: ACCENT }}>.</span>
          </h2>
          <a
            href="https://github.com/0xdegend"
            target="_blank"
            rel="noreferrer"
            className="projects-head section-label hidden items-center gap-2 text-stone transition-colors duration-300 hover:text-ink md:inline-flex"
          >
            GitHub <span className="text-base">↗</span>
          </a>
        </div>

        {/* Featured (01) + 2×2 grid of the rest */}
        <div className="projects-grid flex flex-col gap-10 lg:gap-14">
          <ProjectCard project={featured} featured />
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:gap-14">
            {rest.map((p) => (
              <ProjectCard key={p.number} project={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
