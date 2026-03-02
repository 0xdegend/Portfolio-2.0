import { useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { gsap } from "gsap";
gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);
const ACCENT = "#C9A87C";
const ROW_CLOSED = 52;
const ROW_OPEN = 130;
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
  const nameRef = useRef<HTMLSpanElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const bdrRef = useRef<HTMLDivElement>(null);
  const scanTl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        wrapRef.current,
        { y: 16, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.55,
          ease: "expo.out",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top 90%",
            once: true,
          },
          delay: rowIndex * 0.06,
        },
      );
    },
    { scope: wrapRef },
  );

  const handleEnter = useCallback(() => {
    onHoverChange(skill.name);
    gsap.to(rowRef.current, {
      height: ROW_OPEN,
      duration: 0.45,
      ease: "expo.out",
    });
    gsap.fromTo(
      bdrRef.current,
      { scaleY: 0, opacity: 1 },
      { scaleY: 1, duration: 0.4, ease: "expo.out", transformOrigin: "top" },
    );
    gsap.to(nameRef.current, {
      letterSpacing: "0.07em",
      duration: 0.3,
      ease: "power2.out",
    });
    scanTl.current?.kill();
    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(
      scanRef.current,
      { left: "-4px", opacity: 0.55 },
      { left: "100%", opacity: 0.12, duration: 2.3, ease: "none" },
    ).set(scanRef.current, { left: "-4px", opacity: 0 });
    scanTl.current = tl;
  }, [skill.name, onHoverChange]);

  const handleLeave = useCallback(() => {
    onHoverChange(null);
    gsap.to(rowRef.current, {
      height: ROW_CLOSED,
      duration: 0.4,
      ease: "power3.inOut",
    });
    gsap.to(bdrRef.current, { opacity: 0, duration: 0.25 });
    gsap.to(nameRef.current, {
      letterSpacing: "0.02em",
      duration: 0.4,
      ease: "elastic.out(1,0.5)",
    });
    scanTl.current?.kill();
    scanTl.current = null;
    if (scanRef.current) gsap.set(scanRef.current, { opacity: 0 });
  }, [onHoverChange]);

  const dimmed = activeSkill !== null && activeSkill !== skill.name;

  return (
    <div
      ref={wrapRef}
      style={{
        clipPath: "inset(0 0 100% 0)",
        opacity: dimmed ? 0.35 : 1,
        transition: "opacity 0.28s ease",
      }}
    >
      <div
        ref={rowRef}
        className="relative overflow-hidden border-t border-white/6 flex items-start cursor-default"
        style={{ height: ROW_CLOSED }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div
          ref={bdrRef}
          className="absolute left-0 top-0 w-0.5 h-full opacity-0"
          style={{
            background: `linear-gradient(180deg,${ACCENT},${ACCENT}40)`,
            transformOrigin: "top",
          }}
        />
        <div
          ref={scanRef}
          className="absolute top-0 bottom-0 w-px opacity-0 pointer-events-none"
          style={{ background: `${ACCENT}45`, left: "-4px" }}
        />

        <div className="relative z-10 flex items-center gap-5 w-full pt-3 pb-3 pl-4">
          <span
            className="font-mono text-[0.6rem] tracking-[0.2em] shrink-0"
            style={{ color: `${ACCENT}60`, minWidth: 24 }}
          >
            {String(rowIndex + 1).padStart(2, "0")}
          </span>
          <span
            ref={nameRef}
            className="font-display text-base md:text-lg font-light text-cream/90 flex-1"
            style={{ letterSpacing: "0.02em", willChange: "letter-spacing" }}
          >
            {skill.name}
          </span>
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg,${ACCENT}08,transparent 60%)`,
            opacity: activeSkill === skill.name ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />
      </div>
    </div>
  );
}
