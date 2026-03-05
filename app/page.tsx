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

  useEffect(() => {
    startSim();
  }, [startSim]);

  return (
    <main className="noise bg-cream overflow-x-hidden">
      <>
        {!ready && (
          <Preloader progress={progress} onComplete={() => setReady(true)} />
        )}

        {/* Sections are mounted immediately so 3D scenes can load in background */}
        <div style={{ visibility: ready ? "visible" : "hidden" }}>
          {/* Pass registerTask down to each scene */}
          <Hero onSceneReady={() => registerTask("heroScene")} />
          <Cursor />
          <Nav />
          <About />
          <Projects />
          <Skills onSceneReady={() => registerTask("skillScene")} />
          <Contact />
          <Footer />
        </div>
      </>
    </main>
  );
}
