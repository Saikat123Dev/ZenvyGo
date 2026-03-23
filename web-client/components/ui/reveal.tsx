"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { m, useReducedMotion } from "framer-motion";

import { revealVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps extends ComponentPropsWithoutRef<typeof m.div> {
  children: ReactNode;
  delay?: number;
  y?: number;
  scale?: number;
}

const defaultViewport = { once: true, amount: 0.24 } as const;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  scale = 0.985,
  viewport = defaultViewport,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      variants={revealVariants}
      custom={{ delay, y, scale, reduceMotion }}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className={cn("transform-gpu will-change-transform", className)}
      {...props}
    >
      {children}
    </m.div>
  );
}
