"use client";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import ParticleTextScene from "../ui/ParticleText";

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

const EMAIL = "0xdegend@gmail.com";
const SOCIALS = [
  { label: "GitHub", href: "https://github.com/0xdegend", index: "01" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/olagboye-seyi/",
    index: "02",
  },
  { label: "X / Twitter", href: "https://x.com/0xdegend", index: "03" },
];

function CtaBtn() {
  const [hot, setHot] = useState(false);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.to(fillRef.current, {
      scaleX: hot ? 1 : 0,
      duration: 0.5,
      ease: hot ? "expo.out" : "expo.in",
      transformOrigin: hot ? "left center" : "right center",
    });
  }, [hot]);

  return (
    <a
      href={`mailto:${EMAIL}`}
      className="relative inline-flex items-center gap-5 px-9 py-4 overflow-hidden"
      style={{
        border: "1px solid rgba(201,168,124,0.32)",
        cursor: "pointer",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
    >
      <span
        ref={fillRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "#C9A87C", transform: "scaleX(0)" }}
      />
      <span className="relative flex items-center gap-7">
        <span
          className="font-mono text-[0.62rem] tracking-[0.44em] uppercase"
          style={{
            color: hot ? "#09090b" : "#f5f0e8",
            transition: "color .18s",
          }}
        >
          Send me a Mail
        </span>
        <svg
          width="22"
          height="9"
          viewBox="0 0 22 9"
          fill="none"
          style={{
            color: hot ? "#09090b" : "#C9A87C",
            transition: "color .18s, transform .45s",
            transform: hot ? "translateX(5px)" : "translateX(0)",
          }}
        >
          <path
            d="M0 4.5h20M16 1l5 3.5-5 3.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}

function Ticker() {
  const WORDS = [
    "Available for work ✦",
    "Open to collabs ✦",
    "Let's build together ✦",
    "Reach out anytime ✦",
  ];
  const items = [...WORDS, ...WORDS, ...WORDS, ...WORDS];
  return (
    <div
      className="overflow-hidden"
      style={{
        borderTop: "1px solid rgba(201,168,124,0.07)",
        borderBottom: "1px solid rgba(201,168,124,0.07)",
        padding: "9px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "3.5rem",
          whiteSpace: "nowrap",
          animation: "ticker 22s linear infinite",
        }}
      >
        {items.map((w, i) => (
          <span
            key={i}
            className="font-mono text-[0.48rem] tracking-[0.42em] uppercase"
            style={{ color: "rgba(201,168,124,0.22)", flexShrink: 0 }}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const socRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(EMAIL);
      } else {
        const el = document.createElement("textarea");
        el.value = EMAIL;
        el.setAttribute("readonly", "");
        el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
        document.body.appendChild(el);
        el.focus();
        el.select();
        el.setSelectionRange(0, el.value.length); // iOS Safari needs this
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  useGSAP(
    () => {
      if (h2Ref.current) {
        const split = new SplitText(h2Ref.current, { type: "lines,words" });
        gsap.set(split.words, { opacity: 0, yPercent: 115, rotateX: -38 });
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 68%",
          once: true,
          onEnter: () =>
            gsap.to(split.words, {
              opacity: 1,
              yPercent: 0,
              rotateX: 0,
              duration: 1.05,
              stagger: 0.055,
              ease: "expo.out",
              onComplete: () => split.revert(),
            }),
        });
      }

      const els = [
        badgeRef.current,
        subRef.current,
        ctaRef.current,
        emailRef.current,
        socRef.current,
      ];
      gsap.set(els, { opacity: 0, y: 26 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 58%",
        once: true,
        onEnter: () =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.82,
            stagger: 0.085,
            ease: "power3.out",
          }),
      });

      gsap.set(footerRef.current, { opacity: 0 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 44%",
        once: true,
        onEnter: () =>
          gsap.to(footerRef.current, { opacity: 1, duration: 0.7 }),
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative flex flex-col overflow-hidden"
      style={{ background: "#09090b" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(700px, 90vw)",
            height: "min(400px, 50vw)",
            background:
              "radial-gradient(ellipse, rgba(201,168,124,0.06) 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.28,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.06'/%3E%3C/svg%3E")`,
            backgroundSize: "160px",
          }}
        />
      </div>

      <div
        className="relative flex items-center gap-5 px-8 md:px-16 pt-5"
        style={{ zIndex: 10 }}
      >
        <span
          className="font-mono text-[0.5rem] tracking-[0.38em] uppercase"
          style={{ color: "rgba(201,168,124,0.38)" }}
        >
          04 — Contact
        </span>
        <div
          className="flex-1 h-px"
          style={{
            background:
              "linear-gradient(90deg,rgba(201,168,124,0.18),transparent)",
          }}
        />
        <span
          className="font-mono text-[0.48rem] tracking-[0.3em] uppercase"
          style={{ color: "rgba(201,168,124,0.18)" }}
        >
          {new Date().getFullYear()}
        </span>
      </div>

      <div className="relative mt-2" style={{ zIndex: 10 }}>
        <Ticker />
      </div>

      <div
        className="relative flex flex-col items-center justify-center text-center px-6 md:px-16 pb-6"
        style={{ zIndex: 10 }}
      >
        <div
          ref={badgeRef}
          className="flex items-center gap-2.5 mb-4 px-4 py-2"
          style={{
            border: "1px solid rgba(201,168,124,0.16)",
            background: "rgba(201,168,124,0.04)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "#4ade80",
              boxShadow: "0 0 7px #4ade80",
              animation: "blink 2s ease-in-out infinite",
            }}
          />
          <span
            className="font-mono text-[0.51rem] tracking-[0.34em] uppercase"
            style={{ color: "rgba(201,168,124,0.65)" }}
          >
            Available for new projects
          </span>
        </div>

        <h2
          ref={h2Ref}
          className="font-display font-light tracking-tight mb-3"
          style={{
            fontSize: "clamp(2.2rem,5.5vw,6rem)",
            lineHeight: 0.87,
            color: "#f5f0e8",
            perspective: "900px",
          }}
        >
          Have something
          <br />
          <em style={{ color: "#C9A87C" }}>worth&nbsp;building</em>
          <span style={{ color: "#C9A87C" }}>?</span>
        </h2>

        <p
          ref={subRef}
          className="font-light leading-relaxed mb-4 max-w-[42ch]"
          style={{
            color: "rgba(255,255,255,0.32)",
            fontSize: "clamp(0.85rem,1.35vw,1.05rem)",
          }}
        >
          I&apos;m open to full-time roles, freelance projects, and interesting
          collaborations. Drop me a message I reply within&nbsp;24&nbsp;hours.
        </p>

        <div ref={ctaRef} className="mb-4">
          <CtaBtn />
        </div>

        <div ref={emailRef} className="flex items-center gap-3.5 mb-4">
          <span
            className="font-mono text-[0.54rem] tracking-[0.28em] uppercase"
            style={{ color: "rgba(255,255,255,0.16)" }}
          >
            {EMAIL}
          </span>
          <button
            onClick={copyEmail}
            className="flex items-center gap-1.5 font-mono text-[0.48rem] tracking-[0.26em] uppercase"
            style={{
              color: copied ? "#4ade80" : "rgba(201,168,124,0.4)",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color .2s",
            }}
          >
            {copied ? (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5l2.5 2.5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <rect
                    x="3"
                    y="1"
                    width="6"
                    height="7"
                    rx="0.8"
                    stroke="currentColor"
                    strokeWidth="0.9"
                  />
                  <path
                    d="M7 1V0.5H1.5a1 1 0 00-1 1V8h1"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        <div ref={socRef} className="flex items-end gap-10 md:gap-14">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className="font-mono text-[0.42rem] tracking-[0.3em]"
                style={{ color: "rgba(201,168,124,0.2)" }}
              >
                {s.index}
              </span>
              <span
                className="font-mono text-[0.54rem] tracking-[0.24em] uppercase transition-colors duration-300"
                style={{ color: "rgba(255,255,255,0.2)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#C9A87C";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.2)";
                }}
              >
                {s.label}
              </span>
              <span
                className="h-px w-0 group-hover:w-full transition-all duration-500 ease-out"
                style={{ background: "rgba(201,168,124,0.38)" }}
              />
            </a>
          ))}
        </div>

        <div
          className="relative w-full"
          style={{
            zIndex: 10,
            height: "clamp(60px, 10vw, 120px)",
            marginTop: "clamp(8px, 1.5vw, 20px)",
            marginBottom: "clamp(4px, 1vw, 12px)",
          }}
        >
          <ParticleTextScene
            text="0xdegend"
            particleCount={900}
            color="#C9A87C"
            accentColor="#FFE4B0"
            className="w-full h-full"
          />
        </div>
      </div>

      <div
        ref={footerRef}
        className="relative flex flex-col sm:flex-row items-center justify-between gap-3 px-8 md:px-16 py-5"
        style={{ zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <span
          className="font-mono text-[0.46rem] tracking-[0.32em] uppercase"
          style={{ color: "rgba(201,168,124,0.18)" }}
        >
          Crafting elegant digital experiences
        </span>
      </div>

      <style>{`
        @keyframes ticker { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes blink  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(.78)} }
      `}</style>
    </section>
  );
}
