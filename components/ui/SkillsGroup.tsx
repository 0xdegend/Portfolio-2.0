import { useRef, useState, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { gsap } from "gsap";
import { SkillRow } from "./SkillsRow";

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

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

export function SkillGroup({
  group,
  groupIndex,
  activeTerminal,
  onGroupHover,
}: {
  group: (typeof skillGroups)[number];
  groupIndex: number;
  activeTerminal: number;
  onGroupHover: (i: number | null) => void;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const catNumRef = useRef<HTMLSpanElement>(null);
  const catLabelRef = useRef<HTMLDivElement>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const isThisActive = activeTerminal === groupIndex;

  useGSAP(
    () => {
      gsap.fromTo(
        catLabelRef.current,
        { x: -28, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "expo.out",
          scrollTrigger: {
            trigger: groupRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );
      const obj = { val: 0 };
      const target = parseInt(group.index, 10);
      gsap.to(obj, {
        val: target,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: groupRef.current,
          start: "top 82%",
          once: true,
        },
        onUpdate: () => {
          if (catNumRef.current)
            catNumRef.current.textContent = String(
              Math.round(obj.val),
            ).padStart(2, "0");
        },
      });
    },
    { scope: groupRef },
  );

  const handleHover = useCallback(
    (name: string | null) => {
      setActiveSkill(name);
      onGroupHover(name !== null ? groupIndex : null);
    },
    [groupIndex, onGroupHover],
  );

  return (
    <div ref={groupRef} className="mb-20 last:mb-0">
      <div ref={catLabelRef} className="flex items-baseline gap-4 mb-6 pl-4">
        <span
          ref={catNumRef}
          className="font-mono text-xs tracking-[0.3em]"
          style={{
            color: isThisActive ? ACCENT : `${ACCENT}80`,
            transition: "color 0.4s",
          }}
        >
          00
        </span>
        <span
          className="font-display text-2xl md:text-3xl font-light tracking-tight"
          style={{
            color: isThisActive ? "#EDE0CC" : "rgba(210,200,185,0.45)",
            transition: "color 0.4s",
          }}
        >
          {group.category}
        </span>
        <div
          className="flex-1 h-px ml-4"
          style={{
            background: isThisActive
              ? `linear-gradient(90deg,${ACCENT}60,transparent)`
              : `linear-gradient(90deg,${ACCENT}20,transparent)`,
            transition: "background 0.4s",
          }}
        />
        {isThisActive && (
          <span
            className="font-mono text-[0.52rem] tracking-[0.22em] uppercase"
            style={{ color: ACCENT }}
          >
            ◉ active
          </span>
        )}
      </div>

      <div className="relative">
        {group.skills.map((skill, si) => (
          <SkillRow
            key={skill.name}
            skill={skill}
            rowIndex={si}
            activeSkill={activeSkill}
            onHoverChange={handleHover}
          />
        ))}
        <div className="border-t border-white/6" />
      </div>
    </div>
  );
}
