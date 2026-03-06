"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import Image from "next/image";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const baseRef = useRef<HTMLSpanElement>(null);
  const accentRef = useRef<HTMLSpanElement>(null);
  const clipRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (clipRef.current && baseRef.current) {
      clipRef.current.style.height = `${baseRef.current.offsetHeight}px`;
    }
  }, []);

  const onEnter = useCallback(() => {
    const base = baseRef.current;
    const accent = accentRef.current;
    if (!base || !accent) return;
    gsap.killTweensOf([base, accent]);
    gsap.to(base, { y: "-100%", duration: 0.2, ease: "power2.inOut" });
    gsap.to(accent, { y: "-100%", duration: 0.2, ease: "power2.inOut" });
  }, []);

  const onLeave = useCallback(() => {
    const base = baseRef.current;
    const accent = accentRef.current;
    if (!base || !accent) return;
    gsap.killTweensOf([base, accent]);
    gsap.to(base, { y: "0%", duration: 0.2, ease: "power2.inOut" });
    gsap.to(accent, { y: "0%", duration: 0.2, ease: "power2.inOut" });
  }, []);

  return (
    <li className="list-none">
      <a
        href={href}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="relative flex items-center px-1 cursor-pointer select-none whitespace-nowrap"
        style={{ textDecoration: "none" }}
      >
        <span
          ref={clipRef}
          aria-hidden="true"
          style={{
            display: "inline-flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <span
            ref={baseRef}
            className="section-label"
            style={{ flexShrink: 0 }}
          >
            {label}
          </span>
          <span
            ref={accentRef}
            className="section-label"
            style={{ flexShrink: 0, color: "#C9A87C" }}
          >
            {label}
          </span>
        </span>
        <span className="sr-only">{label}</span>
      </a>
    </li>
  );
}

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const mobilePillRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLDivElement>(null);
  const bar1Ref = useRef<HTMLSpanElement>(null);
  const bar2Ref = useRef<HTMLSpanElement>(null);

  const initialized = useRef(false);
  const [scrolled, setScrolled] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAnimating = useRef(false);

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
    const onScroll = () => {
      const isScrolled = window.scrollY > 60;
      setScrolled(isScrolled);
      if (!isScrolled) setPinned(false);
    };
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
    if (window.innerWidth < 768) return;
    if (scrolled && pinned) return;

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
        left: "50%",
        xPercent: -50,
        duration: 0.5,
        ease: "power3.inOut",
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
        left: "50%",
        xPercent: -50,
        duration: 0.5,
        ease: "power3.inOut",
      });
    }
  }, [scrolled, pinned]);

  const handleBadgeClick = useCallback(() => {
    const nav = navRef.current;
    const links = linksRef.current;
    const cta = ctaRef.current;
    const badge = statusRef.current;
    if (!nav || !links || !cta || !badge) return;

    setPinned(true);

    const fromW = nav.getBoundingClientRect().width;
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
      duration: 0.2,
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
      left: "50%",
      xPercent: -50,
      duration: 0.45,
      ease: "power3.inOut",
    });
  }, []);

  const toggleMenu = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const pill = mobilePillRef.current;
    const linksEl = mobileLinksRef.current;
    const b1 = bar1Ref.current;
    const b2 = bar2Ref.current;
    if (!pill || !linksEl || !b1 || !b2) return;

    if (!menuOpen) {
      setMenuOpen(true);
      gsap.to(b1, { y: 4, rotation: 45, duration: 0.35, ease: "power3.inOut" });
      gsap.to(b2, {
        y: -4,
        rotation: -45,
        duration: 0.35,
        ease: "power3.inOut",
      });
      gsap.set(linksEl, { display: "flex", height: "auto", opacity: 1 });
      const fullH = linksEl.getBoundingClientRect().height;
      gsap.set(linksEl, { height: 0, opacity: 1 });
      gsap.to(linksEl, {
        height: fullH,
        duration: 0.5,
        ease: "expo.out",
        onComplete: () => {
          gsap.set(linksEl, { height: "auto" });
          isAnimating.current = false;
        },
      });
      gsap.fromTo(
        linksEl.querySelectorAll(".mobile-link"),
        { opacity: 0, y: -8 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.06,
          duration: 0.35,
          ease: "power2.out",
          delay: 0.15,
        },
      );
      gsap.fromTo(
        linksEl.querySelector(".mobile-cta"),
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.32, ease: "power2.out", delay: 0.38 },
      );
    } else {
      gsap.to(b1, { y: 0, rotation: 0, duration: 0.35, ease: "power3.inOut" });
      gsap.to(b2, { y: 0, rotation: 0, duration: 0.35, ease: "power3.inOut" });
      gsap.to(linksEl.querySelectorAll(".mobile-link, .mobile-cta"), {
        opacity: 0,
        y: -6,
        duration: 0.18,
        ease: "power2.in",
      });
      gsap.to(linksEl, {
        height: 0,
        duration: 0.38,
        ease: "power3.inOut",
        delay: 0.08,
        onComplete: () => {
          gsap.set(linksEl, { display: "none" });
          setMenuOpen(false);
          isAnimating.current = false;
        },
      });
    }
  }, [menuOpen]);

  const handleLinkClick = useCallback(() => {
    if (menuOpen) toggleMenu();
  }, [menuOpen, toggleMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      const pill = mobilePillRef.current;
      if (pill && !pill.contains(e.target as Node)) toggleMenu();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen, toggleMenu]);

  return (
    <>
      <nav
        ref={navRef}
        className={`hidden md:flex fixed top-5 left-1/2 -translate-x-1/2 z-9999 px-3 py-2
          items-center rounded-full transition-colors duration-500 ${
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
        <ul ref={linksRef} className="flex items-center gap-5 shrink-0">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.label} href={link.href} label={link.label} />
          ))}
        </ul>

        <div
          ref={statusRef}
          className="hidden items-center gap-2 shrink-0 cursor-pointer select-none px-2 py-1 rounded-full transition-all duration-200 hover:bg-ink/8 active:scale-95"
          onClick={handleBadgeClick}
          role="button"
          aria-label="Expand navigation"
          title="Click to show full menu"
        >
          <span className="font-mono text-xs tracking-widest text-ink/70 uppercase whitespace-nowrap">
            Available for Work
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className="opacity-30 ml-0.5"
          >
            <path
              d="M2 4l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <a
          ref={ctaRef}
          href="/Olagboye Seyi (0xdegend) Frontend Engineer Resume.pdf"
          target="_blank"
          className="inline-flex items-center gap-2 border rounded-2xl border-ink px-5 py-2
            text-xs tracking-widest uppercase font-mono shrink-0 whitespace-nowrap
            hover:bg-ink hover:text-cream transition-all duration-300"
        >
          Résumé
        </a>
      </nav>

      {/* ── Mobile nav ── */}
      <div className="md:hidden w-[80%] mx-auto fixed top-0 left-0 right-0 z-99999 px-5 pt-4">
        <div
          ref={mobilePillRef}
          className={`overflow-hidden rounded-4xl border border-muted transition-colors duration-500 ${
            scrolled || menuOpen
              ? "bg-cream/90 backdrop-blur-md"
              : "bg-cream/60 backdrop-blur-sm"
          }`}
        >
          <div className="flex items-center justify-between px-3 py-2">
            <a href="#" className="w-9 h-9 shrink-0">
              <Image
                src="/images/my-bosu-pfp.jpg"
                alt="Logo"
                width={36}
                height={36}
                className="rounded-full"
              />
            </a>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-ink/50">
                Available
              </span>
            </div>
            <button
              onClick={toggleMenu}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-muted/60 bg-ink/5 hover:bg-ink/10 transition-colors duration-200 relative shrink-0"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span
                ref={bar1Ref}
                className="block w-4 h-[1.5px] bg-[#0f0e0c] absolute"
                style={{
                  top: "calc(50% - 4px)",
                  left: "50%",
                  marginLeft: "-8px",
                  transformOrigin: "center",
                }}
              />
              <span
                ref={bar2Ref}
                className="block w-4 h-[1.5px] bg-[#0f0e0c] absolute"
                style={{
                  top: "calc(50% + 3px)",
                  left: "50%",
                  marginLeft: "-8px",
                  transformOrigin: "center",
                }}
              />
            </button>
          </div>

          <div
            ref={mobileLinksRef}
            className="hidden flex-col px-4 pb-4 gap-1"
            style={{ height: 0, overflow: "hidden" }}
          >
            <div className="h-px bg-muted/60 mb-2" />
            <ul className="flex flex-col">
              {NAV_LINKS.map((link, i) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={handleLinkClick}
                    className="mobile-link flex items-center justify-between py-3 border-b border-muted/40 last:border-0 group"
                  >
                    <span className="font-display text-xl font-light text-ink group-hover:text-accent transition-colors duration-200">
                      {link.label}
                    </span>
                    <span className="font-mono text-[0.55rem] tracking-[0.2em] text-stone/40">
                      0{i + 1}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="/Olagboye Seyi (0xdegend) Frontend Engineer Resume.pdf"
              target="_blank"
              onClick={handleLinkClick}
              className="mobile-cta mt-2 flex items-center justify-center gap-2 border border-ink rounded-xl px-5 py-2.5
                text-xs tracking-widest uppercase font-mono
                hover:bg-ink hover:text-cream transition-all duration-300"
            >
              Résumé ↗
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
