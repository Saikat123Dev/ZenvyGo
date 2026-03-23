"use client";

import { useState, useEffect } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { m, useReducedMotion } from "framer-motion";

import { HOVER_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";

type InteractiveLinkProps = HTMLMotionProps<"a">;

export function InteractiveLink({
  children,
  className,
  ...props
}: InteractiveLinkProps) {
  const reduceMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device capability
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <m.a
      whileHover={reduceMotion || isTouchDevice ? undefined : { y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={HOVER_TRANSITION}
      className={cn(
        "group relative transform-gpu will-change-transform",
        "min-h-11", // Minimum 44px touch target
        isTouchDevice ? "active:scale-[0.98]" : "",
        className
      )}
      {...props}
    >
      {children}
    </m.a>
  );
}
