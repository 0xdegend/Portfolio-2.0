import { useRef } from "react";

interface traitPillProps {
  label?: string;
  className?: string;
}
export function TraitPill({ label, className }: traitPillProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const onEnter = () =>
    gsap.to(ref.current, {
      scale: 1.07,
      borderColor: "var(--accent)",
      color: "var(--accent)",
      duration: 0.2,
      ease: "power2.out",
    });
  const onLeave = () =>
    gsap.to(ref.current, {
      scale: 1,
      borderColor: "",
      color: "",
      duration: 0.45,
      ease: "elastic.out(1, 0.4)",
    });
  return (
    <span
      ref={ref}
      className="trait-pill inline-flex items-center gap-2 border border-muted px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.18em] uppercase text-stone cursor-default"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span
        className={`w-1 h-1 rounded-full bg-accent/50 shrink-0 ${className}`}
      />
      {label}
    </span>
  );
}
