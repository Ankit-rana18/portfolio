"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { Capability } from "@/content/site";
import { CapabilityVisual } from "./Visuals";

/** Counts from 0 to `value` once, when it scrolls into view. */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const ctl = animate(0, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => ctl.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {shown.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

export function CapabilityCard({ cap, index }: { cap: Capability; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // 3D tilt + moving light, driven by motion values (no React re-renders while moving).
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), spring);
  const light = useTransform(
    [mx, my],
    ([x, y]: number[]) => `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(79,216,255,0.10), transparent 60%)`,
  );

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 70, rotateX: 12 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, delay: (index % 2) * 0.12 + Math.floor(index / 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200 }}
    >
      <motion.article
        ref={ref}
        tabIndex={0}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="cap-card group flex h-full min-h-[440px] flex-col overflow-hidden outline-none sm:min-h-[470px]"
      >
        {/* cursor light */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: light }}
        />

        <div className="relative flex items-start justify-between px-7 pt-7 sm:px-8 sm:pt-8" style={{ transform: "translateZ(30px)" }}>
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#D7E2EA]/45">{String(index + 1).padStart(2, "0")}</span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-widest text-[#D7E2EA]/55">
            {cap.stack.length} tools
          </span>
        </div>

        <div className="relative mx-4 mt-3 h-40 sm:mx-6 sm:h-44" style={{ transform: "translateZ(50px)" }}>
          <CapabilityVisual kind={cap.visual} />
        </div>

        <div className="relative mt-auto px-7 pb-7 sm:px-8 sm:pb-8" style={{ transform: "translateZ(40px)" }}>
          <div className="flex items-end gap-3">
            <p className="hero-heading font-black leading-none" style={{ fontSize: "clamp(2.6rem, 5vw, 3.6rem)" }}>
              <CountUp value={cap.metric.value} suffix={cap.metric.suffix} />
            </p>
            <p className="max-w-[180px] pb-1.5 text-xs leading-snug text-[#D7E2EA]/55">{cap.metric.label}</p>
          </div>

          <h3 className="mt-5 font-semibold uppercase tracking-wide text-[#D7E2EA]" style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)" }}>
            {cap.name}
          </h3>
          <p className="mt-2 max-w-md font-light leading-relaxed text-[#D7E2EA]/70">{cap.description}</p>

          {/* revealed on hover / focus; always visible on touch screens */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
            <ul className="flex min-h-0 flex-wrap gap-2 overflow-hidden" aria-label={`${cap.name} tools`}>
              {cap.stack.map((s, i) => (
                <li
                  key={s}
                  className="mt-5 translate-y-3 rounded-full border border-[#4fd8ff]/25 bg-[#4fd8ff]/[0.06] px-3 py-1 text-xs text-[#D7E2EA] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
                  style={{ transitionDelay: `${80 + i * 50}ms` }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
