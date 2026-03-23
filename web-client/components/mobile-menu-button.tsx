"use client";

import { m, useReducedMotion } from "framer-motion";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      className="relative z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10 active:scale-95 md:hidden"
    >
      <div className="flex h-5 w-5 flex-col items-center justify-center gap-1">
        <m.span
          className="h-0.5 w-5 rounded-full bg-white"
          animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        />
        <m.span
          className="h-0.5 w-5 rounded-full bg-white"
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        />
        <m.span
          className="h-0.5 w-5 rounded-full bg-white"
          animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        />
      </div>
    </button>
  );
}
