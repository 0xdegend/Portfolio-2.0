"use client";
import React, { useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ProjectMedia } from "./ProjectMedia";
import type { Project } from "../../app/utils/data/project";

const REST_SHADOW = "0 1px 4px -1px rgba(15,14,12,0.08)";
const HOVER_SHADOW = "0 22px 44px -18px rgba(15,14,12,0.25)";
const TRUNCATE_AT = 140; // show "more" toggle past this many chars

/**
 * A bento tile that frames the asset: screenshot in a fixed-aspect media area,
 * caption (title, meta, description, tech) auto-sizes below — so nothing is
 * ever clipped. Long descriptions collapse to a couple of lines with a
 * "more / less" toggle. Restrained hover: a soft lift + gentle media zoom.
 *
 * Variants:
 *  - default: vertical (media on top, caption below)
 *  - large:   vertical with a taller media + 3-line description
 *  - wide:    horizontal on lg (caption left, media right) for full-width banner
 */
export function BentoCard({
  project,
  className = "",
  large = false,
  wide = false,
}: {
  project: Project;
  className?: string;
  large?: boolean;
  wide?: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const handleEnter = useCallback(() => {
    if (reduced) return;
    gsap.to(cardRef.current, {
      y: -5,
      boxShadow: HOVER_SHADOW,
      duration: 0.4,
      ease: "power3.out",
    });
    gsap.to(mediaRef.current, { scale: 1.05, duration: 0.6, ease: "power3.out" });
    gsap.to(arrowRef.current, { x: 3, y: -3, duration: 0.35, ease: "power2.out" });
  }, [reduced]);

  const handleLeave = useCallback(() => {
    if (reduced) return;
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: REST_SHADOW,
      duration: 0.5,
      ease: "power3.out",
    });
    gsap.to(mediaRef.current, { scale: 1, duration: 0.6, ease: "power3.out" });
    gsap.to(arrowRef.current, { x: 0, y: 0, duration: 0.35, ease: "power2.out" });
  }, [reduced]);

  const onToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((v) => !v);
  }, []);

  const needsTruncation = project.description.length > TRUNCATE_AT;
  const clampClass = wide || large ? "line-clamp-3" : "line-clamp-2";

  const caption = (
    <div
      className={`flex flex-col ${
        wide ? "lg:w-[42%] justify-center p-6 lg:p-8" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h4
          className={`font-display font-light text-ink leading-tight ${
            large || wide ? "text-3xl lg:text-4xl" : "text-2xl"
          }`}
        >
          {project.title}
        </h4>
        <span
          ref={arrowRef}
          aria-hidden="true"
          className="text-stone text-xl shrink-0 mt-1"
        >
          ↗
        </span>
      </div>

      <span className="section-label block mt-2 text-stone/70">
        {project.category} · {project.year}
      </span>

      <p
        className={`text-stone text-sm leading-relaxed font-light mt-3 ${
          expanded ? "" : clampClass
        } ${wide ? "max-w-md" : ""}`}
      >
        {project.description}
      </p>

      {needsTruncation && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="self-start mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-accent hover:text-ink transition-colors cursor-pointer"
        >
          {expanded ? "— Less" : "↓ More"}
        </button>
      )}

      <div className="flex flex-wrap gap-1.5 mt-4">
        {project.tech.map((t) => (
          <span
            key={t}
            className="font-mono text-[0.65rem] px-2 py-0.5 border border-muted text-stone/70 rounded-sm"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );

  const media = (
    <div
      className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#efe9e1] to-[#e7dfd3] ${
        wide
          ? "aspect-[16/10] lg:aspect-auto lg:flex-1 p-5 lg:p-7"
          : large
            ? "aspect-[16/9] lg:aspect-auto lg:flex-1 lg:min-h-[260px] p-5 lg:p-7"
            : "aspect-[16/10] p-4"
      }`}
    >
      <div
        ref={mediaRef}
        className="w-full h-full flex items-center justify-center will-change-transform"
      >
        <ProjectMedia
          project={project}
          className="max-w-full max-h-full w-auto h-auto object-contain rounded-md shadow-[0_12px_30px_-14px_rgba(15,14,12,0.45)]"
        />
      </div>
      <span className="absolute top-3 left-3 font-mono text-[0.65rem] tracking-widest px-2 py-0.5 rounded-full bg-ink/75 text-cream/90 backdrop-blur-sm">
        {project.number}
      </span>
    </div>
  );

  return (
    <a
      ref={cardRef}
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      aria-label={`${project.title} — ${project.category}`}
      className={`bento-card group flex overflow-hidden rounded-2xl bg-white ${
        wide ? "flex-col lg:flex-row" : "flex-col"
      } ${className}`}
      style={{ boxShadow: REST_SHADOW, willChange: "transform" }}
    >
      {wide ? (
        <>
          {caption}
          {media}
        </>
      ) : (
        <>
          {media}
          {caption}
        </>
      )}
    </a>
  );
}
