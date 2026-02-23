"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";

gsap.registerPlugin(useGSAP);

const HeroScene = dynamic(() => import("@/components/canvas/HeroScene"), {
  ssr: false,
});

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        ".hero-line",
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 1.1, stagger: 0.12, ease: "expo.out" },
      )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
          "-=0.5",
        )
        .fromTo(
          metaRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          "-=0.4",
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1 },
          "-=0.2",
        );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-end pb-20 px-8 md:px-16 overflow-hidden"
    >
      {/*
        Canvas wrapper:
        - pointer-events-none on the outer div so it never blocks text links below
        - [&>div>canvas]:pointer-events-auto re-enables events on the actual <canvas>
          so R3F's raycaster receives mouse events for hover/click interactions
      */}
      <div className="absolute top-0 right-0 w-full md:w-[80%] h-full z-0 pointer-events-none">
        <div className="w-full h-full [&>canvas]:pointer-events-auto">
          <HeroScene />
        </div>
      </div>

      {/* Gradients — always pointer-events-none, they're purely visual */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cream to-transparent z-10 pointer-events-none" />
      <div className="hidden md:block absolute top-0 left-1/3 w-48 h-full bg-gradient-to-r from-cream to-transparent z-10 pointer-events-none" />

      {/*
        Text content — pointer-events-none on the container so the canvas
        behind it stays interactive. Re-enable only on actual clickable elements.
      */}
      <div className="relative z-20 max-w-7xl pointer-events-none">
        <div className="line-mask mb-6">
          <p className="hero-line section-label">Frontend Engineer</p>
        </div>

        <h1 className="font-display font-light text-6xl md:text-8xl lg:text-[10rem] leading-none tracking-tight text-ink mb-8">
          <div className="line-mask">
            <span className="hero-line block">Crafting</span>
          </div>
          <div className="line-mask">
            <span className="hero-line block italic text-stone">elegant</span>
          </div>
          <div className="line-mask">
            <span className="hero-line block">digital</span>
          </div>
          <div className="line-mask">
            <span className="hero-line block">
              experiences<span className="text-accent">.</span>
            </span>
          </div>
        </h1>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-muted pt-6">
          <p
            ref={subRef}
            className="text-stone font-light text-base md:text-lg max-w-md leading-relaxed"
          >
            I build performant, accessible, and beautifully crafted interfaces —
            from design systems to full-stack applications.
          </p>
          <div ref={metaRef} className="flex items-center gap-8">
            {/* Re-enable pointer events on links so they're still clickable */}
            <a
              href="#projects"
              className="pointer-events-auto inline-flex items-center gap-3 text-xs tracking-widest uppercase font-mono text-ink hover:text-accent transition-colors duration-300"
            >
              View Work
              <span className="w-12 h-px bg-current inline-block" />
            </a>
            <a
              href="#contact"
              className="pointer-events-auto inline-flex items-center gap-3 text-xs tracking-widest uppercase font-mono text-stone hover:text-ink transition-colors duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator — re-enable pointer events so it's interactive if needed */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 right-8 md:right-16 z-20 flex flex-col items-center gap-3 pointer-events-none"
      >
        <span className="section-label" style={{ writingMode: "vertical-rl" }}>
          Scroll
        </span>
        <div className="w-px h-16 bg-stone/30 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full bg-accent animate-[scrollLine_1.5s_ease-in-out_infinite]"
            style={{ height: "40%" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollLine {
          0% {
            top: -40%;
          }
          100% {
            top: 140%;
          }
        }
      `}</style>
    </section>
  );
}
