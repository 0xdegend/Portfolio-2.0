"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const isAnimating = useRef(false); // guard against
  useEffect(() => {
    // Animate nav and logo on mount
    gsap.fromTo(
      navRef.current,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: "power3.out" },
    );
    gsap.fromTo(
      logoRef.current,
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, delay: 0.7, ease: "power3.out" },
    );
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const nav = navRef.current;
    const links = linksRef.current;
    const cta = ctaRef.current;
    const badge = statusRef.current;
    const logo = logoRef.current;
    if (!nav || !links || !cta || !badge || !logo) return;
    if (isAnimating.current) gsap.killTweensOf([nav, links, cta, badge, logo]);

    isAnimating.current = true;

    // Use GSAP timeline for smoother, sequenced animations
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        isAnimating.current = false;
      },
    });

    if (scrolled) {
      badge.style.display = "flex";
      badge.style.opacity = "0";
      badge.style.position = "absolute";
      const collapsedW = nav.scrollWidth;
      badge.style.position = "";

      const currentW = nav.getBoundingClientRect().width;

      tl.to([links, cta], {
        autoAlpha: 0,
        y: -16,
        duration: 0.44,
        ease: "power4.inOut",
        stagger: 0.08,
        onComplete: () => {
          links.style.display = "none";
          cta.style.display = "none";
        },
      })
        .to(
          logo,
          {
            scale: 0.93,
            duration: 0.38,
            ease: "power2.inOut",
          },
          "<",
        )
        .fromTo(
          nav,
          { width: currentW },
          {
            width: collapsedW,
            duration: 0.7,
            ease: "power3.inOut",
          },
          ">-0.10",
        )
        .fromTo(
          badge,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.44,
            ease: "power3.out",
          },
          ">-0.22",
        );
    } else {
      links.style.display = "flex";
      links.style.opacity = "0";
      links.style.position = "absolute";
      cta.style.display = "inline-flex";
      cta.style.opacity = "0";
      cta.style.position = "absolute";
      const expandedW = nav.scrollWidth;
      links.style.position = "";
      cta.style.position = "";

      const currentW = nav.getBoundingClientRect().width;

      tl.to(badge, {
        opacity: 0,
        y: -16,
        duration: 0.44,
        ease: "power4.inOut",
        onComplete: () => {
          badge.style.display = "none";
        },
      })
        .to(
          logo,
          {
            scale: 1,
            duration: 0.44,
            ease: "power2.inOut",
          },
          "<",
        )
        .fromTo(
          nav,
          { width: currentW },
          {
            width: expandedW,
            duration: 0.7,
            ease: "power3.inOut",
          },
          ">-0.10",
        )
        .fromTo(
          [links, cta],
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.44,
            ease: "power3.out",
            onComplete: () => {
              gsap.set(nav, { width: "" });
            },
            stagger: 0.08,
          },
          ">-0.22",
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled]);

  return (
    <nav
      ref={navRef}
      className={`mx-auto fixed top-5 left-0 right-0 z-50 px-4 md:px-5 py-3 flex items-center gap-5 rounded-full justify-between transition-colors duration-500 ${
        scrolled
          ? "w-fit bg-cream/80 backdrop-blur-md border border-mute"
          : "w-1/2 bg-transparent border border-muted"
      }`}
    >
      {/* Logo — always visible, now animated */}
      <a ref={logoRef} href="#" className="w-10 h-10 ">
        <Image
          src="/images/my-bosu-pfp.png"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        {/* 0x<span className="text-accent">.</span> */}
      </a>

      {/* Links — GSAP controls visibility */}
      <ul ref={linksRef} className="hidden md:flex items-center gap-5">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="section-label hover:text-ink transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
            </a>
          </li>
        ))}
      </ul>

      {/* Availability badge — GSAP controls visibility */}
      <div ref={statusRef} className="hidden items-center gap-2.5 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="font-mono text-xs tracking-widest text-ink/70 uppercase whitespace-nowrap">
          Available for Work
        </span>
      </div>

      {/* Résumé CTA — GSAP controls visibility */}
      <a
        ref={ctaRef}
        href="/resume.pdf"
        target="_blank"
        className="hidden md:inline-flex items-center gap-2 border border-ink px-5 py-2 text-xs tracking-widest uppercase font-mono hover:bg-ink hover:text-cream transition-all duration-300 shrink-0"
      >
        Résumé
      </a>
    </nav>
  );
}
