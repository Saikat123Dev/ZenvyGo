import { Shield } from "lucide-react";

import { Container } from "@/components/ui/container";
import { HoverCard } from "@/components/ui/hover-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  channelOptions,
  scanReasons,
  trustPillars,
} from "@/lib/site-data";

export function TrustSection() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="content-auto scroll-mt-28 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="trust-heading"
            eyebrow="Trust By Design"
            title="Built for urgent, real-world moments without turning into noise"
            description="ZenvyGo’s public experience is constrained to useful vehicle contact, while the owner side keeps enough structure to review, resolve, and retain context."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <Reveal delay={0.06}>
            <div className="glass-panel h-full rounded-[32px] p-4 sm:p-5 md:p-6 lg:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Public Scan Flow
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.05em] text-white sm:text-2xl lg:text-3xl">
                    Structured reasons, not generic contact forms
                  </h3>
                </div>
                <div className="rounded-2xl border border-cyan-300/[0.18] bg-cyan-400/10 p-3 text-cyan-100">
                  <Shield className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:gap-5 md:grid-cols-2">
                <HoverCard className="rounded-[26px] border border-white/[0.08] bg-slate-950/[0.72] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Incident reasons
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {scanReasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </HoverCard>
                <HoverCard className="rounded-[26px] border border-white/[0.08] bg-slate-950/[0.72] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Logged channel intent
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {channelOptions.map((channel) => (
                      <span
                        key={channel}
                        className="rounded-full border border-cyan-300/[0.14] bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    The public flow asks for the right level of context, then logs
                    the request against the matching vehicle and tag.
                  </p>
                </HoverCard>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4">
            {trustPillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={0.12 + index * 0.06}>
                  <HoverCard as="article" className="glass-card rounded-[28px] p-4 sm:p-5 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/[0.16] via-cyan-400/[0.12] to-fuchsia-500/[0.12] text-cyan-100 transition duration-300 group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
                          {pillar.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300/[0.84]">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </HoverCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
