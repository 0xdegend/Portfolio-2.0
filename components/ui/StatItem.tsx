import { useRef } from "react";
export function StatItem({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onEnter = () => {
    gsap.to(ref.current, { y: -5, duration: 0.22, ease: "power2.out" });
    gsap.to(ref.current!.querySelector(".sv"), {
      color: "var(--accent)",
      duration: 0.18,
    });
  };
  const onLeave = () => {
    gsap.to(ref.current, { y: 0, duration: 0.55, ease: "elastic.out(1, 0.4)" });
    gsap.to(ref.current!.querySelector(".sv"), {
      color: "var(--ink)",
      duration: 0.3,
    });
  };
  return (
    <div
      ref={ref}
      className="stat-item cursor-default"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="sv font-display text-4xl md:text-5xl font-light text-ink mb-1">
        {value}
      </div>
      <div className="section-label text-stone/70">{label}</div>
    </div>
  );
}
