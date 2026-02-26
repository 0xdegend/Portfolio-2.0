"use client";
import { useRef, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { projects } from "../utils/data/project";
gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

type Project = (typeof projects)[number];

function useCursorBox() {
  const followerRef = useRef<HTMLDivElement | null>(null);
  const prevX = useRef(0);
  const lastClient = useRef({ x: -9999, y: -9999 });
  const isVisible = useRef(false);

  // whether we should respond to pointermove updates
  const trackingRef = useRef(false);

  // quickTo instances for smooth motion
  const qX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qRot = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const initFollower = useCallback((el: HTMLDivElement | null) => {
    followerRef.current = el;
    if (!el) return;
    qX.current = gsap.quickTo(el, "x", { duration: 0.12, ease: "power2.out" });
    qY.current = gsap.quickTo(el, "y", { duration: 0.12, ease: "power2.out" });
    qRot.current = gsap.quickTo(el, "rotationZ", {
      duration: 0.4,
      ease: "power2.out",
    });

    // keep it offscreen / hidden initially
    gsap.set(el, { x: -9999, y: -9999, opacity: 0, scale: 0.92 });
  }, []);

  // Move follower to viewport client coords (only when tracking is enabled)
  const moveTo = useCallback((clientX: number, clientY: number) => {
    // always cache the last pointer coords so show() can place the box immediately
    lastClient.current = { x: clientX, y: clientY };

    if (!trackingRef.current) return; // only follow when tracking enabled

    const el = followerRef.current;
    if (!el) return;

    // offsets so the box sits slightly to the top-right of the cursor
    const offsetX = 18;
    const offsetY = -22;

    qX.current?.(clientX + offsetX);
    qY.current?.(clientY + offsetY);

    // small rotation based on velocity for a lively feel
    const vx = clientX - prevX.current;
    const rot = gsap.utils.clamp(-6, 6, vx * 0.25);
    qRot.current?.(rot);
    prevX.current = clientX;
  }, []);

  // Show and start tracking
  const show = useCallback(() => {
    const el = followerRef.current;
    if (!el) return;
    isVisible.current = true;
    trackingRef.current = true; // enable following on pointermove

    // place at last known position immediately to avoid jump
    gsap.set(el, {
      x: lastClient.current.x + 18,
      y: lastClient.current.y - 22,
    });

    // animate in
    gsap.killTweensOf(el);
    gsap.to(el, {
      opacity: 1,
      scale: 1,
      duration: 0.28,
      ease: "power3.out",
      overwrite: true,
    });
  }, []);

  // Hide and stop tracking
  const hide = useCallback(() => {
    const el = followerRef.current;
    if (!el) return;
    isVisible.current = false;
    trackingRef.current = false; // disable following on pointermove

    gsap.to(el, {
      opacity: 0,
      scale: 0.92,
      duration: 0.22,
      ease: "power2.in",
    });
    // reset rotation smoothly
    qRot.current?.(0);
  }, []);

  return { initFollower, moveTo, show, hide, followerRef };
}

// ── Project row (keeps your layout + hover animations) ───────────────
function ProjectRow({
  project,
  index,
  onEnter,
  onLeave,
}: {
  project: Project;
  index: number;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const qArrX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qArrY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    if (!arrowRef.current) return;
    qArrX.current = gsap.quickTo(arrowRef.current, "x", {
      duration: 0.36,
      ease: "power2.out",
    });
    qArrY.current = gsap.quickTo(arrowRef.current, "y", {
      duration: 0.36,
      ease: "power2.out",
    });
  }, []);

  useGSAP(
    () => {
      const row = rowRef.current;
      if (!row) return;
      gsap.fromTo(
        numRef.current,
        { x: -16, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top 88%",
            once: true,
          },
          delay: index * 0.08,
        },
      );

      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: "words" });
        gsap.fromTo(
          split.words,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.68,
            stagger: 0.06,
            ease: "expo.out",
            scrollTrigger: {
              trigger: wrapRef.current,
              start: "top 88%",
              once: true,
            },
            delay: index * 0.08 + 0.08,
            onComplete: () => split.revert(),
          },
        );
      }

      gsap.fromTo(
        row.querySelector(".proj-desc"),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.65,
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top 86%",
            once: true,
          },
          delay: index * 0.08 + 0.18,
        },
      );

      gsap.fromTo(
        row.querySelectorAll(".proj-tech"),
        { scale: 0.75, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(2.5)",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top 86%",
            once: true,
          },
          delay: index * 0.08 + 0.22,
        },
      );
    },
    { scope: wrapRef },
  );

  const handleEnter = useCallback(() => {
    onEnter();
    gsap.to(numRef.current, {
      x: 5,
      color: "var(--accent)",
      duration: 0.28,
      ease: "power2.out",
    });
    gsap.fromTo(
      glowRef.current,
      { scaleX: 0, opacity: 1, transformOrigin: "left" },
      { scaleX: 1, duration: 0.5, ease: "expo.out" },
    );
    gsap.to(lineRef.current, { scaleX: 1, duration: 0.45, ease: "expo.out" });
    const row = rowRef.current;
    if (row)
      gsap.to(row.querySelectorAll(".proj-meta-item"), {
        y: -3,
        opacity: 1,
        duration: 0.28,
        stagger: 0.04,
        ease: "power2.out",
      });
  }, [onEnter, project]);

  const handleLeave = useCallback(() => {
    onLeave();
    gsap.to(numRef.current, {
      x: 0,
      color: "",
      duration: 0.4,
      ease: "elastic.out(1,0.5)",
    });
    gsap.to(glowRef.current, { opacity: 0, duration: 0.28, ease: "power2.in" });
    gsap.to(lineRef.current, { scaleX: 0, duration: 0.3, ease: "power2.in" });
    const row = rowRef.current;
    if (row)
      gsap.to(row.querySelectorAll(".proj-meta-item"), {
        y: 0,
        duration: 0.4,
        stagger: 0.03,
        ease: "elastic.out(1,0.5)",
      });
    qArrX.current?.(0);
    qArrY.current?.(0);
  }, [onLeave]);

  // local arrow magnetic only
  const handleMouseMoveLocal = useCallback((e: React.MouseEvent) => {
    if (!arrowRef.current) return;
    const rect = arrowRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const dx = (e.clientX - cx) * 0.25;
    qArrX.current?.(gsap.utils.clamp(-6, 6, dx));
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseMove={handleMouseMoveLocal}
      >
        <div
          ref={glowRef}
          className="absolute inset-0 opacity-0 pointer-events-none rounded-sm"
          style={{
            background:
              "linear-gradient(90deg, rgba(201,169,110,0.07) 0%, transparent 70%)",
          }}
        />

        <div
          ref={rowRef}
          className="relative border-t border-muted py-8 grid grid-cols-12 gap-x-6 gap-y-4 items-start px-2 -mx-2 rounded-sm"
        >
          <div className="col-span-1 pt-1">
            <span
              ref={numRef}
              className="font-mono text-xs text-stone/40 inline-block"
              style={{ willChange: "transform, color" }}
            >
              {project.number}
            </span>
          </div>

          <div className="col-span-12 md:col-span-6">
            <div className="overflow-hidden mb-3">
              <h3
                ref={titleRef}
                className="font-display text-3xl md:text-4xl font-light text-ink group-hover:text-accent"
                style={{ willChange: "transform" }}
              >
                {project.title}
              </h3>
            </div>
            <p className="proj-desc text-stone text-sm leading-relaxed font-light max-w-md">
              {project.description}
            </p>
          </div>

          <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
            <span className="proj-meta-item section-label text-stone/60">
              {project.category}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="proj-tech proj-meta-item font-mono text-xs px-2 py-0.5 border border-muted text-stone/70 rounded-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-2 flex md:flex-col md:items-end gap-4 md:gap-2 justify-between items-center">
            <span className="proj-meta-item font-mono text-xs text-stone/40">
              {project.year}
            </span>
            <span
              ref={arrowRef}
              className="text-ink text-xl inline-block"
              style={{ willChange: "transform" }}
              aria-hidden="true"
            >
              ↗
            </span>
          </div>
        </div>

        <div
          ref={lineRef}
          className="h-px bg-accent origin-left pointer-events-none"
          style={{ transform: "scaleX(0)" }}
        />
      </a>
    </div>
  );
}

