"use client";

import type { ReactNode } from "react";
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

import { pageVariants } from "@/lib/motion";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const ambientYRaw = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const ambientScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const ambientY = useSpring(ambientYRaw, {
    stiffness: 110,
    damping: 24,
    mass: 0.35,
  });

  return (
    <m.main
      id="content"
      className="relative overflow-x-clip"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[30rem] w-[62rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,rgba(34,211,238,0.08)_28%,rgba(232,121,249,0.04)_52%,transparent_74%)] blur-3xl"
        style={reduceMotion ? undefined : { y: ambientY, scale: ambientScale }}
      />
      {children}
    </m.main>
  );
}
