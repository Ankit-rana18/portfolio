"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue, type Variants } from "framer-motion";
import { profile, projects, type Project } from "@/content/site";
import { GitHubIcon } from "./Icons";
import { GhostButton } from "./ui/Buttons";
import { FadeIn } from "./ui/FadeIn";

const panel = "liquid-glass rounded-[40px] p-6 sm:rounded-[50px] sm:p-8 md:rounded-[60px]";
const glow = { background: "radial-gradient(80% 60% at 85% 0%, rgba(185,178,255,0.12), transparent 70%)" };
const EASE = [0.16, 1, 0.3, 1] as const;

// Entrance choreography, triggered once when a card scrolls into view.
const panelV: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, delay: 0.25 + i * 0.12, ease: EASE } }),
};
const charV: Variants = {
  hidden: { y: "110%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.7, delay: 0.1 + i * 0.025, ease: EASE } }),
};
const itemV: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: (i: number) => ({ opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.6 + i * 0.1, ease: EASE } }),
};
const chipV: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: (i: number) => ({ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 320, damping: 18, delay: 0.55 + i * 0.06 } }),
};

/**
 * Decorative project artwork, blended into the glass panel: screen-blended onto the dark
 * card, masked to dissolve toward the text corner, darkened under the copy, with a slow
 * scroll parallax and a soft brighten/zoom on card hover.
 */
