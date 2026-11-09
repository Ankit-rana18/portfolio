import { whatIDo } from "@/content/site";
import { CapabilityCard } from "./capabilities/CapabilityCard";
import { FadeIn } from "./ui/FadeIn";

/** Dark, experimental capability showcase. Particles stay visible behind it. */
export function WhatIDo() {
  return (
    <section id="services" aria-labelledby="services-title" className="relative z-10 px-5 py-24 sm:px-8 sm:py-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 grid gap-6 sm:mb-20 md:grid-cols-[1.2fr_1fr] md:items-end">
          <FadeIn
            as="h2"
            y={40}
            className="hero-heading font-black uppercase leading-[0.9] tracking-tight"
            style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}
          >
            <span id="services-title">What I do</span>
          </FadeIn>
          <FadeIn delay={0.15} y={20} className="max-w-md font-light leading-relaxed text-[#D7E2EA]/70 md:justify-self-end md:pb-4">
            Four areas I work across, from LLM applications to the data platforms underneath them. Hover a card to see the tools.
          </FadeIn>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {whatIDo.map((cap, i) => (
            <CapabilityCard key={cap.name} cap={cap} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
