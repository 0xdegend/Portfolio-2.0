"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

const ACCENT = "#000000";
const ROW_CLOSED = 56;
const ROW_OPEN = 110;

const SKILL_PREVIEWS: Record<string, string> = {
  "React / Next.js": "const Page = () => <Layout><Hero /></Layout>",
  TypeScript: "type Props = { name: string; active: boolean }",
  "CSS / Tailwind": 'className="flex gap-4 items-center rounded-xl"',
  "GSAP / Motion": "gsap.fromTo(el, {y:40}, {y:0, ease:'expo.out'})",
  "Three.js / R3F": "<mesh position={[0,0,0]}><boxGeometry /></mesh>",
  Git: "git push origin main  →  deploy triggered ✓",
  Figma: "// component → inspect → export → ship",
  Jira: "PROJ-142  In Review  →  merged  →  Done ✓",
  Vercel: "▲ deployed to production  ✓  23s  cdn edge ready",
};

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

function useScramble(target: string, running: boolean) {
  const [display, setDisplay] = useState(target);
  const frame = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }

    if (!running) {
      const id = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(id);
    }

    frame.current = 0;
    const totalFrames = 18;

    const step = () => {
      frame.current++;
      const progress = frame.current / totalFrames;
      const resolved = Math.floor(progress * target.length);

      setDisplay(
        target
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < resolved) return ch;
            return SCRAMBLE_CHARS[
              Math.floor(Math.random() * SCRAMBLE_CHARS.length)
            ];
          })
          .join(""),
      );

      if (frame.current < totalFrames) {
        raf.current = requestAnimationFrame(step);
      } else {
        setDisplay(target);
        raf.current = null;
      }
    };

    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
    };
  }, [running, target]);

  return display;
}

export function SkillRow({
  skill,
  rowIndex,
  activeSkill,
  onHoverChange,
}: {
  skill: { name: string };
  rowIndex: number;
  activeSkill: string | null;
  onHoverChange: (n: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const bdrRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [hovered, setHovered] = useState(false);

  const scrambled = useScramble(skill.name, hovered);
  const preview = SKILL_PREVIEWS[skill.name] ?? `// ${skill.name}`;
  useGSAP(
    () => {
      gsap.fromTo(
        wrapRef.current,
        { y: 20, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.6,
          ease: "expo.out",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top 90%",
            once: true,
          },
          delay: rowIndex * 0.07,
        },
      );
    },
    { scope: wrapRef },
  );

  const handleEnter = useCallback(() => {
    onHoverChange(skill.name);
    setHovered(true);

    tlRef.current?.kill();
    const tl = gsap.timeline();
    tl.to(
      rowRef.current,
      { height: ROW_OPEN, duration: 0.4, ease: "expo.out" },
      0,
    );
    tl.fromTo(
      bdrRef.current,
      { scaleY: 0, opacity: 1 },
      { scaleY: 1, duration: 0.35, ease: "expo.out", transformOrigin: "top" },
      0,
    );
    tl.to(
      glowRef.current,
      { opacity: 1, duration: 0.3, ease: "power2.out" },
      0,
    );
    tl.fromTo(
      progressRef.current,
      { scaleX: 0, opacity: 1 },
      {
        scaleX: 1,
        duration: 1.1,
        ease: "power3.inOut",
        transformOrigin: "left",
      },
      0.05,
    );
    tl.fromTo(
      codeRef.current,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: "expo.out" },
      0.15,
    );

    tlRef.current = tl;
  }, [skill.name, onHoverChange]);

  const handleLeave = useCallback(() => {
    onHoverChange(null);
    setHovered(false);

    tlRef.current?.kill();
    const tl = gsap.timeline();

    tl.to(
      rowRef.current,
      { height: ROW_CLOSED, duration: 0.38, ease: "power3.inOut" },
      0,
    );
    tl.to(
      bdrRef.current,
      { opacity: 0, scaleY: 0, duration: 0.25, transformOrigin: "bottom" },
      0,
    );
    tl.to(glowRef.current, { opacity: 0, duration: 0.22 }, 0);
    tl.to(progressRef.current, { opacity: 0, duration: 0.2 }, 0);
    tl.to(codeRef.current, { y: 6, opacity: 0, duration: 0.2 }, 0);

    tlRef.current = tl;
  }, [onHoverChange]);

  const dimmed = activeSkill !== null && activeSkill !== skill.name;
  const isActive = activeSkill === skill.name;

  return (
    <div
      ref={wrapRef}
      style={{
        clipPath: "inset(0 0 100% 0)",
        opacity: dimmed ? 0.45 : 1,
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        ref={rowRef}
        className="relative overflow-hidden border-t border-white/[0.07] cursor-pointer"
        style={{ height: ROW_CLOSED }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div
          ref={bdrRef}
          className="absolute left-0 top-0 w-0.5 h-full opacity-0"
          style={{
            background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT}30)`,
          }}
        />
        <div
          ref={progressRef}
          className="absolute bottom-0 left-0 h-px w-full opacity-0"
          style={{
            background: `linear-gradient(90deg, ${ACCENT}90, ${ACCENT}20, transparent)`,
            transformOrigin: "left",
          }}
        />
        <div
          ref={glowRef}
          className="absolute inset-0 opacity-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 65% 100% at 0% 50%, ${ACCENT}22, transparent 70%)`,
          }}
        />
        {(
          [
            "top-1.5 left-1.5 border-t border-l",
            "top-1.5 right-1.5 border-t border-r",
            "bottom-1.5 left-1.5 border-b border-l",
            "bottom-1.5 right-1.5 border-b border-r",
          ] as const
        ).map((cls, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 pointer-events-none transition-opacity duration-300 ${cls}`}
            style={{ borderColor: `${ACCENT}70`, opacity: isActive ? 1 : 0 }}
          />
        ))}
        <div className="relative z-10 flex items-center gap-5 w-full pt-3.5 pb-2 pl-5 pr-4">
          <span
            className="font-mono text-[0.58rem] tracking-[0.22em] shrink-0 tabular-nums"
            style={{
              color: isActive ? ACCENT : `${ACCENT}`,
              transition: "color 0.25s",
              minWidth: 22,
            }}
          >
            {String(rowIndex + 1).padStart(2, "0")}
          </span>
          <span
            className=" font-display text-base md:text-lg font-light flex-1 tracking-wide"
            style={{
              color: isActive ? "#1c1b1b" : "#000000",
              letterSpacing: isActive ? "0.06em" : "0.02em",
              transition: "color 0.25s, letter-spacing 0.4s",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {scrambled}
          </span>
          <div
            className="shrink-0 w-1 h-1 rounded-full transition-all duration-300"
            style={{
              background: ACCENT,
              opacity: isActive ? 1 : 0,
              boxShadow: isActive ? `0 0 6px ${ACCENT}` : "none",
            }}
          />
        </div>
        <div
          ref={codeRef}
          className="absolute bottom-0 left-0 right-0 opacity-0 px-5 pb-2.5 flex items-center gap-3"
          style={{ y: 8 } as React.CSSProperties}
        >
          <span
            className="font-mono text-[0.6rem] shrink-0"
            style={{ color: ACCENT }}
          >
            ›
          </span>
          <span
            className="font-mono text-[0.62rem] truncate"
            style={{ color: `${ACCENT}CC`, letterSpacing: "0.04em" }}
          >
            {preview}
          </span>
        </div>
      </div>
    </div>
  );
}
