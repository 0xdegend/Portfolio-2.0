"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const links = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Animate in on load
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: "power3.out" }
    );

    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 px-8 md:px-16 py-6 flex items-center justify-between transition-all duration-500 ${
        scrolled ? "bg-cream/80 backdrop-blur-md border-b border-muted" : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <a href="#" className="font-display text-xl font-light tracking-widest text-ink">
        YN<span className="text-accent">.</span>
      </a>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-10">
        {links.map((link) => (
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

      {/* CTA */}
      <a
        href="/resume.pdf"
        target="_blank"
        className="hidden md:inline-flex items-center gap-2 border border-ink px-5 py-2 text-xs tracking-widest uppercase font-mono hover:bg-ink hover:text-cream transition-all duration-300"
      >
        Résumé
      </a>
    </nav>
  );
}
