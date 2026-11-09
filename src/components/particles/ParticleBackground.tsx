"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";

// Three.js + GSAP load in their own chunk, only in the browser.
const ParticleSculpture = dynamic(() => import("./ParticleSculpture"), { ssr: false });

/** Fixed, full-screen particle layer that sits behind every section of the page. */
export function ParticleBackground() {
  const [ready, setReady] = useState(false);
  // Fade the whole layer in while the video hero scrolls away (25% → 85% of a screen),
  // so the video dissolves into the particles instead of cutting.
  const [vh, setVh] = useState(800);
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const { scrollY } = useScroll();
  const layerOpacity = useTransform(scrollY, (y) => Math.min(1, Math.max(0, (y - vh * 0.25) / (vh * 0.6))));

  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" style={{ opacity: layerOpacity }}>
      {/* volumetric cyan/violet backlights (also what shows if WebGL is unavailable) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(30% 40% at 50% 34%, rgba(64,200,255,0.10), transparent 70%), radial-gradient(48% 50% at 50% 72%, rgba(130,90,255,0.12), transparent 72%), radial-gradient(80% 60% at 50% 110%, rgba(40,120,255,0.08), transparent 70%)",
        }}
      />
      <ParticleSculpture
        // The video hero covers the top of the page, so the particles start as the flow sphere.
        // (The personal portrait is still available: use form "portrait" anywhere to bring it back.)
        initial="sphere"
        formations={[
          { trigger: "#services", form: "terrain" },
          { trigger: "#projects", form: "galaxy" },
          { trigger: "#contact", form: "sphere" },
        ]}
        occluders="[data-occlude]"
        onReady={() => setReady(true)}
        className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(12,12,12,0.8) 100%)" }}
      />
    </motion.div>
  );
}
