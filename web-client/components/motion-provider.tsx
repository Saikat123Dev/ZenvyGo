"use client";

import type { ReactNode } from "react";
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

export function MotionProvider({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.24,
  });

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-px origin-left bg-gradient-to-r from-cyan-300/0 via-cyan-300/85 to-fuchsia-400/85"
          style={{ scaleX: reduceMotion ? 0 : progress }}
        />
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
