"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import dynamic from "next/dynamic";

gsap.registerPlugin(useGSAP, SplitText);

const HeroScene = dynamic(() => import("@/components/canvas/HeroScene"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

function useMagnetic(strength = 0.45, radius = 90) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        gsap.to(el, {
          x: dx * strength,
          y: dy * strength,
          duration: 0.4,
          ease: "power2.out",
        });
      } else {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.45)",
        });
      }
    };

    const onLeave = () =>
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, radius]);

  return ref;
}

function useScramble() {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#∆Ω≈";
  return useCallback((el: HTMLElement, target: string, duration = 750) => {
    let frame = 0;
    const total = Math.floor(duration / 16);
    const id = setInterval(() => {
      el.textContent = target
        .split("")
        .map((ch, i) => {
          if (ch === " ") return " ";
          if (frame / total > i / target.length) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");
      if (++frame >= total) {
        el.textContent = target;
        clearInterval(id);
      }
    }, 16);
    return () => clearInterval(id);
  }, []);
}

const ROLES = [
  "Frontend Engineer",
  "Creative Developer",
  "Motion Enthusiast",
  "3D Enthusiast",
  "AI & Blockchain Engineer",
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const viewWorkRef = useMagnetic(0.5, 100);
  const contactRef = useMagnetic(0.5, 100);
  const scramble = useScramble();
  const [roleIdx, setRoleIdx] = useState(0);
  useEffect(() => {
    let canvas: HTMLCanvasElement | null = null;
    let tid: ReturnType<typeof setTimeout>;
    const block = (e: WheelEvent) => e.stopImmediatePropagation();
    const attach = () => {
      const wrap = canvasWrapRef.current;
      if (!wrap) return;
      canvas = wrap.querySelector("canvas");
      if (!canvas) {
        tid = setTimeout(attach, 50);
        return;
      }
      canvas.addEventListener("wheel", block, { capture: true, passive: true });
      canvas.style.pointerEvents = "auto";
      ScrollTrigger.refresh();
    };
    tid = setTimeout(attach, 50);
    return () => {
      clearTimeout(tid);
      canvas?.removeEventListener("wheel", block, { capture: true });
    };
  }, []);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      if (h1Ref.current) {
        gsap.to(h1Ref.current, {
          x: nx * 10,
          y: ny * 5,
          duration: 1.4,
          ease: "power2.out",
        });
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const el = roleRef.current;
      if (!el) return;
      setRoleIdx((prev) => {
        const next = (prev + 1) % ROLES.length;
        scramble(el, ROLES[next]);
        return next;
      });
    }, 3200);
    return () => clearInterval(id);
  }, [scramble]);
  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const year = new Date().getFullYear();
    const obj = { val: year - 7 };
    gsap.to(obj, {
      val: year,
      duration: 2.4,
      delay: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(obj.val));
      },
    });
  }, []);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    gsap.to(el, { x: "-50%", duration: 22, ease: "none", repeat: -1 });
  }, []);
  useGSAP(
    () => {
      const h1 = h1Ref.current;
      if (!h1) return;

      const split = new SplitText(h1, { type: "chars,words" });

      const tl = gsap.timeline({ delay: 0.05 });
      tl.fromTo(
        split.chars,
        {
          opacity: 0,
          y: () => gsap.utils.random(-80, 80),
          x: () => gsap.utils.random(-20, 20),
          rotation: () => gsap.utils.random(-25, 25),
          scale: () => gsap.utils.random(0.3, 0.8),
          filter: "blur(4px)",
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          rotation: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.1,
          stagger: { amount: 0.65, from: "start" },
          ease: "expo.out",
        },
      )
        .fromTo(
          ".hero-badge",
          { opacity: 0, y: -12, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 0.5,
            ease: "back.out(2.5)",
          },
          0.3,
        )
        .fromTo(
          ".hero-role",
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" },
          0.5,
        )
        .fromTo(
          ".hero-stat",
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.07,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.3",
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 18, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.85,
            ease: "power3.out",
          },
          "-=0.35",
        )
        .fromTo(
          metaRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.4",
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1 },
          "-=0.3",
        )
        .fromTo(
          ".marquee-strip",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5",
        );
      split.chars.forEach((char) => {
        char.addEventListener("mouseenter", () => {
          gsap.to(char, {
            y: -10,
            scaleX: 1.15,
            color: "var(--accent)",
            duration: 0.18,
            ease: "power2.out",
          });
        });
        char.addEventListener("mouseleave", () => {
          gsap.to(char, {
            y: 0,
            scaleX: 1,
            color: "",
            duration: 0.55,
            ease: "elastic.out(1, 0.35)",
          });
        });
      });

      return () => split.revert();
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-end px-8 md:px-16 overflow-hidden "
    >
      <div className="cursor-pointer-3d  absolute top-0 right-0 w-[60%] md:w-[50%] h-[80%] z-999">
        <div ref={canvasWrapRef} className="w-full h-full">
          <HeroScene />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-52 bg-linear-to-t from-cream to-transparent z-10 " />
      <div className="absolute top-0 left-0 w-[45%] h-full bg-linear-to-r from-cream via-cream/60 to-transparent z-10 " />
      <div className="hero-badge opacity-0 absolute top-8 left-8 md:left-16 z-30 flex items-center gap-2.5">
        <span className="font-mono text-[0.6rem] text-stone/40 tracking-[0.25em] uppercase">
          ©<span ref={counterRef}>{new Date().getFullYear() - 7}</span>
        </span>
        <span className="w-px h-3 bg-stone/20" />
        <span className="font-mono text-[0.6rem] text-stone/40 tracking-[0.25em] uppercase">
          Portfolio
        </span>
      </div>

      <div className="hero-badge opacity-0 absolute top-8 right-8 md:right-16 z-30 flex items-center gap-2 pointer-events-none">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="font-mono text-[0.6rem] text-stone/50 tracking-[0.2em] uppercase">
          Available for work
        </span>
      </div>

      <div className="relative z-20 max-w-7xl pb-16">
        <div className="hero-role opacity-0 flex items-center gap-3 mb-5 pointer-events-none">
          <span className="block w-6 h-px bg-accent shrink-0" />
          <span className="section-label tracking-[0.3em]">
            <span ref={roleRef}>{ROLES[0]}</span>
          </span>
        </div>
        <h1
          ref={h1Ref}
          className="font-display font-light text-[clamp(3.5rem,9vw,9.5rem)] leading-[0.92] tracking-tight text-ink mb-7 pointer-events-auto cursor-default select-none"
          style={{ willChange: "transform" }}
        >
          <span className="block">Crafting</span>
          <span className="block italic text-stone">elegant</span>
          <span className="block">digital</span>
          <span className="block">
            experiences<span className="text-accent non-italic">.</span>
          </span>
        </h1>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-muted pt-6">
          <p
            ref={subRef}
            className="text-stone font-light text-base md:text-lg max-w-sm leading-relaxed pointer-events-none"
            style={{ opacity: 0 }}
          >
            Developer focused on AI & Blockchain — crafting clean interfaces
            with minimalist design, clear typography, and purposeful motion.
          </p>
          <div
            ref={metaRef}
            className="flex items-center gap-6 pointer-events-auto"
            style={{ opacity: 0 }}
          >
            <a
              href="#projects"
              className="group relative inline-flex items-center gap-3 text-[0.65rem] tracking-[0.22em] uppercase font-mono text-ink border border-ink/15 px-5 py-3 overflow-hidden hover:border-ink transition-colors duration-500"
            >
              <span className="absolute inset-0 bg-ink translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
              <span className="relative z-10 group-hover:text-cream transition-colors duration-200 delay-100">
                View Work
              </span>
              <span className="relative z-10 w-8 h-px bg-current inline-block group-hover:w-14 transition-all duration-500 group-hover:bg-cream" />
            </a>

            <a
              href="#contact"
              className="group inline-flex items-center gap-2 text-[0.65rem] tracking-[0.22em] uppercase font-mono text-stone/70 hover:text-ink transition-colors duration-300"
            >
              <span className="block w-0 h-px bg-accent group-hover:w-5 transition-all duration-400" />
              Contact
              <span className="block w-0 h-px bg-accent group-hover:w-5 transition-all duration-400 delay-75" />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-20 right-8 md:right-16 z-20 flex flex-col items-center gap-3 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <span
          className="section-label text-stone/35"
          style={{ writingMode: "vertical-rl", letterSpacing: "0.3em" }}
        >
          Scroll
        </span>
        <div className="w-px h-14 bg-stone/15 relative overflow-hidden">
          <div
            className="absolute left-0 w-full bg-accent animate-[scrollLine_1.6s_ease-in-out_infinite]"
            style={{ height: "35%", top: "-35%" }}
          />
        </div>
      </div>

      {/* ── Marquee ticker strip ─────────────────────────────────────────────── */}
      <div className="marquee-strip opacity-0 absolute bottom-0 left-0 right-0 z-20 border-t border-muted/30 overflow-hidden pointer-events-none bg-cream/60 backdrop-blur-sm">
        <div className="flex whitespace-nowrap py-2.5">
          <div
            ref={marqueeRef}
            className="flex gap-0 will-change-transform flex-shrink-0"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <span
                key={i}
                className="flex items-center font-mono text-[0.58rem] text-stone/30 tracking-[0.25em] uppercase"
              >
                <span className="px-6">Frontend Engineering</span>
                <span className="text-accent/60">✦</span>
                <span className="px-6">Creative Development</span>
                <span className="text-accent/60">✦</span>
                <span className="px-6">Motion & Interaction</span>
                <span className="text-accent/60">✦</span>
                <span className="px-6">AI Integration</span>
                <span className="text-accent/60">✦</span>
                <span className="px-6">Blockchain</span>
                <span className="text-accent/60">✦</span>
                <span className="px-6">Web3</span>
                <span className="text-accent/60">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollLine {
          0% {
            top: -35%;
          }
          100% {
            top: 135%;
          }
        }
      `}</style>
    </section>
  );
}
