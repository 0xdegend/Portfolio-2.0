"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SLIDES = [
  {
    src: "/images/my-bosu-pfp.jpg",
    caption: "Building in the open",
    year: "2024",
  },
  {
    src: "/images/bosu-2.jpg",
    caption: "Somewhere between code & coffee",
    year: "2023",
  },
  {
    src: "/images/my-desk.jpg",
    caption: "The desk where it all happens",
    year: "2023",
  },
  {
    src: "/images/my-bosu-pfp.jpg",
    caption: "Speaking at a local meetup",
    year: "2022",
  },
];

const stats = [
  { value: "5+", label: "Years Experience" },
  { value: "40+", label: "Projects Shipped" },
  { value: "12+", label: "Happy Clients" },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const slides = gsap.utils.toArray<HTMLElement>(".slide-frame");
      const total = slides.length;

      // ── Intro text animations ──────────────────────────────────────────────
      gsap.fromTo(
        ".about-headline",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );
      gsap.fromTo(
        ".about-body",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".about-body", start: "top 82%" },
        },
      );
      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".stats-row", start: "top 88%" },
        },
      );

      // ── Initial state — all cards hidden below, ready to deal in ────────────
      slides.forEach((s, i) => {
        gsap.set(s, {
          y: 160,
          scale: 0.78,
          opacity: 0,
          rotation: 0,
          zIndex: total - i,
          x: 0,
        });
      });

      // ── Entry shuffle — cards deal into the fan when section enters view ───
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          slides.forEach((s, i) => {
            const restScale = i === 0 ? 1 : 0.9 - (i - 1) * 0.025;
            const restY = i === 0 ? 0 : i * 14;
            const restRotation = i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * i * 1.6;
            gsap.to(s, {
              y: restY,
              scale: restScale,
              rotation: restRotation,
              opacity: 1,
              duration: 0.65,
              // Bottom cards deal in first so the top card lands last (on top)
              delay: (total - 1 - i) * 0.09,
              ease: "back.out(1.3)",
            });
          });
        },
      });

      // hudIdx = which slide the HUD is currently showing.
      // Switches at t >= 0.5 so caption/counter always match the visually dominant card.
      let hudIdx = 0;

      const st = ScrollTrigger.create({
        trigger: trackRef.current,
        start: "top top",
        end: () => `+=${(total - 1) * window.innerHeight}`,
        pin: stickyRef.current,
        scrub: 0.9,
        onUpdate(self) {
          const progress = self.progress * (total - 1);
          const current = Math.floor(progress);
          const t = progress - current; // 0→1 within each card transition

          // ── Card transforms ────────────────────────────────────────────────
          // Track which card was last active so we can animate the incoming one
          slides.forEach((s, i) => {
            if (i < current) {
              // Spent — ease off to the side gracefully
              gsap.to(s, {
                scale: 0.75,
                y: -50,
                x: i % 2 === 0 ? -45 : 45,
                rotation: i % 2 === 0 ? -10 : 10,
                opacity: 0,
                zIndex: i,
                duration: 0.6,
                ease: "power3.inOut",
                overwrite: "auto",
              });
            } else if (i === current) {
              // Active — ease up to full size with a gentle spring
              gsap.to(s, {
                scale: 1,
                y: 0,
                x: 0,
                rotation: 0,
                opacity: 1,
                zIndex: total + 1,
                duration: 0.6,
                ease: "power3.out",
                overwrite: "auto",
              });
            } else {
              // Waiting — ease into shuffled deck position
              const depth = i - current;
              const animated = depth - t;
              gsap.to(s, {
                scale: Math.max(1 - animated * 0.05, 0.65),
                y: Math.max(animated * 14, 0),
                x: 0,
                rotation: (i % 2 === 0 ? 1 : -1) * Math.max(animated * 1.6, 0),
                opacity: 1,
                zIndex: total - depth + 1,
                duration: 0.5,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
          });

          // ── HUD sync ───────────────────────────────────────────────────────
          // Switch at t >= 0.5 so HUD matches the visually dominant card.
          // Edge case: scrub means self.progress asymptotically approaches 1.0
          // but may never hit it exactly — so at >= 0.99 we hard-clamp to the
          // last slide index, guaranteeing counter shows "04" not "03".
          const dominantIdx =
            self.progress >= 0.99
              ? total - 1
              : t >= 0.5 && current < total - 1
                ? current + 1
                : current;

          // Progress always tracks raw scroll position
          if (progressRef.current)
            progressRef.current.style.width = `${(self.progress * 100).toFixed(1)}%`;

          if (dominantIdx !== hudIdx) {
            hudIdx = dominantIdx;

            // Counter snaps in sync with caption
            if (counterRef.current)
              counterRef.current.textContent = String(hudIdx + 1).padStart(
                2,
                "0",
              );

            // Caption crossfade
            if (captionRef.current) {
              gsap.killTweensOf(captionRef.current);
              gsap.to(captionRef.current, {
                opacity: 0,
                y: -6,
                duration: 0.15,
                ease: "power2.in",
                onComplete: () => {
                  if (!captionRef.current) return;
                  captionRef.current.textContent = SLIDES[hudIdx].caption;
                  gsap.fromTo(
                    captionRef.current,
                    { opacity: 0, y: 6 },
                    { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
                  );
                },
              });
            }

            // Year crossfade — same timing as caption
            if (yearRef.current) {
              gsap.killTweensOf(yearRef.current);
              gsap.to(yearRef.current, {
                opacity: 0,
                duration: 0.15,
                ease: "power2.in",
                onComplete: () => {
                  if (!yearRef.current) return;
                  yearRef.current.textContent = SLIDES[hudIdx].year;
                  gsap.to(yearRef.current, { opacity: 1, duration: 0.25 });
                },
              });
            }
          }
        },
      });

      return () => st.kill();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="about" className="relative">
      {/*
        trackRef is the scroll budget — tall enough for all card transitions.
        stickyRef (the visible layout) pins inside it for the full duration.
      */}
      <div
        ref={trackRef}
        style={{ height: `calc(100vh + ${(SLIDES.length - 1) * 100}vh)` }}
        className="relative"
      >
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen w-full flex flex-col justify-center
                     px-8 md:px-16 overflow-hidden"
        >
          {/* Section label */}
          <div className="flex items-center gap-6 mb-14 max-w-7xl mx-auto w-full">
            <span className="section-label">01 — About</span>
            <div className="flex-1 rule-accent" />
          </div>

          {/* Two-column grid — text left, card stack right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto w-full">
            {/* ── Left: text content ──────────────────────────────────────── */}
            <div>
              <div className="overflow-hidden mb-1">
                <h2 className="about-headline font-display text-5xl md:text-6xl font-light leading-tight">
                  Crafting
                </h2>
              </div>
              <div className="overflow-hidden mb-8">
                <h2 className="about-headline font-display text-5xl md:text-6xl font-light leading-tight italic text-stone">
                  with purpose.
                </h2>
              </div>

              <p className="about-body text-stone leading-relaxed mb-5 font-light">
                I&apos;m a Frontend Engineer at the intersection of engineering
                discipline and design sensibility — obsessed with performance,
                accessibility, and the small details that make experiences
                memorable.
              </p>
              <p className="about-body text-stone leading-relaxed mb-10 font-light">
                Currently open to new opportunities — full-time roles, long-term
                contracts, or exciting side projects worth building together.
              </p>

              <div className="stats-row grid grid-cols-3 gap-6 border-t border-muted pt-8">
                {stats.map((s) => (
                  <div key={s.label} className="stat-item">
                    <div className="font-display text-4xl font-light text-ink mb-1">
                      {s.value}
                    </div>
                    <div className="section-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: card stack ───────────────────────────────────────── */}
            <div className="relative h-[480px] lg:h-[560px]">
              {/* Cards — positioned relative to this container */}
              {SLIDES.map((slide, i) => (
                <div
                  key={i}
                  className="slide-frame absolute inset-4 rounded-2xl overflow-hidden shadow-2xl border border-muted/20"
                  style={{ zIndex: i + 1, willChange: "transform, opacity" }}
                >
                  <Image
                    src={slide.src}
                    alt={slide.caption}
                    fill
                    className="object-cover"
                    priority={i === 0}
                  />
                  {/* Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  {/* Card index badge */}
                  <span className="absolute top-3 left-3 font-mono text-xs tracking-widest text-cream/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}

              {/* Caption + progress pinned to bottom of card area */}
              <div className="absolute bottom-0 left-4 right-4 z-50 pointer-events-none space-y-3 pb-5 px-4">
                <div className="flex items-end justify-between">
                  <p
                    ref={captionRef}
                    className="font-display text-lg font-light text-cream leading-snug max-w-[70%]"
                  >
                    {SLIDES[0].caption}
                  </p>
                  <div className="text-right">
                    <span
                      ref={counterRef}
                      className="font-mono text-xs text-cream/50"
                    >
                      {String(1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-xs text-cream/30">
                      /{String(SLIDES.length).padStart(2, "0")}
                    </span>
                    <br />
                    <span
                      ref={yearRef}
                      className="font-mono text-xs tracking-widest text-cream/40"
                    >
                      {SLIDES[0].year}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-px bg-cream/20">
                  <div
                    ref={progressRef}
                    className="h-full bg-accent"
                    style={{ width: "0%", transition: "none" }}
                  />
                </div>
              </div>

              {/* Scroll hint — fades naturally as user scrolls */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
                <span className="section-label text-stone/40">
                  scroll to explore
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
