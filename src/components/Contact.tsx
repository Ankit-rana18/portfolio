"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { profile } from "@/content/site";
import { GitHubIcon, LinkedInIcon } from "./Icons";
import { ContactButton, GhostButton } from "./ui/Buttons";
import { FadeIn } from "./ui/FadeIn";
import { Magnet } from "./ui/Magnet";

/** Closing screen. The particle cloud re-forms into the bust behind it. */
export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative z-10 flex min-h-svh flex-col" style={{ overflowX: "clip" }}>
      <div className="overflow-hidden pt-16 sm:pt-20">
        <FadeIn
          as="h2"
          y={40}
          className="hero-heading w-full whitespace-nowrap text-center text-[13vw] font-black uppercase leading-none tracking-tight"
        >
          <span id="contact-title">Let&apos;s talk</span>
        </FadeIn>
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-8 px-6 pb-10 md:flex-row md:items-end md:justify-between md:px-10">
        <FadeIn delay={0.2} y={20} className="max-w-sm">
          <p className="font-light uppercase leading-snug tracking-wide text-[#D7E2EA]" style={{ fontSize: "clamp(0.85rem, 1.4vw, 1.3rem)" }}>
            Open to data science, machine learning and generative AI roles. Email is the quickest way to reach me.
          </p>
          <button
            type="button"
            onClick={copy}
            className="liquid-glass mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-[#D7E2EA]/85 transition-colors hover:bg-white/10"
          >
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
            {copied ? "Email copied" : profile.email}
          </button>
          <span aria-live="polite" className="sr-only">
            {copied ? "Email address copied to clipboard" : ""}
          </span>
        </FadeIn>

        <FadeIn delay={0.35} y={20} className="flex flex-wrap items-center gap-3 md:justify-end">
          <GhostButton href={profile.github} target="_blank" rel="noopener noreferrer">
            <GitHubIcon className="size-4" /> GitHub
          </GhostButton>
          <GhostButton href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            <LinkedInIcon className="size-4" /> LinkedIn
          </GhostButton>
          <GhostButton href={profile.cv} download>
            <Download className="size-4" aria-hidden="true" /> Resume
          </GhostButton>
          <Magnet padding={150} strength={3}>
            <ContactButton href={`mailto:${profile.email}`}>Email me</ContactButton>
          </Magnet>
        </FadeIn>
      </div>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-white/10 px-6 py-6 text-xs uppercase tracking-widest text-[#D7E2EA]/45 md:px-10">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Click anywhere to send a ripple through the particles</span>
        <a href="#top" className="transition-opacity hover:opacity-70">
          Back to top
        </a>
      </footer>
    </section>
  );
}
