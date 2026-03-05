"use client";
import { useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TerminalCanvas } from "../canvas/TerminalCanvas";
import { SkillGroup } from "../ui/SkillsGroup";

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

interface SkillsProps {
  onSceneReady?: () => void;
}

const ACCENT = "#C9A87C";

const skillGroups = [
  {
    category: "Frontend",
    index: "01",
    skills: [
      { name: "React / Next.js" },
      { name: "TypeScript" },
      { name: "CSS / Tailwind" },
      { name: "GSAP / Motion" },
      { name: "Three.js / R3F" },
    ],
  },
  {
    category: "Tools & More",
    index: "02",
    skills: [
      { name: "Git & CI/CD" },
      { name: "Docker" },
      { name: "Figma" },
      { name: "Vercel / AWS" },
      { name: "Testing (Vitest)" },
    ],
  },
] as const;

export default function Skills({ onSceneReady }: SkillsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const [activeTerminal, setActiveTerminal] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGroupHover = useCallback((idx: number | null) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (idx !== null) {
      setActiveTerminal(idx);
    } else {
      hoverTimer.current = setTimeout(() => setActiveTerminal(0), 800);
    }
  }, []);

  useGSAP(
    () => {
      // ── Entrance animations ─────────────────────────────────────────────
      gsap.fromTo(
        ".skills-header-label",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
        },
      );

      if (headingRef.current) {
        const split = new SplitText(headingRef.current, { type: "words" });
        gsap.fromTo(
          split.words,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.08,
            ease: "expo.out",
            delay: 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              once: true,
            },
            onComplete: () => split.revert(),
          },
        );
      }

      gsap.fromTo(
        ".skills-sub",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          delay: 0.25,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        canvasWrapRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            once: true,
          },
        },
      );
      if (leftColRef.current && rightColRef.current) {
        ScrollTrigger.create({
          trigger: leftColRef.current,
          pin: rightColRef.current,
          start: "top top+=32", // left-col top hits 32px from viewport top
          end: "bottom bottom", // left-col bottom hits viewport bottom
          pinSpacing: false, // no spacer — left col height is the spacer
        });
      }
      const groupEls =
        leftColRef.current?.querySelectorAll<HTMLElement>("[data-skill-group]");
      groupEls?.forEach((el) => {
        const idx = Number(el.dataset.skillGroup);
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveTerminal(idx),
          onEnterBack: () => setActiveTerminal(idx),
        });
      });
    },
    { scope: sectionRef },
  );

  const displayIndex = activeTerminal >= 0 ? activeTerminal : 0;

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-32 px-8 md:px-16 bg-ink text-cream"
      // NO overflow-hidden on section — that would clip the pinned element
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Label row ── */}
        <div className="flex items-center gap-6 mb-20">
          <span className="skills-header-label section-label text-stone">
            03 — Skills
          </span>
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(90deg,${ACCENT}40,transparent)`,
            }}
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-8 justify-between mb-24">
          <h2
            ref={headingRef}
            className="font-display text-5xl md:text-6xl font-light text-cream leading-tight"
          >
            Tools &amp;
            <br />
            <em className="text-stone/60">expertise</em>
          </h2>
          <p className="skills-sub text-stone font-light text-sm leading-relaxed max-w-xs opacity-0">
            Technologies I&apos;ve worked with in depth — used in production
            across diverse projects and teams.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 items-start">
          <div ref={leftColRef} className="w-full lg:w-[46%] flex flex-col">
            {skillGroups.map((group, gi) => (
              <div
                key={group.category}
                data-skill-group={gi}
                className="min-h-[40vh] flex flex-col justify-center py-8"
              >
                <SkillGroup
                  group={group}
                  groupIndex={gi}
                  activeTerminal={activeTerminal}
                  onGroupHover={handleGroupHover}
                />
              </div>
            ))}
          </div>
          <div ref={rightColRef} className="hidden lg:block w-[54%]">
            <div
              ref={canvasWrapRef}
              className="rounded-2xl overflow-hidden relative"
              style={{
                height: "calc(100vh - 64px)",
                maxHeight: 700,
                opacity: 0,
                boxShadow: `0 0 90px ${ACCENT}14, 0 0 0 1px rgba(255,255,255,0.05)`,
              }}
              aria-label="Interactive 3D terminal displaying live code for the active skill category"
              onWheel={(e) => e.stopPropagation()}
            >
              <TerminalCanvas
                activeTerminal={displayIndex}
                onCreated={() => onSceneReady?.()}
              />

              {/* Terminal label */}
              <div className="absolute bottom-4 left-5 pointer-events-none">
                <span
                  className="font-mono text-[0.52rem] tracking-[0.22em] uppercase"
                  style={{ color: `${ACCENT}80` }}
                >
                  Terminal {displayIndex + 1} ·{" "}
                  {skillGroups[displayIndex].category}
                </span>
              </div>

              {/* Corner brackets */}
              {(
                [
                  "top-3 left-3 border-t-[1.5px] border-l-[1.5px]",
                  "top-3 right-3 border-t-[1.5px] border-r-[1.5px]",
                  "bottom-3 left-3 border-b-[1.5px] border-l-[1.5px]",
                  "bottom-3 right-3 border-b-[1.5px] border-r-[1.5px]",
                ] as const
              ).map((cls) => (
                <div
                  key={cls}
                  className={`absolute w-5 h-5 pointer-events-none ${cls}`}
                  style={{ borderColor: `${ACCENT}45` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom rule ── */}
        <div
          className="mt-16 h-px w-full"
          style={{
            background: `linear-gradient(90deg,transparent,${ACCENT}30,transparent)`,
          }}
        />
      </div>
    </section>
  );
}