function ProjectArt({ src, lowRes }: { src: string; lowRes?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const mask = "radial-gradient(ellipse 115% 95% at 78% 18%, #000 28%, rgba(0,0,0,0.55) 55%, transparent 82%)";

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.06] group-hover:opacity-90 ${lowRes ? "opacity-80" : "opacity-60"}`}
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      >
        <motion.img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute -inset-[10%] h-[120%] w-[120%] max-w-none object-cover"
          style={{
            y: reduce ? 0 : y,
            mixBlendMode: "screen",
            // small source images: soften so they don't pixelate, and lift them so they read on the dark glass
            filter: lowRes ? "blur(1.5px) saturate(1.45) brightness(1.55)" : "saturate(1.15)",
          }}
        />
      </div>
      {/* keeps the copy readable where it sits (bottom-left) */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(12,12,12,0.85) 0%, rgba(12,12,12,0.45) 40%, transparent 72%)" }}
      />
    </div>
  );
}

/** Digits flicker through random values, then settle on the real number. */
function ScrambleNumber({ value, play }: { value: string; play: boolean }) {
  const [text, setText] = useState(value);
  useEffect(() => {
    if (!play) return;
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      if (frame > 14) {
        setText(value);
        clearInterval(id);
      } else {
        setText(value.split("").map((c, i) => (frame > 8 + i * 3 ? c : String(Math.floor(Math.random() * 10)))).join(""));
      }
    }, 45);
    return () => clearInterval(id);
  }, [play, value]);
  return <>{text}</>;
}

function ProjectCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const [stacked, setStacked] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setStacked(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);
  const link = project.repo ?? project.demo ?? profile.github;
  const linkLabel = project.repo ? "Source code" : project.demo ? "Live project" : "GitHub";
  const cardRef = useRef<HTMLElement>(null);

  // Where the card pins. Normally 7rem + a small per-card offset (so earlier cards peek out above),
  // but if the card is taller than the space below that point, it pins higher (even partly above
  // the screen) so its whole height scrolls into view before it sticks.
  const [pinTop, setPinTop] = useState<number | null>(null);
  useEffect(() => {
    const card = cardRef.current;
    if (!stacked || !card) {
      setPinTop(null);
      return;
    }
    const measure = () => {
      const base = 112 + index * 18;
      const fit = window.innerHeight - card.offsetHeight - 24;
      setPinTop(Math.min(base, fit));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stacked, index]);
  const inView = useInView(cardRef, { once: true, margin: "-20% 0px" });
  const state = reduce || inView ? "show" : "hidden";
  const num = String(index + 1).padStart(2, "0");

  // Cursor-following border glow, via CSS variables (no re-renders).
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    // The stacking offset lives on the sticky wrapper (not as a relative shift on the card),
    // and the wrapper grows with tall cards, so the last card can never spill out of the section.
    // Stacking only from md up: on phones a card is taller than the screen, so pinning it would hide its lower half.
    <div
      className="relative mb-5 flex items-start justify-center md:sticky md:mb-0 md:min-h-[85vh] md:pb-6"
      style={stacked && pinTop !== null ? { top: pinTop } : undefined}
    >
      <motion.article
        ref={cardRef}
        initial={false}
        animate={state}
        onPointerMove={onMove}
        style={{ scale: reduce || !stacked ? 1 : scale, transformOrigin: "top center" }}
        className="group relative w-full max-w-6xl overflow-hidden rounded-[40px] border-2 border-[#D7E2EA]/70 bg-[#0C0C0C]/75 p-4 backdrop-blur-2xl backdrop-saturate-150 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
      >
        {/* border glow that follows the cursor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            padding: 2,
            background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), #4fd8ff, #B600A8 40%, transparent 70%)",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(500px circle at var(--mx, 50%) var(--my, 0%), rgba(79,216,255,0.07), transparent 60%)" }}
        />
        {/* one-off light sweep as the card arrives */}
        {!reduce && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 z-10 w-1/3 -skew-x-12"
            style={{ background: "linear-gradient(90deg, transparent, rgba(215,226,234,0.10), transparent)" }}
            initial={{ left: "-40%" }}
            animate={inView ? { left: "130%" } : { left: "-40%" }}
            transition={{ duration: 1.4, ease: "easeInOut", delay: 0.1 }}
          />
        )}

        <div className="relative flex flex-wrap items-end justify-between gap-4 px-2 pb-5 sm:px-4 md:pb-7">
          <div className="flex items-end gap-4 sm:gap-6">
            <span aria-hidden="true" className="hero-heading font-black tabular-nums leading-[0.8]" style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}>
              <ScrambleNumber value={num} play={!reduce && inView} />
            </span>
            <div className="pb-1">
              <motion.p variants={panelV} custom={-1} className="text-xs uppercase tracking-widest text-[#D7E2EA]/55 sm:text-sm">
                {project.categories.join(" / ")}
              </motion.p>
              <h3
                aria-label={project.title}
                className="mt-1 font-medium uppercase leading-tight text-[#D7E2EA]"
                style={{ fontSize: "clamp(1.2rem, 2.6vw, 2.4rem)" }}
              >
                {project.title.split(" ").map((word, w, words) => (
                  <span key={w} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    {word.split("").map((c, i) => (
                      <motion.span key={i} variants={charV} custom={w * 6 + i} className="inline-block">
                        {c}
                      </motion.span>
                    ))}
                    {w < words.length - 1 && " "}
                  </span>
                ))}
              </h3>
            </div>
          </div>
          <motion.div variants={panelV} custom={0}>
            <GhostButton href={link} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} on GitHub`}>
              <GitHubIcon className="size-4" /> {linkLabel}
            </GhostButton>
          </motion.div>
        </div>

        <div className="relative grid gap-3 md:grid-cols-[40%_1fr]">
          <div className="grid gap-3">
            <motion.div variants={panelV} custom={1} className={`${panel} flex items-end`} style={{ minHeight: "clamp(130px, 16vw, 230px)" }}>
              <div aria-hidden="true" className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" style={glow} />
              <p className="relative font-light leading-snug text-[#D7E2EA]" style={{ fontSize: "clamp(1rem, 1.7vw, 1.4rem)" }}>
                {project.tagline}
              </p>
            </motion.div>
            <motion.div variants={panelV} custom={2} className={`${panel} flex flex-col justify-end`} style={{ minHeight: "clamp(160px, 22vw, 340px)" }}>
              <p className="text-xs uppercase tracking-widest text-[#D7E2EA]/50">{project.stack.length ? "Built with" : "Area"}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {(project.stack.length ? project.stack : project.categories).map((s, i) => (
                  <motion.li
                    key={s}
                    variants={chipV}
                    custom={i}
                    className="rounded-full border border-[#D7E2EA]/30 px-4 py-1.5 text-sm text-[#D7E2EA] transition-colors hover:border-[#4fd8ff]/60 hover:bg-[#4fd8ff]/10"
                  >
                    {s}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div variants={panelV} custom={3} className={`${panel} flex min-h-[260px] flex-col justify-end md:min-h-0`}>
            {project.image ? (
              <ProjectArt src={project.image.src} lowRes={project.image.lowRes} />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{ background: "radial-gradient(70% 70% at 70% 20%, rgba(182,0,168,0.14), transparent 70%)" }}
              />
            )}
            {project.points && project.points.length > 0 ? (
              <ul className="relative z-[2] space-y-4">
                {project.points.map((p, i) => (
                  <motion.li
                    key={p}
                    variants={itemV}
                    custom={i}
                    className="flex gap-4 font-light leading-relaxed text-[#D7E2EA]/85"
                    style={{ fontSize: "clamp(0.95rem, 1.35vw, 1.2rem)" }}
                  >
                    <span className="hero-heading shrink-0 font-bold">{String(i + 1).padStart(2, "0")}</span>
                    {p}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p aria-hidden="true" className="hero-heading relative z-[2] font-black uppercase leading-[0.9] tracking-tight" style={{ fontSize: "clamp(2.4rem, 5.5vw, 5.5rem)" }}>
                {project.title}
              </p>
            )}
          </motion.div>
        </div>
      </motion.article>
    </div>
  );
}

export function Projects() {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start start", "end end"] });

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative z-20 -mt-10 rounded-t-[40px] px-4 pb-24 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-28 md:-mt-14 md:rounded-t-[60px] md:px-10"
      style={{
        // Solid at the top (over the white panel), then translucent so the particles show through.
        background: "linear-gradient(#0C0C0C 0, #0C0C0C 140px, rgba(12,12,12,0.55) 420px, rgba(12,12,12,0.55) 100%)",
      }}
    >
      <FadeIn
        as="h2"
        y={40}
        className="hero-heading mb-10 text-center font-black uppercase leading-none tracking-tight sm:mb-16"
        style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
      >
        <span id="projects-title">Projects</span>
      </FadeIn>

      <div ref={listRef}>
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} total={projects.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
