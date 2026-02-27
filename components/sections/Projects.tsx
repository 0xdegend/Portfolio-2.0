"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { projects } from "../utils/data/project";
import { CursorBoxTailwind } from "../ui/boxCursor";
import { ProjectRow } from "../ui/projectRow";
import { useCursorFollower_rAF } from "../utils/hooks/useCursorFollower";

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

export default function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { initFollower, initNumLabel, initArrow, initImageRef, show, hide } =
    useCursorFollower_rAF(sectionRef);

  // scroll entrance for the header — keep exactly as you had
  useGSAP(
    () => {
      gsap.fromTo(
        ".projects-header-label",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
            once: true,
          },
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
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
          delay: 0.1,
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative overflow-visible py-32 px-8 md:px-16 max-w-7xl mx-auto"
    >
      <CursorBoxTailwind
        initRef={initFollower}
        initNumLabel={initNumLabel}
        initArrow={initArrow}
        initImageRef={initImageRef}
      />
      <div className="flex items-center gap-6 mb-20">
        <span className="projects-header-label section-label">02 — Work</span>
        <div className="flex-1 rule-accent" />
      </div>

      <div className="flex items-end justify-between mb-12">
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

      <div>
        {projects.map((p, i) => (
          <ProjectRow
            key={p.number}
            project={p}
            index={i}
            onEnter={show}
            onLeave={hide}
          />
        ))}
        <div className="border-t border-muted" />
      </div>
    </section>
  );
}
