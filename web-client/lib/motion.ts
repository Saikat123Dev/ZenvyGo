import type { Transition, Variants } from "framer-motion";

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const PAGE_TRANSITION: Transition = {
  duration: 0.55,
  ease: EASE_OUT,
};

export const HOVER_TRANSITION: Transition = {
  duration: 0.28,
  ease: EASE_OUT,
};

export const pageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: PAGE_TRANSITION,
  },
};

export interface RevealCustom {
  delay: number;
  y: number;
  scale: number;
  reduceMotion: boolean;
}

export const revealVariants: Variants = {
  hidden: ({ reduceMotion, scale, y }: RevealCustom) =>
    reduceMotion
      ? {
          opacity: 1,
          scale: 1,
          y: 0,
        }
      : {
          opacity: 0,
          scale,
          y,
        },
  visible: ({ delay, reduceMotion }: RevealCustom) =>
    reduceMotion
      ? {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: 0 },
        }
      : {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            duration: 0.64,
            delay,
            ease: EASE_OUT,
          },
        },
};
