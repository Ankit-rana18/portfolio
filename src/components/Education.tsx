import { BadgeCheck } from "lucide-react";
import { certifications, education } from "@/content/site";
import { FadeIn } from "./ui/FadeIn";

export function Education() {
  return (
    <section id="education" aria-labelledby="education-title" className="relative z-10 px-5 py-24 sm:px-8 sm:py-32 md:px-10">
      <FadeIn
        as="h2"
        y={40}
        className="hero-heading mb-14 text-center font-black uppercase leading-none tracking-tight sm:mb-20"
        style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
      >
        <span id="education-title">Education</span>
      </FadeIn>

      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
        {education.map((e, i) => (
          <FadeIn
            key={e.degree}
            delay={i * 0.12}
            className="liquid-glass flex flex-col justify-between gap-10 rounded-[40px] p-8 sm:rounded-[50px] sm:p-10"
          >
            <div className="relative z-[2]">
              <h3 className="font-medium uppercase text-[#D7E2EA]" style={{ fontSize: "clamp(1.2rem, 2.2vw, 2rem)" }}>
                {e.degree}
              </h3>
              <p className="mt-2 font-light text-[#D7E2EA]/65">{e.school}</p>
            </div>
            <p className="hero-heading relative z-[2] font-black leading-none" style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
              {e.score.replace("CGPA ", "").replace(" / 10", "")}
              <span className="ml-2 align-top text-base font-medium tracking-widest text-[#D7E2EA]/50">CGPA / 10</span>
            </p>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.2} className="mx-auto mt-14 max-w-5xl">
        <h3 className="text-sm uppercase tracking-widest text-[#D7E2EA]/55">Certifications</h3>
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {certifications.map((c) => (
            <li key={c} className="liquid-glass flex items-start gap-3 rounded-3xl p-5 font-light text-[#D7E2EA]">
              <BadgeCheck className="relative z-[2] mt-0.5 size-5 shrink-0 text-[#b9b2ff]" aria-hidden="true" />
              <span className="relative z-[2]">{c}</span>
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  );
}
