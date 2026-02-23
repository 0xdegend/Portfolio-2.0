"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const skillGroups = [
  {
    category: "Frontend",
    skills: [
      { name: "React / Next.js", level: 96 },
      { name: "TypeScript", level: 92 },
      { name: "CSS / Tailwind", level: 95 },
      { name: "GSAP / Motion", level: 85 },
      { name: "Three.js / R3F", level: 75 },
    ],
  },
  {
    category: "Backend",
    skills: [
      { name: "Node.js / Bun", level: 88 },
      { name: "PostgreSQL", level: 82 },
      { name: "Prisma / Drizzle", level: 85 },
      { name: "REST & tRPC APIs", level: 90 },
      { name: "Redis", level: 72 },
    ],
  },
  {
    category: "Tools & More",
    skills: [
      { name: "Git & CI/CD", level: 90 },
      { name: "Docker", level: 75 },
      { name: "Figma", level: 80 },
      { name: "Vercel / AWS", level: 82 },
      { name: "Testing (Vitest)", level: 78 },
    ],
  },
];

function SkillBar({
  name,
  level,
  delay,
}: {
  name: string;
  level: number;
  delay: number;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        barRef.current,
        { width: "0%" },
        {
          width: `${level}%`,
          duration: 1.2,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: barRef.current,
            start: "top 90%",
          },
        },
      );
    },
    { scope: barRef, dependencies: [level, delay] },
  );

  return (
    <div className="skill-item mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-body text-sm text-ink font-light">{name}</span>
        <span className="font-mono text-xs text-stone/60">{level}%</span>
      </div>
      <div className="h-px bg-muted w-full relative">
        <div
          ref={barRef}
          className="absolute top-0 left-0 h-px bg-accent"
          style={{ width: 0 }}
        />
        {/* Dot at end */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent"
          style={{ left: `${level}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".skill-group",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-32 px-8 md:px-16 bg-ink text-cream"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-20">
          <span className="section-label text-stone">03 — Skills</span>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/40 to-transparent" />
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-4 items-start justify-between mb-16">
          <h2 className="font-display text-5xl md:text-6xl font-light text-cream leading-tight">
            Tools &<br />
            <em className="text-stone">expertise</em>
          </h2>
          <p className="text-stone font-light text-sm leading-relaxed max-w-xs">
            Technologies I&apos;ve worked with in depth — used in production
            across diverse projects and teams.
          </p>
        </div>

        {/* Skill groups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {skillGroups.map((group, gi) => (
            <div key={group.category} className="skill-group">
              <div className="flex items-center gap-3 mb-8">
                <span className="font-mono text-xs text-accent">
                  {String(gi + 1).padStart(2, "0")}
                </span>
                <span className="section-label text-stone">
                  {group.category}
                </span>
              </div>
              {group.skills.map((skill, si) => (
                <SkillBar
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  delay={si * 0.08}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
