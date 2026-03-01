"use client";
/**
 * Skills.tsx — "Machine Room" Awwwards-level implementation
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * SIGNATURE INTERACTION: Accordion skill rows that expand to reveal an
 * R3F oscilloscope waveform canvas. Skill level = wave amplitude & frequency.
 *
 * LAYOUT: Full-width stacked list (not a 3-column grid). Each category block
 * has a large asymmetric label left + skill rows right — editorial, designed.
 *
 * ANIMATIONS:
 *   • Scroll: SplitText header stagger, category number count-up, rows clip-in
 *   • Row hover expand: height 52px → 130px (expo.out), waveform fades in
 *   • R3F waveform: sine wave, amplitude ∝ skill level, travels left-to-right
 *   • Percentage counter: 0 → level (once), stays on subsequent hovers
 *   • Scanline: 1px horizontal bar sweeps across hovered row (repeating)
 *   • Letter-spacing expansion on skill name
 *   • Neighbour rows dim to 0.45 opacity when a row is hovered
 *   • Left border accent flash on enter
 *
 * R3F CANVAS:
 *   • OrthographicCamera, frameloop="demand", invalidate on hover only
 *   • 300-vertex BufferGeometry line
 *   • Lazy-mounted (Canvas not in DOM until first hover of its row)
 *   • amplitude lerps 0↔target smoothly on enter/leave
 */

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

// ─── Data ─────────────────────────────────────────────────────────────────────
const skillGroups = [
  {
    category: "Frontend",
    index: "01",
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
    index: "02",
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
    index: "03",
    skills: [
      { name: "Git & CI/CD", level: 90 },
      { name: "Docker", level: 75 },
      { name: "Figma", level: 80 },
      { name: "Vercel / AWS", level: 82 },
      { name: "Testing (Vitest)", level: 78 },
    ],
  },
] as const;

type SkillItem = { name: string; level: number };

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = "#C9A87C";
const ROW_CLOSED = 52; // px
const ROW_OPEN = 130; // px
const WAVE_PTS = 300;

// ─── R3F Waveform scene ───────────────────────────────────────────────────────
/**
 * Renders a sine wave whose amplitude and frequency reflect the skill level.
 * `active` ref controls whether time advances (only animate while hovered).
 * `amplitudeTarget` lerps the wave in/out smoothly.
 */
