"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { nav, profile } from "@/content/site";
import { FadeIn } from "./ui/FadeIn";

// Background video (HLS stream from the design template). Replace with your own stream or an MP4 in /public.
const HERO_VIDEO = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

/** Cinematic landing section: HLS video background, centred serif headline, glass CTAs, minimal bottom bar. */
export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll-linked exit: as the hero leaves, the copy drifts up and fades, and the video
  // slowly pushes in and dims into the page background, so it hands over to the particles.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const copyBlur = useTransform(scrollYProgress, [0.1, 0.6], ["blur(0px)", "blur(8px)"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const barOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.autoplay = false;

    let destroy: (() => void) | undefined;
    let cancelled = false;
    // hls.js (loaded on demand) wherever Media Source Extensions exist; otherwise native HLS (iOS Safari).
    import("hls.js")
      .then(({ default: Hls }) => {
        if (cancelled) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ capLevelToPlayerSize: true });
          hls.loadSource(HERO_VIDEO);
          hls.attachMedia(video);
          destroy = () => hls.destroy();
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = HERO_VIDEO;
        }
      })
      .catch(() => {
        if (!cancelled && video.canPlayType("application/vnd.apple.mpegurl")) video.src = HERO_VIDEO;
      });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    // data-occlude: the particle layer pauses while this section fills the screen.
    // Background is the page colour (#0C0C0C), not pure black, so there's no seam below it.
    <section
      ref={sectionRef}
      id="top"
      data-occlude
      aria-label="Introduction"
      className="relative z-10 flex min-h-svh flex-col overflow-hidden px-6 text-center font-body text-white md:px-16 lg:px-24"
    >
      {/* The section itself is transparent and the video fades out through a mask (not an opaque overlay),
          so the particle layer behind can show through the lower half with no hard edge. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-0 origin-[50%_30%]"
        style={{
          ...(reduce ? {} : { scale: videoScale, opacity: videoOpacity }),
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 50%, rgba(0,0,0,0.55) 72%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 50%, rgba(0,0,0,0.55) 72%, transparent 100%)",
        }}
      >
        <video ref={videoRef} autoPlay loop muted playsInline className="h-full w-full object-cover" />
      </motion.div>
      {/* soft darkening behind the copy so text stays readable over bright frames */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "radial-gradient(ellipse 55% 40% at 50% 45%, rgba(0,0,0,0.5), rgba(0,0,0,0.12) 70%, transparent)" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[200px] bg-gradient-to-b from-[#0C0C0C] to-transparent" />

      <FadeIn
        as="nav"
        y={-20}
        className="relative z-10 -mx-6 flex justify-between px-6 pt-6 font-sans text-sm font-medium uppercase tracking-wider text-[#D7E2EA] md:-mx-16 md:px-10 md:pt-8 md:text-lg lg:-mx-24 lg:text-[1.4rem]"
      >
        {nav.map((n) => (
          <a key={n.href} href={n.href} className="transition-opacity duration-200 hover:opacity-70">
            {n.label}
          </a>
        ))}
      </FadeIn>

      <motion.div
        className="relative z-10 flex flex-1 flex-col items-center justify-center py-24"
        style={reduce ? undefined : { y: copyY, opacity: copyOpacity, filter: copyBlur }}
      >
        <FadeIn delay={0.1} y={20}>
          <p
            className="liquid-glass mb-7 inline-block rounded-full px-6 py-2.5 font-medium uppercase tracking-[0.32em] text-white/90 md:px-8 md:py-3"
            style={{ fontSize: "clamp(1rem, 2vw, 1.6rem)" }}
          >
            <span className="relative z-[2]">{profile.name}</span>
          </p>
        </FadeIn>
        <FadeIn
          as="h1"
          delay={0.2}
          y={30}
          className="mx-auto mb-5 max-w-4xl font-heading text-5xl italic leading-[0.85] tracking-tight text-white md:text-7xl lg:text-8xl"
        >
          Data Scientist &amp; Generative AI Engineer.
        </FadeIn>
        <FadeIn delay={0.35} y={20} className="mx-auto mb-9 max-w-xl text-sm font-light text-white/60 md:text-base">
          I build intelligent systems, AI&#8209;powered applications and scalable data engineering solutions.
        </FadeIn>
        <FadeIn delay={0.5} y={20} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <a
            href="#projects"
            className="liquid-glass-strong flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            Explore My Work
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </a>
          <a
            href={profile.cv}
            download
            className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Download Resume
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </FadeIn>
      </motion.div>

      <motion.div className="relative z-10" style={reduce ? undefined : { opacity: barOpacity }}>
      {/* hairline that fades out at both ends instead of a hard divider */}
      <div aria-hidden="true" className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <FadeIn
        delay={0.65}
        y={10}
        className="flex flex-col items-center justify-between gap-4 py-7 md:flex-row"
      >
        <p className="text-xs font-light text-white/40">Open to data science, ML and GenAI roles</p>
        <div className="flex items-center gap-6">
          {[
            { label: "GitHub", href: profile.github },
            { label: "LinkedIn", href: profile.linkedin },
            { label: "Email", href: `mailto:${profile.email}` },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-xs font-light text-white/40 transition-colors hover:text-white/70"
            >
              {l.label}
            </a>
          ))}
        </div>
      </FadeIn>
      </motion.div>
    </section>
  );
}
