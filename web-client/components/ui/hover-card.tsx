"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { m, useReducedMotion } from "framer-motion";

import { HOVER_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";

const motionElements = {
  article: m.article,
  aside: m.aside,
  div: m.div,
} as const;

type HoverCardElement = keyof typeof motionElements;

interface HoverCardProps {
  as?: HoverCardElement;
  children: ReactNode;
  className?: string;
  glowClassName?: string;
}

export function HoverCard({
  as = "div",
  children,
  className,
  glowClassName,
}: HoverCardProps) {
  const reduceMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const Component = motionElements[as];

  // Detect touch device capability
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <Component
      whileHover={reduceMotion || isTouchDevice ? undefined : { y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={HOVER_TRANSITION}
      onTapStart={isTouchDevice ? () => setIsPressed(true) : undefined}
      onTapCancel={isTouchDevice ? () => setIsPressed(false) : undefined}
      onTap={isTouchDevice ? () => setIsPressed(false) : undefined}
      className={cn(
        "group relative isolate overflow-hidden transform-gpu will-change-transform",
        isTouchDevice ? "active:scale-[0.98]" : "cursor-pointer",
        className,
      )}
    >
      <m.div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_56%)] opacity-0",
          glowClassName,
        )}
        animate={isTouchDevice && isPressed ? { opacity: 1 } : undefined}
        whileHover={reduceMotion || isTouchDevice ? undefined : { opacity: 1 }}
        transition={HOVER_TRANSITION}
      />
      {children}
    </Component>
  );
}
