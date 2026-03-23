import { CheckCircle2, MessageSquareText, Sparkles } from "lucide-react";

import { HeroVisual } from "@/components/hero-visual";
import { Container } from "@/components/ui/container";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { HoverCard } from "@/components/ui/hover-card";
import { InteractiveLink } from "@/components/ui/interactive-link";
import { Reveal } from "@/components/ui/reveal";
import { scanReasons, siteConfig } from "@/lib/site-data";

const heroHighlights = [
  "Verified onboarding for owners",
  "Vehicle-level QR tag activation",
  "Alerts, sessions, and emergency profiles",
];

const heroMetrics = [
  { label: "Owner flow", value: "Verified" },
  { label: "Tag states", value: "Generated / Active" },
  { label: "Public request reasons", value: "7 mapped cases" },
];

export function HeroSection() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative overflow-hidden pt-16 sm:pt-20 md:pt-24 lg:pt-28 xl:pt-36"
    >
      <div className="site-gradient pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_48%)]" />
      <div className="orb absolute left-[8%] top-20 -z-10 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="orb orb-delay absolute right-[10%] top-36 -z-10 h-72 w-72 rounded-full bg-fuchsia-500/[0.12] blur-3xl" />

      <Container className="grid gap-8 pb-12 sm:gap-10 sm:pb-16 md:gap-12 md:pb-20 lg:gap-14 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:items-center lg:pb-24 xl:pb-28">
        <Reveal className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm text-cyan-100/[0.9] shadow-[0_14px_40px_rgba(6,182,212,0.12)]">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Based on the real {siteConfig.name} mobile and API flow
          </div>

          <div className="space-y-6">
            <h1
              id="hero-title"
              className="max-w-3xl font-display text-3xl font-semibold leading-tight tracking-[-0.07em] text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            >
              Turn every parked vehicle into a private, scannable response path.
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-7 text-slate-300/[0.88] sm:text-lg sm:leading-8 lg:text-xl">
              {siteConfig.name} gives owners a verified command center for vehicles,
              QR tags, alerts, contact sessions, and emergency profiles. When
              someone spots blocked access, towing risk, lights left on, or damage,
              they can send a structured request without exposing owner details.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <GetStartedButton
              ariaLabel="Open ZenvyGo to start the real owner onboarding flow"
              fallbackHref="#dashboard"
              className="hover:shadow-[0_24px_70px_rgba(34,211,238,0.24)]"
            />
            <InteractiveLink
              href="#how-it-works"
              aria-label="Learn how the ZenvyGo request flow works"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/[0.08]"
            >
              Learn More
              <MessageSquareText className="h-4 w-4 text-cyan-300 transition-transform duration-300 group-hover:translate-y-0.5" />
            </InteractiveLink>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {heroMetrics.map((metric) => (
              <HoverCard
                key={metric.label}
                className="glass-card rounded-[24px] p-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-3 text-lg font-semibold text-white">{metric.value}</p>
              </HoverCard>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {heroHighlights.map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-slate-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-sm leading-7 text-slate-400">
              Real request reasons already modeled in the app:
            </p>
            <div className="flex flex-wrap gap-2">
              {scanReasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full border border-white/[0.08] bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-300"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.14} y={32} scale={0.96}>
          <HeroVisual />
        </Reveal>
      </Container>
    </section>
  );
}
