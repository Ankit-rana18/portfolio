"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** Fades + slides its content in once when it enters the viewport. */
export function FadeIn({ as = "div", delay = 0, duration = 0.7, x = 0, y = 30, className, style, children }: Props) {
  const reduce = useReducedMotion();
  const Comp = useMemo(() => motion.create(as as "div"), [as]);
  return (
    <Comp
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </Comp>
  );
}
