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
  const initialized = useRef(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const nav = navRef.current;
    const links = linksRef.current;
    const cta = ctaRef.current;
    const badge = statusRef.current;
    if (!nav || !links || !cta || !badge) return;

    requestAnimationFrame(() => {
      nav.style.width = "max-content";
      nav.style.justifyContent = "space-between";
      nav.style.gap = "1.25rem";
      const naturalW = nav.getBoundingClientRect().width;
      nav.style.width = `${naturalW}px`;
      initialized.current = true;

      gsap.fromTo(
        nav,
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, delay: 0.3, ease: "power3.out" },
      );
    });
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!initialized.current) return;
    const nav = navRef.current;
    const links = linksRef.current;
    const cta = ctaRef.current;
    const badge = statusRef.current;
    if (!nav || !links || !cta || !badge) return;

    gsap.killTweensOf([nav, links, cta, badge]);

    const fromW = nav.getBoundingClientRect().width;

    if (scrolled) {
      links.style.display = "none";
      cta.style.display = "none";
      badge.style.display = "flex";
      badge.style.visibility = "hidden";
      nav.style.width = "max-content";
      nav.style.justifyContent = "flex-start";
      nav.style.gap = "0.75rem";
      const targetW = nav.getBoundingClientRect().width;
      nav.style.width = `${fromW}px`;
      nav.style.justifyContent = "space-between";
      nav.style.gap = "1.25rem";
      links.style.display = "flex";
      cta.style.display = "inline-flex";
      badge.style.display = "none";
      badge.style.visibility = "";
      gsap.to([links, cta], {
        autoAlpha: 0,
        y: -8,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          links.style.display = "none";
          cta.style.display = "none";
          nav.style.justifyContent = "flex-start";
          nav.style.gap = "0.75rem";
          badge.style.display = "flex";
          gsap.fromTo(
            badge,
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" },
          );
        },
      });

      gsap.to(nav, {
        width: targetW,
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => {
          nav.style.width = `${targetW}px`;
        },
      });
    } else {
      badge.style.display = "none";
      links.style.display = "flex";
      links.style.visibility = "hidden";
      cta.style.display = "inline-flex";
      cta.style.visibility = "hidden";
      nav.style.width = "max-content";
      nav.style.justifyContent = "space-between";
      nav.style.gap = "1.25rem";
      const targetW = nav.getBoundingClientRect().width;
      nav.style.width = `${fromW}px`;
      links.style.display = "none";
      links.style.visibility = "";
      cta.style.display = "none";
      cta.style.visibility = "";
      gsap.to(badge, {
        autoAlpha: 0,
        y: -8,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          badge.style.display = "none";
          nav.style.justifyContent = "space-between";
          nav.style.gap = "1.25rem";
          links.style.display = "flex";
          cta.style.display = "inline-flex";
          gsap.fromTo(
            [links, cta],
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" },
          );
        },
      });

      gsap.to(nav, {
        width: targetW,
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => {
          nav.style.width = `${targetW}px`;
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled]);

  return (
    <nav
      ref={navRef}
      className={` fixed top-5 left-1/2 -translate-x-1/2 z-9999 px-3 md:px-3 py-2
        flex items-center rounded-full transition-colors duration-500 ${
          scrolled
            ? "bg-cream/80 backdrop-blur-md border border-muted"
            : "bg-transparent border border-muted"
        }`}
    >
      <a href="#" className="w-10 h-10 shrink-0">
        <Image
          src="/images/my-bosu-pfp.jpg"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
      </a>

      <ul ref={linksRef} className="hidden md:flex items-center gap-5 shrink-0">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="section-label hover:text-ink transition-colors duration-300 relative group whitespace-nowrap"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
            </a>
          </li>
        ))}
      </ul>

      <div ref={statusRef} className="hidden items-center gap-2 shrink-0">
        <span className="font-mono text-xs tracking-widest text-ink/70 uppercase whitespace-nowrap">
          Available for Work
        </span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      </div>

      <a
        ref={ctaRef}
        href="/resume.pdf"
        target="_blank"
        className="hidden md:inline-flex items-center gap-2 border rounded-2xl border-ink px-5 py-2
          text-xs tracking-widest uppercase font-mono shrink-0 whitespace-nowrap
          hover:bg-ink hover:text-cream transition-all duration-300"
      >
        Résumé
      </a>
    </nav>
  );
}
