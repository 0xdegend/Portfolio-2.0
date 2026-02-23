"use client";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useGSAP(
    () => {
      gsap.fromTo(
        ".contact-el",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // TODO: Replace with your form endpoint (e.g. Resend, Formspree, or a Next.js API route)
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("sent");
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-32 px-8 md:px-16 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-6 mb-20">
        <span className="section-label">04 — Contact</span>
        <div className="flex-1 rule-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
        {/* Left — CTA text */}
        <div>
          <h2 className="contact-el font-display text-5xl md:text-6xl font-light leading-tight mb-8">
            Let&apos;s build something{" "}
            <em className="text-stone">worth remembering</em>
            <span className="text-accent">.</span>
          </h2>
          <p className="contact-el text-stone font-light leading-relaxed mb-10">
            I&apos;m currently open to new projects and full-time opportunities.
            Whether it&apos;s a quick chat or a full brief, drop me a message
            and I&apos;ll get back to you within 24 hours.
          </p>

          {/* Social links */}
          <div className="contact-el flex flex-col gap-3">
            {[
              { label: "GitHub", href: "https://github.com/yourusername" },
              { label: "LinkedIn", href: "https://linkedin.com/in/yourname" },
              { label: "Twitter / X", href: "https://twitter.com/yourhandle" },
              {
                label: "hello@yoursite.com",
                href: "mailto:hello@yoursite.com",
              },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-sm text-stone hover:text-ink transition-colors duration-300"
              >
                <span className="w-8 h-px bg-stone/30 group-hover:w-12 group-hover:bg-accent transition-all duration-300" />
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="contact-el">
          {status === "sent" ? (
            <div className="h-full flex flex-col items-start justify-center">
              <div className="font-display text-4xl font-light mb-3">
                Message sent<span className="text-accent">.</span>
              </div>
              <p className="text-stone font-light">
                I&apos;ll be in touch soon — thank you.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {[
                {
                  id: "name",
                  label: "Your name",
                  type: "text",
                  value: form.name,
                },
                {
                  id: "email",
                  label: "Email address",
                  type: "email",
                  value: form.email,
                },
              ].map((field) => (
                <div key={field.id} className="relative">
                  <input
                    id={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={(e) =>
                      setForm({ ...form, [field.id]: e.target.value })
                    }
                    required
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-muted py-3 text-ink font-light outline-none focus:border-accent transition-colors duration-300 placeholder-transparent"
                  />
                  <label
                    htmlFor={field.id}
                    className="absolute top-3 left-0 text-stone text-sm transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs pointer-events-none"
                  >
                    {field.label}
                  </label>
                </div>
              ))}
              <div className="relative">
                <textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                  placeholder=" "
                  className="peer w-full bg-transparent border-b border-muted py-3 text-ink font-light outline-none focus:border-accent transition-colors duration-300 resize-none placeholder-transparent"
                />
                <label
                  htmlFor="message"
                  className="absolute top-3 left-0 text-stone text-sm transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs pointer-events-none"
                >
                  Your message
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="self-start mt-2 border border-ink px-8 py-3 text-xs tracking-widest uppercase font-mono hover:bg-ink hover:text-cream transition-all duration-300 disabled:opacity-40"
              >
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
