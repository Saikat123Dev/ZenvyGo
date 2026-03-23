import { Container } from "@/components/ui/container";
import { HoverCard } from "@/components/ui/hover-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { workflowSteps } from "@/lib/site-data";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="content-auto scroll-mt-28 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="how-it-works-heading"
            eyebrow="How It Works"
            title="From verified owner setup to a resolved vehicle request"
            description="ZenvyGo is not a vague QR sticker concept. It already has a defined request lifecycle, and the landing flow mirrors that lifecycle end to end."
            align="center"
          />
        </Reveal>

        <div className="relative mx-auto mt-14 max-w-6xl">
          <div className="absolute left-6 top-8 bottom-8 hidden w-px bg-gradient-to-b from-cyan-300/35 via-blue-400/30 to-transparent lg:block" />
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {workflowSteps.map((step, index) => (
              <Reveal key={step.step} delay={index * 0.07}>
                <HoverCard
                  as="article"
                  className="glass-card relative h-full rounded-[28px] p-4 sm:p-5 md:p-6"
                >
                  <div className="flex items-start gap-5">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/[0.18] bg-gradient-to-br from-blue-500/[0.18] via-cyan-400/[0.12] to-fuchsia-500/[0.14] text-lg font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.2)] transition duration-300 group-hover:scale-105">
                      {step.step}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                          Step {step.step}
                        </p>
                        <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-base leading-7 text-slate-300/[0.84]">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {step.points.map((point) => (
                      <span
                        key={point}
                        className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </HoverCard>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
