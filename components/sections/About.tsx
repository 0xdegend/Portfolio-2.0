"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const AboutScene = dynamic(() => import("@/components/canvas/AboutScene"), {
  ssr: false,
});

const stats = [
  { value: "5+", label: "Years Experience" },
  { value: "40+", label: "Projects Shipped" },
  { value: "12+", label: "Happy Clients" },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Fade in text blocks on scroll
      gsap.fromTo(
        ".about-text",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        },
      );

      // Stats fade up
      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".stats-row",
            start: "top 80%",
          },
        },
      );

      // 3D canvas slide in from right
      gsap.fromTo(
        ".about-canvas",
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        },
      );
    },
    { scope: sectionRef }, // scopes all class selectors to this element — no cleanup needed
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-32 px-8 md:px-16 max-w-7xl mx-auto"
    >
      {/* Section header */}
      <div className="flex items-center gap-6 mb-20">
        <span className="section-label">01 — About</span>
        <div className="flex-1 rule-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Text side */}
        <div>
          <h2 className="about-text font-display text-5xl md:text-6xl font-light leading-tight mb-8">
            Building at the intersection of{" "}
            <em className="text-stone">craft</em> and{" "}
            <em className="text-accent">code</em>
            <span className="text-accent">.</span>
          </h2>

          <p className="about-text text-stone leading-relaxed mb-5 font-light">
            I&apos;m a full-stack developer with a passion for building things
            that feel alive. My work lives at the intersection of engineering
            discipline and design sensibility — I care deeply about performance,
            accessibility, and the small details that make experiences
            memorable.
          </p>

          <p className="about-text text-stone leading-relaxed mb-10 font-light">
            Currently open to new opportunities — whether that&apos;s a
            full-time role, a long-term contract, or an exciting side project
            worth building together.
          </p>

          {/* Stats */}
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

        {/* 3D Canvas side */}
        <div className="about-canvas relative h-[500px] lg:h-[600px] bg-muted/30 rounded-sm overflow-hidden border border-muted">
          <AboutScene />
          {/* Caption */}
          <div className="absolute bottom-4 right-4 section-label text-stone/50">
            drag to rotate
          </div>
        </div>
      </div>
    </section>
  );
}
