export function CursorBoxTailwind({
  initRef,
  initNumLabel,
  initArrow,
  initImageRef,
}: {
  initRef: (el: HTMLDivElement | null) => void;
  initNumLabel: (el: HTMLSpanElement | null) => void;
  initArrow: (el: HTMLSpanElement | null) => void;
  initImageRef: (el: HTMLImageElement | null) => void; // new
}) {
  return (
    <div
      ref={initRef}
      aria-hidden
      className="fixed left-0 top-0 pointer-events-none z-9999 w-48 h-12 transform-gpu"
      style={{
        transform: "translate3d(-9999px,-9999px,0)",
        opacity: 0,
        willChange: "transform, opacity, clip-path",
      }}
    >
      {/* Base glass / cream background */}
      {/* <div className="absolute inset-0 overflow-hidden bg-[#f5f2ee] backdrop-blur-md" /> */}

      {/* Content row */}
      <div className="relative z-10 flex items-center h-full px-0">
        {/* Number badge (left) */}
        {/* <div className="flex items-center justify-center h-full px-3 shrink-0">
          <span
            ref={initNumLabel}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[0.65rem] font-mono font-semibold"
          />
        </div> */}

        {/* IMAGE area (replaces the 'View project' text) */}
        <div className="flex items-center gap-3 px-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={initImageRef}
            src={"null"} // initially empty — hook will set src on show()
            alt="project preview"
            className="w-50 h-25 object-cover"
            style={{
              display: "block",
              objectFit: "cover",
              background: "rgba(0,0,0,0.06)",
            }}
          />

          {/* Arrow */}
          {/* <span
            ref={initArrow}
            className="inline-flex items-center justify-center w-6 h-6 text-sm"
            style={{
              color: "var(--accent)",
              transformOrigin: "center",
            }}
            aria-hidden
          >
            ↗
          </span> */}
        </div>

        {/* Decorative sparkle (subtle) */}
        <svg
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2l1.9 4.2L18 8l-4.1 1.7L12 14l-1.9-4.3L6 8l4.1-1.8L12 2z"
            fill="rgba(201,169,110,0.18)"
          />
        </svg>
      </div>
    </div>
  );
}
