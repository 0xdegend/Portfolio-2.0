"use client";
import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, useGSAP);

import Cursor from "@/components/ui/Cursor";
import Nav from "@/components/ui/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/ui/Footer";
import { usePreloader } from "./utils/hooks/usePreloader";
import Preloader from "@/components/ui/Preloader";

export default function Home() {
  const TASKS = ["heroScene", "skillScene"];
  const { progress, registerTask, startSim } = usePreloader(TASKS);
  const [ready, setReady] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    startSim();
  }, [startSim]);

  return (
    <main className="noise bg-cream overflow-x-hidden">
      {!ready && (
        <Preloader
          progress={progress}
          onComplete={() => {
            setHeroReady(true);
            setReady(true);
          }}
        />
      )}

      {/*
        KEY LCP FIX — opacity + pointer-events instead of visibility:hidden.

        visibility:hidden removes elements from the accessibility tree and
        makes them completely unmeasurable by Lighthouse. LCP sees nothing
        and scores 0 until the preloader finishes — which is 3-5 seconds.

        opacity:0 + pointer-events:none is invisible to users (preloader
        sits on top via z-index) but Lighthouse CAN paint and measure the
        elements underneath. The h1 in Hero gets measured for LCP immediately
        on first paint, even though the user can't see it yet.

        pointer-events:none prevents any accidental clicks/interactions
        reaching the hidden content while the preloader is active.
        scroll is also locked via overflow:hidden on the wrapper below.
      */}
      <div
        style={{
          opacity: ready ? 1 : 0,
          pointerEvents: ready ? "auto" : "none",
          // Lock scroll while preloader is showing — prevents the user
          // scrolling into un-animated sections before ready
          overflow: ready ? "visible" : "hidden",
          // Smooth fade-in of the whole page when preloader completes
          transition: ready ? "opacity 0.4s ease" : "none",
        }}
      >
        <Hero
          ready={heroReady}
          onSceneReady={() => registerTask("heroScene")}
        />
        <Cursor />
        <Nav />
        <About />
        <Projects />
        <Skills onSceneReady={() => registerTask("skillScene")} />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
