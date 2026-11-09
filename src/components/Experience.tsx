"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Plus } from "lucide-react";
import { experience, type Experience as Job } from "@/content/site";
import { FadeIn } from "./ui/FadeIn";

const GRADIENT = "linear-gradient(180deg, #B600A8 0%, #7621B0 55%, #3d8bff 100%)";

function TimelineItem({
  job,
  index,
  active,
  reached,
  onActive,
}: {
  job: Job;
  index: number;
  active: boolean;
  reached: boolean;
  onActive: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const centred = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const hasDetails = Boolean(job.points?.length || job.stack?.length);
  const open = hasDetails && (hover || pinned);
  const panelId = `exp-${index}`;

  useEffect(() => {
    if (centred) onActive(index);
  }, [centred, index, onActive]);

  return (
    <li ref={ref} className="relative pb-8 pl-12 last:pb-0 sm:pb-10 sm:pl-16">
      {/* node */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-7 grid size-6 place-items-center rounded-full border-2 bg-white transition-all duration-500"
        style={{
          borderColor: reached ? "#7621B0" : "rgba(12,12,12,0.18)",
          boxShadow: active ? "0 0 0 6px rgba(182,0,168,0.12), 0 0 26px rgba(182,0,168,0.55)" : "none",
          transform: active ? "scale(1.15)" : "scale(1)",
        }}
      >
        <span
          className="size-2.5 rounded-full transition-all duration-500"
          style={{ background: reached ? GRADIENT : "rgba(12,12,12,0.2)", transform: active ? "scale(1.2)" : "scale(1)" }}
        />
      </span>

      <motion.div
        initial={reduce ? false : { opacity: 0, x: 40, clipPath: "inset(0% 0% 100% 0% round 28px)" }}
        whileInView={{ opacity: 1, x: 0, clipPath: "inset(0% 0% 0% 0% round 28px)" }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
        className={`rounded-[28px] border p-6 transition-[background-color,border-color,box-shadow] duration-500 sm:p-8 ${
          active || open
            ? "border-[#7621B0]/25 bg-white shadow-[0_30px_60px_-30px_rgba(118,33,176,0.35)]"
            : "border-black/[0.08] bg-[#f5f6f8]"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div>
            <p
              className="font-black uppercase leading-none tracking-tight"
              style={{
                fontSize: "clamp(1.5rem, 3.2vw, 2.5rem)",
                ...(active
                  ? { background: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }
                  : { color: "#0C0C0C" }),
              }}
            >
              {job.period ?? "Internship"}
            </p>
            <h3 className="mt-4 font-semibold uppercase tracking-wide" style={{ fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)" }}>
              {job.role}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[#0C0C0C]/60">
              <span>
                {job.company}
                {job.location && <span>, {job.location}</span>}
              </span>
              {job.period?.includes("Present") && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7621B0]/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest text-[#7621B0]">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#B600A8] opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-[#B600A8]" />
                  </span>
                  Current
                </span>
              )}
            </p>
            {job.summary && <p className="mt-3 max-w-xl font-light leading-relaxed text-[#0C0C0C]/70">{job.summary}</p>}
          </div>

          {hasDetails && (
            <button
              type="button"
              onClick={() => setPinned((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
              className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors hover:border-[#7621B0]/50 hover:text-[#7621B0]"
            >
              <Plus className={`size-3.5 transition-transform duration-300 ${open ? "rotate-45" : ""}`} aria-hidden="true" />
              {open ? "Less" : "Details"}
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-6">
                {job.points && (
                  <ul className="space-y-2.5 border-t border-black/[0.08] pt-6">
                    {job.points.map((p, i) => (
                      <motion.li
                        key={p}
                        initial={reduce ? false : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 * i + 0.1, duration: 0.4 }}
                        className="relative pl-6 font-light leading-relaxed text-[#0C0C0C]/75"
                      >
                        <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-[2px] w-3 rounded-full" style={{ background: GRADIENT }} />
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                )}
                {job.stack && (
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
                    {job.stack.map((s) => (
                      <li key={s} className="rounded-full bg-[#0C0C0C] px-3 py-1 text-xs text-white">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                {job.projects && (
                  <div className="mt-6 border-t border-black/[0.08] pt-5">
                    <p className="text-xs font-medium uppercase tracking-widest text-[#0C0C0C]/45">Selected projects</p>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {job.projects.map((p, i) => (
                        <motion.li
                          key={p}
                          initial={reduce ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + 0.04 * i, duration: 0.35 }}
                          className="flex items-center gap-2.5 rounded-xl border border-black/[0.08] bg-[#f5f6f8] px-3 py-2 text-sm text-[#0C0C0C]/80"
                        >
                          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ background: GRADIENT }} />
                          {p}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </li>
  );
}

/**
 * White editorial career timeline. `data-occlude` lets the particle layer
 * pause while this panel fills the screen.
 */
export function Experience() {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 60%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const total = experience.length;

  return (
    <div data-occlude className="relative z-10 rounded-t-[40px] bg-white text-[#0C0C0C] sm:rounded-t-[50px] md:rounded-t-[60px]">
      <section id="experience" aria-labelledby="experience-title" className="px-5 pb-36 pt-20 sm:px-8 sm:pb-44 sm:pt-28 md:px-10 md:pb-52">
        <FadeIn
          as="h2"
          y={40}
          className="mx-auto mb-12 max-w-6xl font-black uppercase leading-[0.9] tracking-tight sm:mb-16"
          style={{ fontSize: "clamp(3rem, 10.5vw, 150px)" }}
        >
          <span id="experience-title">Experience</span>
        </FadeIn>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <FadeIn delay={0.1} y={20} className="max-w-sm font-light leading-relaxed text-[#0C0C0C]/65">
              Roles across generative AI, data science and data engineering. Hover or open a role for the details.
            </FadeIn>

            <div className="mt-10 hidden items-end gap-4 lg:flex" aria-hidden="true">
              <span className="relative block h-[1em] overflow-hidden font-black leading-none" style={{ fontSize: "clamp(4rem, 7vw, 6.5rem)" }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="block"
                    style={{ background: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    {String(active + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </span>
              <div className="pb-2">
                <p className="text-sm font-medium tracking-widest text-[#0C0C0C]/40">/ {String(total).padStart(2, "0")}</p>
                <p className="mt-1 text-sm uppercase tracking-widest text-[#0C0C0C]/70">{experience[active].company}</p>
              </div>
            </div>
          </div>

          <ol ref={listRef} className="relative">
            {/* progress line: track + scroll-driven fill */}
            <span aria-hidden="true" className="absolute bottom-8 left-[11px] top-8 w-[2px] rounded-full bg-black/[0.08]" />
            <motion.span
              aria-hidden="true"
              className="absolute bottom-8 left-[11px] top-8 w-[2px] origin-top rounded-full"
              style={{ background: GRADIENT, scaleY: reduce ? 1 : fill }}
            />
            {experience.map((job, i) => (
              <TimelineItem
                key={`${job.company}-${job.role}`}
                job={job}
                index={i}
                active={active === i}
                reached={reduce || i <= active}
                onActive={setActive}
              />
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
