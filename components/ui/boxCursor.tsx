"use client";
import { useRef } from "react";

export function CursorBoxTailwind({
  initRef,
}: {
  initRef: (el: HTMLDivElement | null) => void;
  initNumLabel: (el: HTMLSpanElement | null) => void;
  initArrow: (el: HTMLSpanElement | null) => void;
  initImageRef: (el: HTMLImageElement | null) => void;
}) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={initRef}
      aria-hidden
      className="fixed left-0 top-0 pointer-events-none z-[9999]"
      style={{
        transform: "translate3d(-9999px,-9999px,0)",
        opacity: 0,
        willChange: "transform, opacity",
        perspective: "600px",
      }}
    >
      {/* Outer card — perspective container */}
      <div
        ref={innerRef}
        data-cursor-inner
        className="relative overflow-hidden rounded-xl shadow-2xl"
        style={{
          width: 200,
          height: 130,
          transformStyle: "preserve-3d",
          willChange: "transform",
          background: "rgba(0,0,0,0.04)",
          cursor: "pointer",
        }}
      >
        {/* Two image slots — current and incoming */}
        <img
          data-cursor-img-a
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ backfaceVisibility: "hidden" }}
        />
        <img
          data-cursor-img-b
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0, backfaceVisibility: "hidden" }}
        />

        {/* Subtle gloss overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 60%)",
          }}
        />
      </div>
    </div>
  );
}
