"use client";

import { useEffect, useRef } from "react";
import { skills } from "@/content/site";

type Tile = { name: string; group: string };

const tiles: Tile[] = skills.flatMap((g) => g.items.map((name) => ({ name, group: g.group })));
const half = Math.ceil(tiles.length / 2);
const rowA = tiles.slice(0, half);
const rowB = tiles.slice(half);

function SkillTile({ tile }: { tile: Tile }) {
  return (
    <div className="liquid-glass flex h-[120px] w-[200px] shrink-0 flex-col justify-between rounded-2xl p-4 sm:h-[150px] sm:w-[260px] sm:p-5">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(185,178,255,0.2), transparent 70%)" }}
      />
      <span className="relative z-[2] text-[11px] uppercase tracking-widest text-[#D7E2EA]/55">{tile.group}</span>
      <span className="hero-heading relative z-[2] text-2xl font-bold uppercase leading-[0.95] tracking-tight sm:text-[1.75rem]">{tile.name}</span>
    </div>
  );
}

/** Two rows of skill tiles that slide in opposite directions as the page scrolls. */
export function Marquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowARef = useRef<HTMLDivElement>(null);
  const rowBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      if (rowARef.current) rowARef.current.style.transform = `translateX(${offset - 200}px)`;
      if (rowBRef.current) rowBRef.current.style.transform = `translateX(${-(offset - 200)}px)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-label="Technical skills"
      className="relative z-10 flex flex-col gap-3 pb-10 pt-24 sm:pt-32 md:pt-40"
      style={{ overflowX: "clip" }}
    >
      <h2 className="sr-only">Technical skills</h2>
      <ul className="sr-only">
        {tiles.map((t) => (
          <li key={t.name}>
            {t.name} ({t.group})
          </li>
        ))}
      </ul>
      {[{ row: rowA, ref: rowARef, shift: "-ml-[60%]" }, { row: rowB, ref: rowBRef, shift: "-ml-[20%]" }].map(({ row, ref, shift }, i) => (
        <div key={i} ref={ref} aria-hidden="true" className={`flex w-max gap-3 ${shift}`} style={{ willChange: "transform" }}>
          {[...row, ...row, ...row].map((t, j) => (
            <SkillTile key={`${t.name}-${j}`} tile={t} />
          ))}
        </div>
      ))}
    </section>
  );
}
