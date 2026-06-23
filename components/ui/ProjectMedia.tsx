"use client";
import type { Project } from "../../app/utils/data/project";

/**
 * Renders a project's media. If the project has a `video` it plays a muted,
 * looping clip (with the still image as its poster); otherwise it falls back
 * to the static image. Drop a 2–3s mp4/webm into each project's `video` field
 * and this upgrades automatically — no layout changes needed.
 */
export function ProjectMedia({
  project,
  className,
  eager = false,
}: {
  project: Project;
  className?: string;
  eager?: boolean;
}) {
  if (project.video) {
    return (
      <video
        className={className}
        poster={project.image}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        aria-label={project.title}
      >
        <source
          src={project.video}
          type={project.video.endsWith(".webm") ? "video/webm" : "video/mp4"}
        />
      </video>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={project.image}
      alt={project.title}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