function WaveScene({
  level,
  activeRef,
}: {
  level: number;
  activeRef: React.RefObject<boolean>;
}) {
  /**
   * CANONICAL R3F PATTERN — no manual Three.js object creation during render.
   *
   * Use lowercase JSX intrinsics: <line>, <bufferGeometry>, <lineBasicMaterial>
   * R3F creates and owns the Three.js instances via its reconciler.
   * We get refs to them via the `ref` prop — only read in useFrame (post-render).
   *
   * Previous attempts failed because:
   *   useMemo   → R3F strict-mode proxies the value as read-only
   *   if(!ref.current) during render → "cannot access ref during render"
   *
   * This approach avoids both: R3F owns the objects, refs only touched post-render.
   */
  const { size, invalidate } = useThree();

  // Refs to R3F-managed objects — populated by R3F after first render
  const geoRef = useRef<THREE.BufferGeometry>(null!);
  const matRef = useRef<THREE.LineBasicMaterial>(null!);

  // Animation state — never read during render, only in useFrame / useEffect
  const timeRef = useRef(0);
  const ampRef = useRef(0);
  const ampTarget = useRef(0);

  // Pure computed scalars — not Three.js objects, useMemo is safe here
  const freq = useMemo(() => 1.8 + (level / 100) * 3.5, [level]);
  const ampMax = useMemo(() => 0.1 + (level / 100) * 0.28, [level]);

  // Wire up the position BufferAttribute after R3F mounts the geometry
  useEffect(() => {
    const geo = geoRef.current;
    if (!geo) return;
    const positions = new Float32Array(WAVE_PTS * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return () => geo.dispose();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync amplitude target whenever activeRef or ampMax changes
  useEffect(() => {
    ampTarget.current = activeRef.current ? ampMax : 0;
  }, [activeRef, ampMax]);

  useFrame((_, delta) => {
    const geo = geoRef.current;
    const mat = matRef.current;
    const isActive = activeRef.current;
    if (!geo || !mat || !geo.attributes.position) return;

    // Smooth amplitude lerp toward target
    ampRef.current += (ampTarget.current - ampRef.current) * 0.12;

    // Advance wave phase — faster when row is hovered
    timeRef.current += delta * (isActive ? 0.8 + (level / 100) * 1.2 : 0.2);

    // Write new vertex positions — safe in useFrame (never during render)
    const attr = geo.attributes.position as THREE.BufferAttribute;
    const posArr = attr.array as Float32Array;
    const halfH = size.height / 2;

    for (let i = 0; i < WAVE_PTS; i++) {
      const t = i / (WAVE_PTS - 1);
      const x = (t - 0.5) * size.width;
      const sine = Math.sin(t * Math.PI * 2 * freq + timeRef.current);
      const harm =
        Math.sin(t * Math.PI * 3.3 * freq + timeRef.current * 1.3) * 0.25;
      posArr[i * 3] = x;
      posArr[i * 3 + 1] = (sine + harm) * ampRef.current * halfH;
      posArr[i * 3 + 2] = 0;
    }
    attr.needsUpdate = true;

    // Mutate material opacity — safe in useFrame
    mat.opacity = isActive
      ? 0.85 + ampRef.current * 0.5
      : Math.max(0, ampRef.current / ampMax) * 0.6;

    invalidate();
  });

  // Lowercase intrinsics: R3F reconciler creates Three.Line, BufferGeometry,
  // LineBasicMaterial — no manual instantiation needed at all.
  return (
    <line>
      <bufferGeometry ref={geoRef} />
      <lineBasicMaterial
        ref={matRef}
        color={ACCENT}
        transparent
        opacity={0.9}
      />
    </line>
  );
}

// Wrap with canvas — lazy mounted, demand frameloop
function WaveCanvas({
  level,
  activeRef,
}: {
  level: number;
  activeRef: React.RefObject<boolean>;
}) {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 1, near: 0.1, far: 100, position: [0, 0, 10] }}
      frameloop="always"
      style={{ width: "100%", height: "100%", display: "block" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <WaveScene level={level} activeRef={activeRef} />
      </Suspense>
    </Canvas>
  );
}

// ─── Individual skill row ─────────────────────────────────────────────────────
function SkillRow({
  skill,
  rowIndex,
  totalInGroup,
  groupActiveRef,
  onHoverChange,
}: {
  skill: SkillItem;
  rowIndex: number;
  totalInGroup: number;
  groupActiveRef: React.RefObject<string | null>; // which skill name is hovered in this group
  onHoverChange: (name: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const waveWrapRef = useRef<HTMLDivElement>(null);

  const [canvasMounted, setCanvasMounted] = useState(false);
  const waveActiveRef = useRef(false);
  const countedRef = useRef(false);
  const scanTlRef = useRef<gsap.core.Timeline | null>(null);

  // ── Scroll entrance ────────────────────────────────────────────────────────
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

  // ── Hover enter ───────────────────────────────────────────────────────────
  const handleEnter = useCallback(() => {
    const row = rowRef.current;
    const name = nameRef.current;
    const scan = scanRef.current;
    const wave = waveWrapRef.current;
    const bdr = borderRef.current;
    if (!row) return;

    onHoverChange(skill.name);

    // Mount canvas on first hover
    setCanvasMounted(true);
    waveActiveRef.current = true;

    // Expand row height
    gsap.to(row, { height: ROW_OPEN, duration: 0.5, ease: "expo.out" });

    // Wave wrapper fades in
    if (wave) gsap.to(wave, { opacity: 1, duration: 0.35, delay: 0.1 });

    // Left accent border flash
    if (bdr) {
      gsap.fromTo(
        bdr,
        { scaleY: 0, opacity: 1 },
        { scaleY: 1, duration: 0.4, ease: "expo.out", transformOrigin: "top" },
      );
    }

    // Name: letter-spacing expand
    if (name) {
      gsap.to(name, {
        letterSpacing: "0.06em",
        duration: 0.35,
        ease: "power2.out",
      });
    }

    // Percentage counter (once only)
    if (pctRef.current && !countedRef.current) {
      countedRef.current = true;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: skill.level,
        duration: 0.9,
        ease: "power2.out",
        delay: 0.05,
        onUpdate: () => {
          if (pctRef.current)
            pctRef.current.textContent = `${Math.round(obj.val)}%`;
        },
      });
    }

    // Scanline: repeating left-to-right sweep
    if (scan) {
      scanTlRef.current?.kill();
      const tl = gsap.timeline({ repeat: -1 });
      tl.fromTo(
        scan,
        { left: "-4px", opacity: 0.55 },
        { left: "100%", opacity: 0.15, duration: 2.2, ease: "none" },
      ).set(scan, { left: "-4px", opacity: 0 });
      scanTlRef.current = tl;
    }
  }, [skill.name, skill.level, onHoverChange]);

  // ── Hover leave ───────────────────────────────────────────────────────────
  const handleLeave = useCallback(() => {
    const row = rowRef.current;
    const name = nameRef.current;
    const wave = waveWrapRef.current;
    const bdr = borderRef.current;
    if (!row) return;

    onHoverChange(null);
    waveActiveRef.current = false;

    // Collapse row
    gsap.to(row, { height: ROW_CLOSED, duration: 0.45, ease: "power3.inOut" });

    // Wave fade out
    if (wave) gsap.to(wave, { opacity: 0, duration: 0.25 });

    // Border out
    if (bdr) gsap.to(bdr, { opacity: 0, duration: 0.25 });

    // Name: reset letter-spacing
    if (name)
      gsap.to(name, {
        letterSpacing: "0.02em",
        duration: 0.4,
        ease: "elastic.out(1, 0.5)",
      });

    // Kill scanline
    scanTlRef.current?.kill();
    scanTlRef.current = null;
    if (scanRef.current) gsap.set(scanRef.current, { opacity: 0 });

    // Cleanup
    return () => scanTlRef.current?.kill();
  }, [onHoverChange]);

  // Unmount wave canvas a moment after leaving (saves GPU)
  useEffect(() => {
    if (!canvasMounted) return;
    // no auto-unmount — keep mounted once created
  }, [canvasMounted]);

  const rowNumStr = String(rowIndex + 1).padStart(2, "0");

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ clipPath: "inset(0 0 100% 0)" }}
    >
      <div
        ref={rowRef}
        className="relative overflow-hidden border-t border-white/[0.06] flex items-start gap-6 px-0 cursor-default"
        style={{ height: ROW_CLOSED }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* Left accent border */}
        <div
          ref={borderRef}
          className="absolute left-0 top-0 w-[2px] h-full opacity-0"
          style={{
            background: `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT}40 100%)`,
            transformOrigin: "top",
          }}
        />

        {/* Scanline */}
        <div
          ref={scanRef}
          className="absolute top-0 bottom-0 w-px opacity-0 pointer-events-none"
          style={{ background: `${ACCENT}40`, left: "-4px" }}
        />

        {/* Row content */}
        <div className="relative z-10 flex items-center gap-5 w-full pt-3 pb-3 pl-4">
          {/* Row index */}
          <span
            ref={numRef}
            className="font-mono text-[0.6rem] tracking-[0.2em] shrink-0"
            style={{ color: `${ACCENT}60`, minWidth: 24 }}
          >
            {rowNumStr}
          </span>

          {/* Skill name */}
          <span
            ref={nameRef}
            className="font-display text-base md:text-lg font-light text-cream/90 flex-1"
            style={{ letterSpacing: "0.02em", willChange: "letter-spacing" }}
          >
            {skill.name}
          </span>

          {/* Percentage */}
          <span
            ref={pctRef}
            className="font-mono text-xs shrink-0"
            style={{ color: ACCENT, minWidth: 36, textAlign: "right" }}
          >
            {skill.level}%
          </span>
        </div>

        {/* Waveform area — revealed on expand */}
        <div
          ref={waveWrapRef}
          className="absolute left-0 right-0 bottom-0 pointer-events-none opacity-0"
          style={{ height: ROW_OPEN - ROW_CLOSED - 4 }}
        >
          {canvasMounted && (
            <WaveCanvas level={skill.level} activeRef={waveActiveRef} />
          )}
        </div>

        {/* Warm bg glow on hover (CSS transition is fine for bg) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, ${ACCENT}08 0%, transparent 60%)`,
          }}
          // toggled via classname trick: parent hovered state not needed; GSAP handles it
        />
      </div>
    </div>
  );
}

// ─── Skill group (category block) ─────────────────────────────────────────────
function SkillGroup({ group }: { group: (typeof skillGroups)[number] }) {
  const groupRef = useRef<HTMLDivElement>(null);
  const catNumRef = useRef<HTMLSpanElement>(null);
  const catLabelRef = useRef<HTMLDivElement>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);

  const handleHover = useCallback((name: string | null) => {
    activeRef.current = name;
    setActiveSkill(name);
  }, []);

  // Scroll entrance — category number count-up + label slide
  useGSAP(
    () => {
      // Category label slides from left
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

      // Category number counts 00 → group.index
      const targetNum = parseInt(group.index, 10);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetNum,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: groupRef.current,
          start: "top 82%",
          once: true,
        },
        onUpdate: () => {
          if (catNumRef.current) {
            catNumRef.current.textContent = String(
              Math.round(obj.val),
            ).padStart(2, "0");
          }
        },
      });
    },
    { scope: groupRef },
  );

  return (
    <div ref={groupRef} className="mb-20 last:mb-0">
      {/* Category header */}
      <div ref={catLabelRef} className="flex items-baseline gap-4 mb-6 pl-4">
        <span
          ref={catNumRef}
          className="font-mono text-xs tracking-[0.3em]"
          style={{ color: `${ACCENT}80` }}
        >
          00
        </span>
        <span className="font-display text-2xl md:text-3xl font-light text-cream/50 tracking-tight">
          {group.category}
        </span>
        <div
          className="flex-1 h-px ml-4"
          style={{
            background: `linear-gradient(90deg, ${ACCENT}30, transparent)`,
          }}
        />
      </div>

      {/* Skills list */}
      <div className="relative">
        {group.skills.map((skill, si) => (
          <div
            key={skill.name}
            style={{
              // Dim non-hovered siblings — but only when something IS hovered
              opacity: activeSkill && activeSkill !== skill.name ? 0.38 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            <SkillRow
              skill={skill}
              rowIndex={si}
              totalInGroup={group.skills.length}
              groupActiveRef={activeRef}
              onHoverChange={handleHover}
            />
          </div>
        ))}
        {/* Bottom border of group */}
        <div className="border-t border-white/[0.06]" />
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Header split-text entrance
  useGSAP(
    () => {
      if (!headingRef.current) return;

      // Header label
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

      // Heading words
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
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
          delay: 0.1,
          onComplete: () => split.revert(),
        },
      );

      // Sub-copy fade
      gsap.fromTo(
        ".skills-sub",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            once: true,
          },
          delay: 0.25,
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-32 px-8 md:px-16 bg-ink text-cream overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Section header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-6 mb-20">
          <span className="skills-header-label section-label text-stone">
            03 — Skills
          </span>
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(90deg, ${ACCENT}40, transparent)`,
            }}
          />
        </div>

        {/* Heading + sub-copy — asymmetric layout */}
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

        {/* ── Skill groups ────────────────────────────────────────────── */}
        <div>
          {skillGroups.map((group) => (
            <SkillGroup key={group.category} group={group} />
          ))}
        </div>

        {/* Decorative bottom rule */}
        <div
          className="mt-16 h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${ACCENT}30, transparent)`,
          }}
        />
      </div>
    </section>
  );
}
