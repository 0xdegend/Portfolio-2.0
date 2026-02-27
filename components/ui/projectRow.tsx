import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { projects } from "../utils/data/project";
type Project = (typeof projects)[number];

export function ProjectRow({
  project,
  index,
  onEnter,
  onLeave,
}: {
  project: Project;
  index: number;
  onEnter: (num?: string, imageSrc?: string) => void;
  onLeave: () => void;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  useGSAP(() => {}, { scope: rowRef });

  return (
    <div className="relative">
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
      >
        <div
          ref={rowRef}
          className="relative border-t border-muted py-8 grid grid-cols-12 gap-x-6 gap-y-4 items-start px-2 -mx-2"
          onMouseEnter={() => onEnter(project.number, project.image)}
          onMouseLeave={onLeave}
        >
          <div className="col-span-1 pt-1">
            <span
              ref={numRef}
              className="font-mono text-xs text-stone/40 inline-block"
            >
              {project.number}
            </span>
          </div>

          <div className="col-span-12 md:col-span-6">
            <div className="overflow-hidden mb-3">
              <h3
                ref={titleRef}
                className="font-display text-3xl md:text-4xl font-light text-ink"
              >
                {project.title}
              </h3>
            </div>
            <p className="proj-desc text-stone text-sm leading-relaxed font-light max-w-md">
              {project.description}
            </p>
          </div>

          <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
            <span className="proj-meta-item section-label text-stone/60">
              {project.category}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="proj-tech proj-meta-item font-mono text-xs px-2 py-0.5 border border-muted text-stone/70 rounded-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-2 flex md:flex-col md:items-end gap-4 md:gap-2 justify-between items-center">
            <span className="proj-meta-item font-mono text-xs text-stone/40">
              {project.year}
            </span>
            <span
              ref={arrowRef}
              className="text-ink text-xl inline-block"
              aria-hidden="true"
            >
              ↗
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}
