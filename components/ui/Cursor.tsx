"use client";
import { useEffect } from "react";
import { gsap } from "gsap";

export default function Cursor() {
  useEffect(() => {
    const cursor = document.querySelector(".cursor") as HTMLElement;
    const follower = document.querySelector(".cursor-follower") as HTMLElement;
    if (!cursor || !follower) return;

    // ✅ quickTo — one tween instance reused every mousemove
    const qCursorX = gsap.quickTo(cursor, "x", {
      duration: 0.08,
      ease: "none",
    });
    const qCursorY = gsap.quickTo(cursor, "y", {
      duration: 0.08,
      ease: "none",
    });
    const qFollowerX = gsap.quickTo(follower, "x", {
      duration: 0.35,
      ease: "power2.out",
    });
    const qFollowerY = gsap.quickTo(follower, "y", {
      duration: 0.35,
      ease: "power2.out",
    });

    const moveCursor = (e: MouseEvent) => {
      // cursor is 10px → offset by 5 to center it
      // follower is 36px → offset by 18 to center it
      qCursorX(e.clientX - 5);
      qCursorY(e.clientY - 5);
      qFollowerX(e.clientX - 18);
      qFollowerY(e.clientY - 18);
    };

    const onEnter = () => {
      gsap.to(cursor, { scale: 2.5, duration: 0.2, ease: "power2.out" });
      gsap.to(follower, {
        scale: 1.5,
        opacity: 0.15,
        duration: 0.2,
        ease: "power2.out",
      });
    };
    const onLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
      gsap.to(follower, {
        scale: 1,
        opacity: 0.4,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });
    };

    // ✅ Show cursor only after first mouse movement — no flash at top-left
    const onFirstMove = (e: MouseEvent) => {
      gsap.set(cursor, { x: e.clientX - 5, y: e.clientY - 5 });
      gsap.set(follower, { x: e.clientX - 18, y: e.clientY - 18 });
      window.removeEventListener("mousemove", onFirstMove);
    };
    window.addEventListener("mousemove", onFirstMove, { once: true });
    window.addEventListener("mousemove", moveCursor);

    const interactives = document.querySelectorAll("a, button");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor" />
      <div className="cursor-follower" />
    </>
  );
}