// ── Cursor box (fixed DOM element that follows pointer while tracking) ───
function CursorBox({
  initRef,
}: {
  initRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={initRef}
      aria-hidden="true"
      className="pointer-events-none z-50"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        transform: "translate3d(0,0,0)",
        width: 140,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 12px",
        borderRadius: 8,
        background: "var(--accent)",
        color: "white",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        fontSize: 13,
        letterSpacing: "0.02em",
        willChange: "transform, opacity",
        boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
        pointerEvents: "none",
        opacity: 0,
        transformOrigin: "center",
      }}
    >
      <span style={{ fontVariantCaps: "all-small-caps", opacity: 0.98 }}>
        View project
      </span>
    </div>
  );
}

// ── Main Projects section ────────────────────────────────────────────────
export default function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { initFollower, moveTo, show, hide } = useCursorBox();

  // global pointermove -> moveTo (move only applied while tracking is enabled)
  useEffect(() => {
    const onPointer = (e: PointerEvent) => moveTo(e.clientX, e.clientY);
    const onOut = () => hide();

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onOut);
    window.addEventListener("blur", onOut);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onOut);
      window.removeEventListener("blur", onOut);
    };
  }, [moveTo, hide]);

  // header entrance (unchanged)
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
      className="relative overflow-hidden py-32 px-8 md:px-16 max-w-7xl mx-auto"
    >
      {/* cursor box */}
      <CursorBox initRef={initFollower} />

      {/* header */}
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
          href="https://github.com/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 section-label text-stone hover:text-ink transition-colors duration-300"
        >
          GitHub <span className="text-base">↗</span>
        </a>
      </div>

      {/* rows */}
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
