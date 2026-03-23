"use client";

import dynamic from "next/dynamic";

const HeroObject3D = dynamic(
  () => import("@/components/hero-object-3d").then((mod) => mod.HeroObject3D),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="hero-stage relative aspect-[1.03] min-h-[460px] w-full scale-75 rounded-[34px] border border-white/[0.08] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.88)_0%,rgba(3,7,18,0.92)_100%)] sm:scale-90 lg:scale-100"
      />
    ),
  },
);

export function HeroVisual() {
  return <HeroObject3D />;
}
