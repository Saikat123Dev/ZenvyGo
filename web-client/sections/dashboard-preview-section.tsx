import { CircleCheckBig, TriangleAlert } from "lucide-react";

import { Container } from "@/components/ui/container";
import { HoverCard } from "@/components/ui/hover-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  dashboardAlerts,
  dashboardMetrics,
  dashboardRequests,
  dashboardVehicles,
} from "@/lib/site-data";

const toneClasses = {
  warning: "bg-amber-400/10 text-amber-100 border-amber-300/[0.18]",
  info: "bg-cyan-400/10 text-cyan-100 border-cyan-300/[0.18]",
  success: "bg-emerald-400/10 text-emerald-100 border-emerald-300/[0.18]",
} as const;

export function DashboardPreviewSection() {
  return (
    <section
      id="dashboard"
      aria-labelledby="dashboard-heading"
      className="content-auto scroll-mt-28 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="dashboard-heading"
            eyebrow="Owner Dashboard"
            title="A preview shaped around ZenvyGo’s real app surfaces"
            description="The design borrows from the mobile app’s command-center pattern: summary metrics, recent alerts, open requests, QR-tagged vehicles, and emergency-ready records in one place."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass-panel relative mt-12 overflow-hidden rounded-[34px] p-4 sm:p-5 md:p-6 lg:p-7">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="rounded-[28px] border border-white/[0.08] bg-slate-950/[0.72] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Command Center
                </p>
                <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-white">
                  ZenvyGo
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Vehicles, tags, alerts, sessions, and emergency details stay tied
                  to the same owner workflow.
                </p>

                <div className="mt-6 space-y-3">
                  {dashboardVehicles.map((vehicle) => (
                    <HoverCard
                      key={vehicle.plate}
                      className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{vehicle.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                            {vehicle.plate}
                          </p>
                        </div>
                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                          {vehicle.tagState}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {vehicle.detail}
                      </p>
                    </HoverCard>
                  ))}
                </div>
              </aside>

              <div className="space-y-6">
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  {dashboardMetrics.map((metric) => (
                    <HoverCard
                      key={metric.label}
                      className={`rounded-[26px] border border-white/[0.08] bg-gradient-to-br ${metric.accentClass} p-5 shadow-[0_18px_60px_rgba(2,6,23,0.18)]`}
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        {metric.label}
                      </p>
                      <p className="mt-4 font-display text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl">
                        {metric.value}
                      </p>
                    </HoverCard>
                  ))}
                </div>

                <div className="grid gap-4 lg:gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                          Open Requests
                        </p>
                        <h4 className="mt-2 font-display text-base font-semibold tracking-[-0.04em] text-white sm:text-lg md:text-xl lg:text-2xl">
                          Active vehicle issues
                        </h4>
                      </div>
                      <span className="rounded-full bg-amber-400/[0.12] px-3 py-1 text-xs font-semibold text-amber-100">
                        Needs review
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {dashboardRequests.map((request) => (
                        <HoverCard
                          key={`${request.title}-${request.timestamp}`}
                          className="rounded-[24px] border border-white/[0.08] bg-slate-950/70 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {request.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-400">
                                {request.vehicle}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100">
                                {request.reason}
                              </span>
                              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                                {request.channel}
                              </span>
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-300/[0.84]">
                            {request.note}
                          </p>
                          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {request.timestamp}
                          </p>
                        </HoverCard>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[28px] border border-white/[0.08] bg-slate-950/[0.68] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Alerts
                          </p>
                          <h4 className="mt-2 font-display text-base font-semibold tracking-[-0.04em] text-white sm:text-lg md:text-xl lg:text-2xl">
                            Recent activity feed
                          </h4>
                        </div>
                        <TriangleAlert className="h-5 w-5 text-amber-200" />
                      </div>

                      <div className="mt-5 space-y-3">
                        {dashboardAlerts.map((alert) => (
                          <HoverCard
                            key={alert.title}
                            className={`rounded-[22px] border p-4 ${toneClasses[alert.tone]}`}
                            glowClassName="bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_58%)]"
                          >
                            <p className="text-sm font-semibold">{alert.title}</p>
                            <p className="mt-2 text-sm leading-6 text-current/[0.84]">
                              {alert.body}
                            </p>
                          </HoverCard>
                        ))}
                      </div>
                    </div>

                    <HoverCard className="rounded-[28px] border border-emerald-300/[0.16] bg-gradient-to-br from-emerald-400/10 via-cyan-400/10 to-transparent p-5">
                      <div className="flex items-center gap-3">
                        <CircleCheckBig className="h-5 w-5 text-emerald-200" />
                        <p className="text-sm font-semibold text-white">
                          Emergency profiles stay attached to the vehicle record
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300/[0.84]">
                        That keeps roadside numbers, contacts, and medical notes
                        available in the same context as the request itself.
                      </p>
                    </HoverCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
