"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
gsap.registerPlugin();

// ── Shatter tile config ───────────────────────────────────────────────────
const COLS = 8;
const ROWS = 6;
const TOTAL = COLS * ROWS;

// ── Noise canvas ──────────────────────────────────────────────────────────
function useNoise(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let running = true;
    const draw = () => {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const img = ctx.createImageData(w, h);
      const data = img.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 14;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [canvasRef]);
}

interface PreloaderProps {
  onComplete?: () => void;
  progress?: number;
}

export default function Preloader({
  onComplete,
  progress: externalProgress,
}: PreloaderProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const barTrackRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const barDotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  const pctRef = useRef(0);
  const doneRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useNoise(noiseRef as React.RefObject<HTMLCanvasElement>);

  // ── Entrance ─────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const tl = gsap.timeline();

    // Fade whole wrap in
    tl.fromTo(
      wrapRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" },
    );

    // Counter slides up
    tl.fromTo(
      counterRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" },
      0.2,
    );

    // Label fades in with stagger chars feel (just opacity + slight y)
    tl.fromTo(
      labelRef.current,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      0.35,
    );

    // Bar track expands from center
    tl.fromTo(
      barTrackRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.9, ease: "expo.out" },
      0.4,
    );

    // Status blinks in
    tl.fromTo(
      statusRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" },
      0.7,
    );

    return () => {
      tl.kill();
    };
  }, []);

  // ── Progress driver ───────────────────────────────────────────────────
  useEffect(() => {
    const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54 on SVG circle

    const updateDOM = (value: number) => {
      const rounded = Math.round(value);
      if (counterRef.current)
        counterRef.current.textContent = String(rounded).padStart(2, "0");
      if (barFillRef.current) barFillRef.current.style.width = `${value}%`;
      if (barDotRef.current) barDotRef.current.style.left = `${value}%`;
      if (circleRef.current) {
        const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;
        circleRef.current.style.strokeDashoffset = String(offset);
      }
      // Pulse status text between two messages
      if (statusRef.current) {
        statusRef.current.textContent =
          value < 40
            ? "Initialising renderer…"
            : value < 75
              ? "Loading 3D assets…"
              : value < 95
                ? "Compiling shaders…"
                : "Almost ready…";
      }
    };

    if (externalProgress !== undefined) {
      gsap.to(pctRef, {
        current: externalProgress,
        duration: 0.5,
        ease: "power2.out",
        onUpdate() {
          updateDOM(pctRef.current);
        },
        onComplete() {
          if (externalProgress >= 100) triggerExit();
        },
      });
      return;
    }

    const obj = { v: 0 };
    const tick = () => {
      if (doneRef.current) return;
      obj.v += Math.random() * (obj.v < 60 ? 3.5 : obj.v < 85 ? 1.5 : 0.5);
      if (obj.v >= 100) {
        obj.v = 100;
        gsap.ticker.remove(tick);
        updateDOM(100);
        triggerExit();
        return;
      }
      updateDOM(obj.v);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalProgress]);

  // ── Glitch shatter exit ───────────────────────────────────────────────
  const triggerExit = () => {
    if (doneRef.current) return;
    doneRef.current = true;

    const tiles = tilesRef.current?.querySelectorAll<HTMLDivElement>(".shard");
    if (!tiles) return;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(wrapRef.current, { display: "none" });
        onComplete?.();
      },
    });

    // Glitch flicker
    tl.to(
      wrapRef.current,
      {
        filter: "hue-rotate(90deg) saturate(3)",
        duration: 0.06,
        repeat: 5,
        yoyo: true,
        ease: "none",
      },
      0,
    );

    // Center content snaps out
    tl.to(
      [
        counterRef.current,
        labelRef.current,
        barTrackRef.current,
        statusRef.current,
      ],
      {
        opacity: 0,
        y: -10,
        skewX: 8,
        duration: 0.2,
        ease: "power3.in",
        stagger: 0.03,
      },
      0.1,
    );

    // Tiles shatter
    tiles.forEach((tile) => {
      const dir = Math.random() > 0.5 ? 1 : -1;
      tl.to(
        tile,
        {
          x: (Math.random() - 0.5) * window.innerWidth * 0.9,
          y: (Math.random() - 0.5) * window.innerHeight * 0.9,
          rotation: (Math.random() - 0.5) * 360,
          scale: Math.random() * 0.5 + 0.1,
          skewX: dir * (Math.random() * 28 + 8),
          opacity: 0,
          duration: 0.55 + Math.random() * 0.4,
          ease: "expo.in",
        },
        0.15 + Math.random() * 0.1,
      );
    });
  };

  const CIRCUMFERENCE = 2 * Math.PI * 54;

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[9999] overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "#09090b", opacity: 0 }}
    >
      {/* Grain */}
      <canvas
        ref={noiseRef as React.RefObject<HTMLCanvasElement>}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: "overlay", opacity: 0.5 }}
      />

      {/* Shatter tiles */}
      <div ref={tilesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: TOTAL }, (_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          return (
            <div
              key={i}
              className="shard absolute"
              style={{
                left: `${(col / COLS) * 100}%`,
                top: `${(row / ROWS) * 100}%`,
                width: `${100 / COLS}%`,
                height: `${100 / ROWS}%`,
                background: "#09090b",
                willChange: "transform, opacity",
              }}
            />
          );
        })}
      </div>

      {/* ── Corner marks ── */}
      {(
        [
          "top-5 left-5",
          "top-5 right-5",
          "bottom-5 left-5",
          "bottom-5 right-5",
        ] as const
      ).map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-3 h-3 pointer-events-none`}>
          <div
            className="absolute top-0 left-0 w-full h-px"
            style={{ background: "#C9A87C30" }}
          />
          <div
            className="absolute top-0 left-0 h-full w-px"
            style={{ background: "#C9A87C30" }}
          />
        </div>
      ))}

      {/* ── Core UI ── */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* SVG arc ring + counter in center */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 140, height: 140 }}
        >
          {/* Rotating dashed ring (ambient) */}
          <svg
            className="absolute inset-0 animate-[spin_12s_linear_infinite]"
            viewBox="0 0 128 128"
            fill="none"
          >
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="#C9A87C"
              strokeWidth="0.5"
              strokeDasharray="4 10"
              strokeOpacity="0.2"
            />
          </svg>

          {/* Progress arc */}
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 128 128"
            fill="none"
          >
            {/* Track */}
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="#ffffff08"
              strokeWidth="1"
              fill="none"
            />
            {/* Fill */}
            <circle
              ref={circleRef}
              cx="64"
              cy="64"
              r="54"
              stroke="#C9A87C"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset: CIRCUMFERENCE,
                filter: "drop-shadow(0 0 4px #C9A87C)",
                transition: "stroke-dashoffset 0.05s linear",
              }}
            />
          </svg>

          {/* Counter */}
          <div className="flex flex-col items-center gap-0.5">
            <div
              ref={counterRef}
              className="font-mono tabular-nums font-light"
              style={{ fontSize: "2.8rem", color: "#f5f0e8", lineHeight: 1 }}
            >
              00
            </div>
            <span
              className="font-mono text-[0.55rem] tracking-[0.3em] uppercase"
              style={{ color: "#C9A87C80" }}
            >
              %
            </span>
          </div>
        </div>

        {/* Label */}
        <span
          ref={labelRef}
          className="font-mono text-[0.58rem] tracking-[0.5em] uppercase"
          style={{ color: "#C9A87C", letterSpacing: "0.5em" }}
        >
          ✦ &nbsp; Initialising &nbsp; ✦
        </span>

        {/* Thin progress bar */}
        <div
          ref={barTrackRef}
          className="relative overflow-visible origin-center"
          style={{ width: 160, height: 1, background: "#ffffff08", opacity: 0 }}
        >
          <div
            ref={barFillRef}
            className="absolute top-0 left-0 h-full"
            style={{
              width: "0%",
              background: "linear-gradient(90deg, #C9A87C50, #C9A87C)",
              boxShadow: "0 0 6px #C9A87C",
              transition: "width 0.05s linear",
            }}
          />
          <div
            ref={barDotRef}
            className="absolute top-1/2 w-1 h-1 rounded-full"
            style={{
              left: "0%",
              transform: "translate(-50%, -50%)",
              background: "#C9A87C",
              boxShadow: "0 0 5px #C9A87C",
            }}
          />
        </div>

        {/* Dynamic status */}
        <span
          ref={statusRef}
          className="font-mono text-[0.52rem] tracking-[0.25em] uppercase"
          style={{ color: "#ffffff20" }}
        >
          Initialising renderer…
        </span>
      </div>

      {/* Bottom meta */}
      <div
        className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-7 font-mono text-[0.5rem] tracking-[0.2em] uppercase"
        style={{ color: "#ffffff15" }}
      >
        <span>Portfolio — 2025</span>
        <span>AI · Blockchain · Web3</span>
      </div>
    </div>
  );
}
