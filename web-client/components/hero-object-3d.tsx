"use client";

import { useEffect, useState } from "react";
import type { Variants } from "framer-motion";
import { m, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { BellRing, QrCode, ShieldCheck } from "lucide-react";

import { EASE_OUT } from "@/lib/motion";

const heroShellVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 28,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: EASE_OUT,
      delayChildren: 0.08,
      staggerChildren: 0.08,
    },
  },
};

const heroLayerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.48,
      ease: EASE_OUT,
    },
  },
};

export function HeroObject3D() {
  const reduceMotion = useReducedMotion();
  const rotateX = useMotionValue(16);
  const rotateY = useMotionValue(-18);
  const springX = useSpring(rotateX, { stiffness: 120, damping: 18, mass: 0.5 });
  const springY = useSpring(rotateY, { stiffness: 120, damping: 18, mass: 0.5 });
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");

    const sync = () => setInteractive(mediaQuery.matches && !reduceMotion);

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, [reduceMotion]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!interactive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    rotateX.set(14 - y * 20);
    rotateY.set(-16 + x * 30);
  }

  function handlePointerLeave() {
    rotateX.set(16);
    rotateY.set(-18);
  }

  return (
    <div
      aria-hidden="true"
      className="hero-stage relative aspect-[1.03] min-h-[460px] w-full scale-75 overflow-hidden rounded-[34px] border border-white/[0.08] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.88)_0%,rgba(3,7,18,0.92)_100%)] p-6 sm:scale-90 sm:p-8 lg:scale-100"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_26%),radial-gradient(circle_at_78%_28%,rgba(232,121,249,0.14),transparent_22%),radial-gradient(circle_at_50%_90%,rgba(34,211,238,0.14),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      <div className="absolute inset-x-8 top-8 flex items-center justify-between">
        <div className="rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Live owner flow
        </div>
        <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
          Privacy active
        </div>
      </div>

      <div className="relative flex h-full items-center justify-center">
        <m.div
          className="pointer-events-none absolute inset-0"
          animate={
            reduceMotion
              ? undefined
              : {
                  backgroundPosition: [
                    "0% 50%",
                    "100% 50%",
                    "0% 50%",
                  ],
                }
          }
          transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          style={{
            backgroundImage:
              "linear-gradient(130deg, rgba(59,130,246,0.04), rgba(34,211,238,0.07), rgba(232,121,249,0.05), rgba(59,130,246,0.04))",
            backgroundSize: "200% 200%",
          }}
        />

        <m.div
          className="relative h-[330px] w-[330px] sm:h-[380px] sm:w-[380px]"
          variants={heroShellVariants}
          initial="hidden"
          animate="visible"
        >
          <m.div
            className={`hero-object-3d relative h-full w-full ${reduceMotion ? "" : "hero-float"}`}
            style={{
              rotateX: springX,
              rotateY: springY,
              transformPerspective: 1400,
            }}
          >
            <m.div
              variants={heroLayerVariants}
              className={`absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl ${reduceMotion ? "" : "hero-pulse"}`}
            />

            <m.div
              variants={heroLayerVariants}
              className="absolute left-10 top-10 h-[280px] w-[280px] rounded-[38px] border border-white/[0.08] bg-slate-950/[0.8] shadow-[0_35px_120px_rgba(2,6,23,0.45)] [transform:translateZ(10px)]"
            />
            <m.div
              variants={heroLayerVariants}
              className="absolute left-14 top-14 h-[280px] w-[280px] rounded-[38px] border border-cyan-300/[0.12] bg-gradient-to-br from-blue-500/[0.18] via-slate-900/[0.92] to-cyan-400/[0.12] [transform:translateZ(50px)]"
            />

            <m.div
              variants={heroLayerVariants}
              className="absolute left-[84px] top-[86px] w-[220px] rounded-[32px] border border-white/[0.1] bg-slate-950/[0.85] p-5 shadow-[0_28px_80px_rgba(2,6,23,0.45)] [transform:translateZ(110px)]"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-2xl border border-cyan-300/[0.16] bg-cyan-400/[0.08] p-3">
                  <QrCode className="h-5 w-5 text-cyan-200" />
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  QR active
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <p className="font-display text-3xl font-semibold tracking-[-0.05em] text-white">
                  ZenvyGo
                </p>
                <p className="text-sm leading-6 text-slate-300/[0.84]">
                  Private vehicle contact with owner alerts and emergency-ready records.
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 text-sm text-slate-200">
                  Toyota Camry · Blocking access
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 text-sm text-slate-200">
                  Emergency profile attached
                </div>
              </div>
            </m.div>

            <m.div
              variants={heroLayerVariants}
              className="absolute right-[54px] top-[68px] rounded-[24px] border border-white/[0.08] bg-white/[0.05] p-3 [transform:translateZ(150px)]"
            >
              <BellRing className="h-5 w-5 text-amber-200" />
            </m.div>
            <m.div
              variants={heroLayerVariants}
              className="absolute left-[64px] bottom-[64px] rounded-[24px] border border-white/[0.08] bg-white/[0.05] p-3 [transform:translateZ(170px)]"
            >
              <ShieldCheck className="h-5 w-5 text-emerald-200" />
            </m.div>
          </m.div>
        </m.div>
      </div>
    </div>
  );
}
