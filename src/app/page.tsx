import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Education } from "@/components/Education";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { ParticleBackground } from "@/components/particles/ParticleBackground";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { WhatIDo } from "@/components/WhatIDo";

export default function Home() {
  return (
    <div className="relative bg-[#0C0C0C]" style={{ overflowX: "clip" }}>
      <ParticleBackground />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <WhatIDo />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
    </div>
  );
}
