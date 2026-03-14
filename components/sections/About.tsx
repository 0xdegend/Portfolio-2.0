"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import { SLIDES } from "../../app/utils/data/slides";
import { STATS } from "../../app/utils/data/stats";
import { TRAITS } from "../../app/utils/data/traits";
import { TraitPill } from "../ui/TraitPill";
import { StatItem } from "../ui/StatItem";
import MobileAbout from "../ui/MobileAbout";

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressDot = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const accentRef = useRef<HTMLSpanElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const total = SLIDES.length;

      const swapText = (el: HTMLElement | null, text: string) => {
        if (!el) return;
        gsap.to(el, {
          opacity: 0,
          y: -5,
          duration: 0.13,
          ease: "power2.in",
          onComplete: () => {
            el.textContent = text;
            gsap.fromTo(
              el,
              { opacity: 0, y: 7 },
              { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" },
            );
          },
        });
      };

      const bodyEls = Array.from(
        stickyRef.current?.querySelectorAll<HTMLElement>(".about-body") ?? [],
      );
      const pillEls = Array.from(
        stickyRef.current?.querySelectorAll<HTMLElement>(".trait-pill") ?? [],
      );
      const statEls = Array.from(
        stickyRef.current?.querySelectorAll<HTMLElement>(".stat-item") ?? [],
      );
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });
      gsap.set(bodyEls, { y: 16 });
      gsap.set(pillEls, { scale: 0.82 });
      gsap.set(statEls, { y: 12 });

      const entranceTl = gsap.timeline({ paused: true });
      entranceTl.fromTo(
        stickyRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
        0,
      );
      entranceTl.fromTo(
        lineRef.current,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.65, ease: "power3.out" },
        0.1,
      );

      if (h2Ref.current) {
        const split = new SplitText(h2Ref.current, { type: "chars" });

        gsap.set(split.chars, { y: 35, rotation: -6 });
        entranceTl.fromTo(
          split.chars,
          { opacity: 0, y: 35, rotation: -6 },
          {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 0.75,
            stagger: 0.03,
            ease: "expo.out",
          },
          0.15,
        );
        entranceTl.call(() => split.revert(), [], ">");
      }

      if (bodyEls.length) {
        entranceTl.fromTo(
          bodyEls,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" },
          0.4,
        );
      }
      if (pillEls.length) {
        entranceTl.fromTo(
          pillEls,
          { opacity: 0, scale: 0.82 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(2)",
          },
          0.6,
        );
      }
      if (statEls.length) {
        entranceTl.fromTo(
          statEls,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.07,
            ease: "power3.out",
          },
          0.72,
        );
      }

      slideRefs.current.forEach((s, i) => {
        if (!s) return;
        gsap.set(s, { opacity: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 1.05 });
      });

      let currentSlide = 0;
      const crossfadeTo = (next: number) => {
        if (next === currentSlide) return;
        const prev = currentSlide;
        currentSlide = next;
        gsap.to(slideRefs.current[prev], {
          opacity: 0,
          scale: 1.06,
          duration: 0.65,
          ease: "power2.inOut",
          overwrite: true,
        });
        gsap.fromTo(
          slideRefs.current[next],
          { opacity: 0, scale: 1.05 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            overwrite: true,
          },
        );
        if (counterRef.current)
          counterRef.current.textContent = String(next + 1).padStart(2, "0");
        swapText(captionRef.current, SLIDES[next].caption);
        swapText(tagRef.current, SLIDES[next].tag);
        swapText(accentRef.current, SLIDES[next].accent);
        swapText(yearRef.current, SLIDES[next].year);
      };

      gsap.to(textColRef.current, {
        y: -45,
        ease: "none",
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top top",
          end: () => `+=${(total - 1) * window.innerHeight}`,
          scrub: 1,
        },
      });

      ScrollTrigger.create({
        trigger: trackRef.current,
        start: "top 80%",
        once: false,
        onEnter: () => entranceTl.play(),
        onLeaveBack: () => entranceTl.reverse(),
      });

      const st = ScrollTrigger.create({
        trigger: trackRef.current,
        start: "top top",
        end: () => `+=${(total - 1) * window.innerHeight}`,
        pin: stickyRef.current,
        onUpdate(self) {
          const pct = (self.progress * 100).toFixed(2) + "%";
          if (progressRef.current) progressRef.current.style.width = pct;
          if (progressDot.current) progressDot.current.style.left = pct;
          crossfadeTo(
            Math.min(Math.round(self.progress * (total - 1)), total - 1),
          );
        },
      });

      return () => {
        st.kill();
        entranceTl.kill();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="about" className="relative">
      <MobileAbout />
      <div
        ref={trackRef}
        style={{ height: `calc(100vh + ${(SLIDES.length - 1) * 100}vh)` }}
        className="relative hidden lg:block"
      >
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen w-full flex flex-col overflow-hidden"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-6 px-8 md:px-16 pt-10 pb-5 max-w-7xl mx-auto w-full shrink-0">
            <span className="section-label">01 — About</span>
            <div className="flex-1 rule-accent" />
            <div className="flex items-baseline gap-0.5">
              <span
                ref={counterRef}
                className="font-mono text-xs text-stone/60"
              >
                01
              </span>
              <span className="font-mono text-xs text-stone/30">
                /{String(SLIDES.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 max-w-7xl mx-auto w-full px-8 md:px-16 pb-8 min-h-0">
            <div
              ref={textColRef}
              className="flex flex-col justify-center pr-0 lg:pr-14 py-2"
            >
              <div className="hidden lg:flex items-stretch gap-5 mb-8">
                <div
                  ref={lineRef}
                  className="w-px bg-linear-to-b from-accent via-accent/30 to-transparent self-stretch"
                />
                <div className="py-0.5">
                  <span className="section-label text-stone/35">
                    Background & Craft
                  </span>
                </div>
              </div>

              <h2
                ref={h2Ref}
                className="font-display font-light leading-none tracking-tight text-ink mb-6"
                style={{ fontSize: "clamp(3rem, 5.5vw, 6rem)" }}
              >
                About
                <br />
                <em className="text-stone">Me.</em>
              </h2>

              <p
                className="about-body text-stone leading-relaxed mb-4 font-light text-sm md:text-base max-w-[36ch]"
                style={{ opacity: 0 }}
              >
                I&apos;m a Frontend Engineer who obsesses over the craft clean
                layouts, sharp typography, and animations that guide rather than
                distract. I am a big fan of AI, Blockchain, and thoughtful user
                experience.
              </p>
              <p
                className="about-body text-stone leading-relaxed mb-8 font-light text-sm md:text-base max-w-[36ch]"
                style={{ opacity: 0 }}
              >
                Currently open to new opportunities full-time roles, long-term
                contracts, or exciting side projects worth building together.
              </p>

              <div className="traits-row flex flex-wrap gap-2 mb-10">
                {TRAITS.map((t) => (
                  <TraitPill key={t} label={t} />
                ))}
              </div>
              <div className="stats-row grid grid-cols-3 gap-4 border-t border-muted pt-6">
                {STATS.map((s) => (
                  <StatItem key={s.label} value={s.value} label={s.label} />
                ))}
              </div>
            </div>

            <div className="relative flex flex-col items-stretch py-2 min-h-0">
              <div className="relative flex-1 rounded-2xl overflow-hidden min-h-75">
                {SLIDES.map((slide, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      slideRefs.current[i] = el;
                    }}
                    className="absolute inset-0"
                    style={{ willChange: "opacity, transform" }}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.caption}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority={i === 0}
                      loading={i === 0 ? "eager" : "lazy"}
                      quality={60}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/5 to-transparent" />
                    <div className="absolute inset-0 bg-linear-to-b from-ink/25 via-transparent to-transparent" />
                  </div>
                ))}
                <div className="absolute top-4 left-5 z-10">
                  <span
                    ref={tagRef}
                    className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-cream/45"
                  >
                    {SLIDES[0].tag}
                  </span>
                </div>
                <div className="absolute top-4 right-5 z-10">
                  <span
                    ref={yearRef}
                    className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-cream/35"
                  >
                    {SLIDES[0].year}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-10 p-5 pt-8">
                  <span
                    ref={accentRef}
                    className="block font-mono text-[0.56rem] text-accent/75 tracking-[0.18em] uppercase mb-1"
                  >
                    {SLIDES[0].accent}
                  </span>
                  <p
                    ref={captionRef}
                    className="font-display text-lg md:text-xl font-light text-cream leading-snug mb-4"
                  >
                    {SLIDES[0].caption}
                  </p>
                  <div className="w-full h-px bg-cream/12 relative mb-3">
                    <div
                      ref={progressRef}
                      className="absolute top-0 left-0 h-full bg-[#c9a96e]"
                      style={{ width: "0%", transition: "none" }}
                    />
                    <div
                      ref={progressDot}
                      className="absolute top-1/2 w-1.5 h-1.5 rounded-full bg-[#c9a96e]"
                      style={{
                        left: "0%",
                        transform: "translate(-50%, -50%)",
                        transition: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-3">
                <span className="section-label text-stone/30">
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
