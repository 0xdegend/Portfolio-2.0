"use client";
import { useEffect } from "react";
import { gsap } from "gsap";

export default function Cursor() {
  useEffect(() => {
    const cursor = document.querySelector(".cursor") as HTMLElement;
    const follower = document.querySelector(".cursor-follower") as HTMLElement;
    if (!cursor || !follower) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.set(cursor, { x: e.clientX - 5, y: e.clientY - 5 });
      gsap.to(follower, { x: e.clientX - 18, y: e.clientY - 18, duration: 0.35 });
    };

    const onEnter = () => {
      gsap.to(cursor, { scale: 2.5, duration: 0.2 });
      gsap.to(follower, { scale: 1.5, opacity: 0.15, duration: 0.2 });
    };
    const onLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2 });
      gsap.to(follower, { scale: 1, opacity: 0.4, duration: 0.2 });
    };

    window.addEventListener("mousemove", moveCursor);
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  return (
    <>
      <div className="cursor" />
      <div className="cursor-follower" />
    </>
  );
}
