"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);

const CIRCUMFERENCE = 2 * Math.PI * 54;

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
  const noiseRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const barTrackRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const barDotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const curtainTopRef = useRef<HTMLDivElement>(null);
  const curtainBotRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  const pctRef = useRef(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  useNoise(noiseRef as React.RefObject<HTMLCanvasElement>);
  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.fromTo(
        wrapRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
      );
      tl.fromTo(
        counterRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" },
        0.12,
      );
      tl.fromTo(
        labelRef.current,
        { y: 6, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
        0.22,
      );
      tl.fromTo(
        barTrackRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.65, ease: "expo.out" },
        0.28,
      );
      tl.fromTo(
        statusRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        0.45,
      );
    },
    { scope: wrapRef },
  );
  useEffect(() => {
    const updateDOM = (v: number) => {
      const r = Math.round(v);
      if (counterRef.current)
        counterRef.current.textContent = String(r).padStart(2, "0");
      if (barFillRef.current) barFillRef.current.style.width = `${v}%`;
      if (barDotRef.current) barDotRef.current.style.left = `${v}%`;
      if (circleRef.current)
        circleRef.current.style.strokeDashoffset = String(
          CIRCUMFERENCE - (v / 100) * CIRCUMFERENCE,
        );
      if (statusRef.current) {
        statusRef.current.textContent =
          v < 40
            ? "Initialising renderer…"
            : v < 75
              ? "Loading 3D assets…"
              : v < 95
                ? "Compiling shaders…"
                : "Almost ready…";
      }
    };

    if (externalProgress !== undefined) {
      gsap.to(pctRef, {
        current: externalProgress,
        duration: 0.4,
        ease: "power2.out",
        onUpdate() {
          updateDOM(pctRef.current);
        },
        onComplete() {
          if (externalProgress >= 99) triggerExit();
        },
      });
      return;
    }

    const obj = { v: 0 };
    const tick = () => {
      if (doneRef.current) return;
      obj.v += Math.random() * (obj.v < 50 ? 5.5 : obj.v < 80 ? 2.5 : 0.7);
      if (obj.v >= 99) {
        obj.v = 99;
        gsap.ticker.remove(tick);
        updateDOM(99);
        triggerExit();
        return;
      }
      updateDOM(obj.v);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalProgress]);
  const triggerExit = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (counterRef.current) counterRef.current.textContent = "100";
    if (circleRef.current) circleRef.current.style.strokeDashoffset = "0";
    if (barFillRef.current) barFillRef.current.style.width = "100%";
    if (barDotRef.current) barDotRef.current.style.left = "100%";
    if (statusRef.current) statusRef.current.textContent = "Ready.";

    const vh = window.innerHeight;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(wrapRef.current, { display: "none" });
        onCompleteRef.current?.();
      },
    });
    tl.fromTo(
      lineRef.current,
      { scaleX: 0, opacity: 1 },
      {
        scaleX: 1,
        duration: 0.3,
        ease: "expo.out",
        transformOrigin: "center center",
      },
      0,
    );
    tl.to(
      uiRef.current,
      {
        opacity: 0,
        y: -6,
        duration: 0.2,
        ease: "power2.in",
      },
      0.1,
    );
    tl.to(
      curtainTopRef.current,
      {
        y: -vh,
        duration: 0.75,
        ease: "expo.inOut",
      },
      0.22,
    );
    tl.to(
      curtainBotRef.current,
      {
        y: vh,
        duration: 0.75,
        ease: "expo.inOut",
      },
      0.22,
    );
    tl.to(lineRef.current, { opacity: 0, duration: 0.15 }, 0.35);
    tl.to(noiseRef.current, { opacity: 0, duration: 0.3 }, 0.4);
  };

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 overflow-hidden"
      style={{ background: "transparent", opacity: 0, zIndex: 99999 }}
    >
      <canvas
        ref={noiseRef as React.RefObject<HTMLCanvasElement>}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: "overlay", opacity: 0.5, zIndex: 1 }}
      />
      <div
        ref={curtainTopRef}
        className="absolute left-0 right-0 top-0 flex flex-col items-center justify-end pb-0"
        style={{
          height: "50vh",
          background: "#09090b",
          zIndex: 10,
          boxShadow: "0 4px 40px 0 rgba(0,0,0,0.7)",
        }}
      />
      <div
        ref={curtainBotRef}
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: "50vh",
          background: "#09090b",
          zIndex: 10,
          boxShadow: "0 -4px 40px 0 rgba(0,0,0,0.0)",
        }}
      />
      <div
        ref={lineRef}
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: "50vh",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, #C9A87C, transparent)",
          zIndex: 15,
          opacity: 0,
          transform: "scaleX(0)",
        }}
      />
      {(
        [
          "top-5 left-5",
          "top-5 right-5",
          "bottom-5 left-5",
          "bottom-5 right-5",
        ] as const
      ).map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-3 h-3 pointer-events-none`}
          style={{ zIndex: 20 }}
        >
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
      <div
        ref={uiRef}
        className="absolute inset-0 flex flex-col items-center justify-center gap-8"
        style={{ zIndex: 20 }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: 140, height: 140 }}
        >
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
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 128 128"
            fill="none"
          >
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="#ffffff08"
              strokeWidth="1"
              fill="none"
            />
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

        <span
          ref={labelRef}
          className="font-mono text-[0.58rem] tracking-[0.5em] uppercase"
          style={{ color: "#C9A87C", letterSpacing: "0.5em" }}
        >
          ✦ &nbsp; Initialising &nbsp; ✦
        </span>

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
              background: "linear-gradient(90deg,#C9A87C50,#C9A87C)",
              boxShadow: "0 0 6px #C9A87C",
              transition: "width 0.05s linear",
            }}
          />
          <div
            ref={barDotRef}
            className="absolute top-1/2 w-1 h-1 rounded-full"
            style={{
              left: "0%",
              transform: "translate(-50%,-50%)",
              background: "#C9A87C",
              boxShadow: "0 0 5px #C9A87C",
            }}
          />
        </div>

        <span
          ref={statusRef}
          className="font-mono text-[0.52rem] tracking-[0.25em] uppercase"
          style={{ color: "#ffffff20" }}
        >
          Initialising renderer…
        </span>
        <div
          className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-7 font-mono text-[0.5rem] tracking-[0.2em] uppercase"
          style={{ color: "#C9A87C" }}
        >
          <span>Portfolio — {new Date().getFullYear()}</span>
          <span>AI · Blockchain · Web3</span>
        </div>
      </div>
    </div>
  );
}
