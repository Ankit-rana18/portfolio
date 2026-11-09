"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

function Char({ char, range, progress }: { char: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span className="relative">
      <span className="invisible">{char}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>
        {char}
      </motion.span>
    </span>
  );
}

/** Each character brightens from 20% to full opacity as the paragraph scrolls through view. */
export function AnimatedText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });

  if (reduce) {
    return (
      <p ref={ref} className={className} style={style}>
        {text}
      </p>
    );
  }

  const words = text.split(" ");
  const total = text.length;
  let index = 0;

  return (
    <p ref={ref} className={className} style={style} aria-label={text}>
      {words.map((word, w) => {
        const chars = word.split("").map((c) => {
          const start = index / total;
          index += 1;
          return <Char key={index} char={c} range={[start, start + 1 / total]} progress={scrollYProgress} />;
        });
        index += 1; // the space
        return (
          <span key={w} aria-hidden="true" className="inline-block whitespace-nowrap">
            {chars}
            {w < words.length - 1 && " "}
          </span>
        );
      })}
    </p>
  );
}
