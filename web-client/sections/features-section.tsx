import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { HoverCard } from "@/components/ui/hover-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { featureItems } from "@/lib/site-data";

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="content-auto scroll-mt-28 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="features-heading"
            eyebrow="Core Product"
            title="A landing page that actually represents the app behind it"
            description="Every section below comes from the implemented ZenvyGo flow: owner auth, vehicle setup, QR tags, public contact sessions, alert history, and emergency vehicle data."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <FeatureCard {...item} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  detail,
}: FeatureCardProps) {
  return (
    <HoverCard
      as="article"
      className="glass-card flex h-full flex-col rounded-[28px] p-4 transition duration-300 hover:border-cyan-300/[0.18] hover:bg-white/[0.08] sm:p-5 md:p-6"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/[0.16] bg-gradient-to-br from-blue-500/[0.16] via-cyan-400/[0.16] to-fuchsia-500/[0.14] text-cyan-100 shadow-[0_18px_40px_rgba(8,145,178,0.18)] transition duration-300 group-hover:scale-105">
          <Icon className="h-6 w-6" />
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-600 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-200" />
      </div>

      <div className="mt-8 flex flex-1 flex-col">
        <h3 className="font-display text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
          {title}
        </h3>
        <p className="mt-4 text-sm leading-7 text-slate-300/[0.84] sm:text-base">
          {description}
        </p>
        <div className="mt-6 rounded-[22px] border border-white/[0.06] bg-slate-950/[0.62] px-4 py-4 text-sm leading-6 text-slate-400">
          {detail}
        </div>
      </div>
    </HoverCard>
  );
}
