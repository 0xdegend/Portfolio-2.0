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

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

export default function MobileAbout() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const mTrackRef = useRef<HTMLDivElement>(null);
  const mStickyRef = useRef<HTMLDivElement>(null);
  const mSlideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mProgressRef = useRef<HTMLDivElement>(null);
  const mProgressDot = useRef<HTMLDivElement>(null);
  const mCaptionRef = useRef<HTMLParagraphElement>(null);
  const mTagRef = useRef<HTMLSpanElement>(null);
  const mAccentRef = useRef<HTMLSpanElement>(null);
  const mYearRef = useRef<HTMLSpanElement>(null);
  const mCounterRef = useRef<HTMLSpanElement>(null);

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

      if (h2Ref.current) {
        const split = new SplitText(h2Ref.current, { type: "chars" });
        gsap.set(split.chars, { opacity: 0, y: 35, rotation: -6 });
        gsap.fromTo(
          split.chars,
          { opacity: 0, y: 35, rotation: -6 },
          {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 0.85,
            stagger: 0.04,
            ease: "expo.out",
            scrollTrigger: {
              trigger: h2Ref.current,
              start: "top 85%",
              once: true,
            },
            onComplete: () => split.revert(),
          },
        );
      }

      const bodyEls =
        wrapRef.current?.querySelectorAll<HTMLElement>(".m-about-body");
      if (bodyEls?.length) {
        gsap.set(bodyEls, { opacity: 0, y: 22 });
        gsap.fromTo(
          bodyEls,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bodyEls[0],
              start: "top 88%",
              once: true,
            },
          },
        );
      }
      const pillEls =
        wrapRef.current?.querySelectorAll<HTMLElement>(".m-trait-pill");
      const traitsRow = wrapRef.current?.querySelector(".m-traits-row");
      if (pillEls?.length) {
        gsap.set(pillEls, { opacity: 0, scale: 0.82 });
        gsap.fromTo(
          pillEls,
          { opacity: 0, scale: 0.82 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.48,
            stagger: 0.06,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: traitsRow ?? pillEls[0],
              start: "top 90%",
              once: true,
            },
          },
        );
      }

      const statEls =
        wrapRef.current?.querySelectorAll<HTMLElement>(".m-stat-item");
      const statsRow = wrapRef.current?.querySelector(".m-stats-row");
      if (statEls?.length) {
        gsap.set(statEls, { opacity: 0, y: 14 });
        gsap.fromTo(
          statEls,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRow ?? statEls[0],
              start: "top 90%",
              once: true,
            },
          },
        );
      }

      mSlideRefs.current.forEach((s, i) => {
        if (!s) return;
        gsap.set(s, { opacity: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 1.05 });
      });

      let mCurrent = 0;
      const mCrossfade = (next: number) => {
        if (next === mCurrent) return;
        const prev = mCurrent;
        mCurrent = next;
        gsap.to(mSlideRefs.current[prev], {
          opacity: 0,
          scale: 1.06,
          duration: 0.65,
          ease: "power2.inOut",
          overwrite: true,
        });
        gsap.fromTo(
          mSlideRefs.current[next],
          { opacity: 0, scale: 1.05 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            overwrite: true,
          },
        );
        if (mCounterRef.current)
          mCounterRef.current.textContent = String(next + 1).padStart(2, "0");
        swapText(mCaptionRef.current, SLIDES[next].caption);
        swapText(mTagRef.current, SLIDES[next].tag);
        swapText(mAccentRef.current, SLIDES[next].accent);
        swapText(mYearRef.current, SLIDES[next].year);
      };

      const mSt = ScrollTrigger.create({
        trigger: mTrackRef.current,
        start: "top top",
        end: () => `+=${(total - 1) * window.innerHeight * 0.7}`,
        pin: mStickyRef.current,
        onUpdate(self) {
          const pct = (self.progress * 100).toFixed(2) + "%";
          if (mProgressRef.current) mProgressRef.current.style.width = pct;
          if (mProgressDot.current) mProgressDot.current.style.left = pct;
          mCrossfade(
            Math.min(Math.round(self.progress * (total - 1)), total - 1),
          );
        },
      });

      gsap.set(mStickyRef.current, { opacity: 0, y: 24 });
      gsap.fromTo(
        mStickyRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: mTrackRef.current,
            start: "top 90%",
            end: "top 10%",
            scrub: 0.6,
          },
        },
      );

      return () => mSt.kill();
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className="lg:hidden">
      <div className="px-6 lg:pt-16 pt-5 lg:pb-10 pb-5 flex flex-col gap-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="section-label">01 — About</span>
          <div className="flex-1 rule-accent" />
        </div>
        <h2
          ref={h2Ref}
          className="font-display font-light leading-[0.88] tracking-tight text-ink"
          style={{ fontSize: "clamp(3rem, 14vw, 5rem)" }}
        >
          About
          <br />
          <em className="text-stone">Me.</em>
        </h2>
        <p className="m-about-body text-stone leading-relaxed font-light text-sm">
          I&apos;m a Frontend Engineer with a strong interest in AI, focused on
          creating clean, thoughtful interfaces. I care about minimalist design,
          clear typography, and intuitive animations that enhance the user
          experience.
        </p>
        <p className="m-about-body text-stone leading-relaxed font-light text-sm">
          Currently open to new opportunities — full-time roles, long-term
          contracts, or exciting side projects worth building together.
        </p>
        <div className="m-traits-row flex flex-wrap gap-2">
          {TRAITS.map((t) => (
            <TraitPill key={t} label={t} className="m-trait-pill" />
          ))}
        </div>
        <div className="m-stats-row grid grid-cols-3 gap-4 border-t border-muted pt-6">
          {STATS.map((s) => (
            <StatItem
              key={s.label}
              value={s.value}
              label={s.label}
              className="m-stat-item"
            />
          ))}
        </div>
      </div>
      <div
        ref={mTrackRef}
        style={{ height: `calc(${(SLIDES.length - 1) * 70}vh + 75svh)` }}
        className="relative"
      >
        <div
          ref={mStickyRef}
          className="sticky top-0 h-svh w-full flex flex-col px-6 py-8 gap-4"
        >
          <div className="flex items-center justify-between shrink-0">
            <span className="section-label text-stone/40">Gallery</span>
            <div className="flex items-baseline gap-0.5">
              <span
                ref={mCounterRef}
                className="font-mono text-xs text-stone/60"
              >
                01
              </span>
              <span className="font-mono text-xs text-stone/30">
                /{String(SLIDES.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="relative flex-1 rounded-2xl overflow-hidden mt-7">
            {SLIDES.map((slide, i) => (
              <div
                key={i}
                ref={(el) => {
                  mSlideRefs.current[i] = el;
                }}
                className="absolute inset-0"
                style={{ willChange: "opacity, transform" }}
              >
                <Image
                  src={slide.src}
                  alt={slide.caption}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/5 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-b from-ink/25 via-transparent to-transparent" />
              </div>
            ))}

            <div className="absolute top-4 left-4 z-10">
              <span
                ref={mTagRef}
                className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-cream/45"
              >
                {SLIDES[0].tag}
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <span
                ref={mYearRef}
                className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-cream/35"
              >
                {SLIDES[0].year}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pt-8">
              <span
                ref={mAccentRef}
                className="block font-mono text-[0.56rem] text-accent/75 tracking-[0.18em] uppercase mb-1"
              >
                {SLIDES[0].accent}
              </span>
              <p
                ref={mCaptionRef}
                className="font-display text-base font-light text-cream leading-snug mb-4"
              >
                {SLIDES[0].caption}
              </p>
              <div className="w-full h-px bg-cream/12 relative mb-3">
                <div
                  ref={mProgressRef}
                  className="absolute top-0 left-0 h-full bg-[#c9a96e]"
                  style={{ width: "0%", transition: "none" }}
                />
                <div
                  ref={mProgressDot}
                  className="absolute top-1/2 w-1.5 h-1.5 rounded-full bg-[#c9a96e]"
                  style={{
                    left: "0%",
                    transform: "translate(-50%,-50%)",
                    transition: "none",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center shrink-0">
            <span className="section-label text-stone/30">
              scroll to explore
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
