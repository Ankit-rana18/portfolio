import { about } from "@/content/site";
import { AnimatedText } from "./ui/AnimatedText";
import { ContactButton } from "./ui/Buttons";
import { FadeIn } from "./ui/FadeIn";
import { Magnet } from "./ui/Magnet";

const facts = [
  ...about.facts,
  { label: "Experience", value: "1+ year across enterprise and startup teams" },
];

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="liquid-glass h-full rounded-3xl p-5 text-left">
      <p className="relative z-[2] text-xs uppercase tracking-widest text-[#D7E2EA]/55">{label}</p>
      <p className="relative z-[2] mt-1.5 text-[15px] leading-snug text-[#D7E2EA]">{value}</p>
    </div>
  );
}

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-20 sm:px-8 md:px-10"
    >
      <div className="flex w-full flex-col items-center gap-14 sm:gap-16 md:gap-20">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <FadeIn
            as="h2"
            y={40}
            className="hero-heading text-center font-black uppercase leading-none tracking-tight"
            style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
          >
            <span id="about-title">About me</span>
          </FadeIn>
          <AnimatedText
            text={about.statement}
            className="max-w-[560px] text-center font-medium leading-relaxed text-[#D7E2EA]"
            style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
          />
        </div>

        <Magnet padding={120} strength={3}>
          <ContactButton href="#contact" />
        </Magnet>

        {/* Fact cards sit in their own row (they used to be pinned to the corners and could
            collide with the heading on mid-size screens). */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f, i) => (
            <FadeIn key={f.label} delay={0.08 * i} x={i % 2 ? 60 : -60} y={0} duration={0.9} className="h-full">
              <FactCard {...f} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
