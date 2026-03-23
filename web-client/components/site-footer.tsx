"use client";

import { useRef } from "react";
import type { Variants } from "framer-motion";
import { m, useInView, useReducedMotion } from "framer-motion";
import { Github, Globe, Mail, Twitter } from "lucide-react";

import { Container } from "@/components/ui/container";
import { InteractiveLink } from "@/components/ui/interactive-link";
import { EASE_OUT } from "@/lib/motion";
import { navItems, siteConfig } from "@/lib/site-data";

const productLinks = [
  { label: "Verified onboarding", href: "#features" },
  { label: "QR scan flow", href: "#how-it-works" },
  { label: "Owner dashboard", href: "#dashboard" },
];

const trustLinks = [
  { label: "Trust by design", href: "#trust" },
  { label: "support@zenvygo.com", href: `mailto:${siteConfig.supportEmail}` },
  { label: "Visit ZenvyGo", href: siteConfig.links.website, external: true },
];

const socialLinks = [
  { label: "Website", href: siteConfig.links.website, icon: Globe },
  { label: "Twitter", href: siteConfig.links.twitter, icon: Twitter },
  { label: "GitHub", href: siteConfig.links.github, icon: Github },
];

const footerPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.72,
      ease: EASE_OUT,
      when: "beforeChildren",
      delayChildren: 0.08,
      staggerChildren: 0.08,
    },
  },
};

const footerColumnVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.56,
      ease: EASE_OUT,
    },
  },
};

const footerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      delay: index * 0.045,
      ease: EASE_OUT,
    },
  }),
};

const footerBottomVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      delay: 0.28,
      ease: EASE_OUT,
    },
  },
};

export function SiteFooter() {
  const footerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.24 });
  const reduceMotion = useReducedMotion();

  return (
    <footer
      ref={footerRef}
      className="border-t border-white/[0.08] bg-slate-950/[0.85]"
    >
      <Container className="py-10 sm:py-12 md:py-14 lg:py-16">
        <m.div
          className="glass-panel relative overflow-hidden p-6 sm:p-8 md:p-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={footerPanelVariants}
        >
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-cyan-400/14 blur-3xl"
            animate={
              reduceMotion || !isInView
                ? { opacity: 0.18, x: 0, y: 0 }
                : { opacity: [0.18, 0.32, 0.18], x: [-12, 18, -12], y: [8, -12, 8] }
            }
            transition={{
              duration: 12,
              repeat: reduceMotion || !isInView ? 0 : Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-0 h-60 w-60 rounded-full bg-fuchsia-400/12 blur-3xl"
            animate={
              reduceMotion || !isInView
                ? { opacity: 0.16, x: 0, y: 0 }
                : { opacity: [0.16, 0.28, 0.16], x: [12, -18, 12], y: [-6, 14, -6] }
            }
            transition={{
              duration: 14,
              repeat: reduceMotion || !isInView ? 0 : Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent blur-2xl"
            initial={{ x: "-25%", opacity: 0 }}
            whileInView={
              reduceMotion
                ? undefined
                : {
                    x: ["-25%", "180%"],
                    opacity: [0, 0.55, 0],
                  }
            }
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 2.6, delay: 0.3, ease: EASE_OUT }}
          />
          <m.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
            animate={
              reduceMotion || !isInView
                ? { opacity: 0.65, scaleX: 1 }
                : { opacity: [0.45, 1, 0.45], scaleX: [0.55, 1, 0.6] }
            }
            transition={{
              duration: 6,
              repeat: reduceMotion || !isInView ? 0 : Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <div className="relative grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(3,minmax(0,0.7fr))]">
            <m.div className="space-y-4" variants={footerColumnVariants}>
              <m.div variants={footerItemVariants} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/85">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
                Owner flow ready
              </m.div>

              <m.div variants={footerItemVariants} className="flex items-center gap-3">
                <m.div
                  whileHover={reduceMotion ? undefined : { rotate: -8, scale: 1.04 }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500 via-cyan-400 to-fuchsia-500 shadow-[0_12px_34px_rgba(34,211,238,0.22)]"
                >
                  <span className="font-display text-lg font-semibold text-white">Z</span>
                </m.div>
                <div>
                  <p className="font-display text-xl font-semibold tracking-[-0.03em] text-white">
                    {siteConfig.name}
                  </p>
                  <p className="text-sm text-slate-400">{siteConfig.tagline}</p>
                </div>
              </m.div>

              <m.p variants={footerItemVariants} className="max-w-md text-sm leading-7 text-slate-300/[0.82]">
                Built around the real ZenvyGo product flow: verified owner access,
                vehicle-linked QR tags, structured public requests, alert history,
                and emergency-ready vehicle profiles.
              </m.p>

              <m.div variants={footerItemVariants}>
                <InteractiveLink
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/[0.08]"
                >
                  <Mail className="h-4 w-4 text-cyan-300 transition-transform duration-300 group-hover:-translate-y-0.5" />
                  <span className="transition duration-300 group-hover:text-white">
                    {siteConfig.supportEmail}
                  </span>
                </InteractiveLink>
              </m.div>
            </m.div>

            <FooterColumn title="Sections" links={navItems} />
            <FooterColumn title="Product" links={productLinks} />

            <m.div className="space-y-5" variants={footerColumnVariants}>
              <FooterColumn title="Contact" links={trustLinks} animateContainer={false} />

              <m.div variants={footerItemVariants} className="flex items-center gap-3">
                {socialLinks.map(({ label, href, icon: Icon }, index) => (
                  <m.div key={label} custom={index} variants={footerItemVariants}>
                    <InteractiveLink
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/[0.08] hover:text-white"
                    >
                      <Icon className="h-[18px] w-[18px] transition duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                    </InteractiveLink>
                  </m.div>
                ))}
              </m.div>
            </m.div>
          </div>

          <m.div
            className="mt-10 flex flex-col gap-4 border-t border-white/[0.08] pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"
            variants={footerBottomVariants}
          >
            <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
            <p>Landing experience crafted inside the Next.js `web-client`.</p>
          </m.div>
        </m.div>
      </Container>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  links: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
  animateContainer?: boolean;
}

function FooterColumn({
  title,
  links,
  animateContainer = true,
}: FooterColumnProps) {
  const content = (
    <>
      <m.p variants={footerItemVariants} className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {title}
      </m.p>
      <div className="space-y-3">
        {links.map((link, index) => (
          <m.div key={link.href} custom={index} variants={footerItemVariants}>
            <InteractiveLink
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="inline-flex items-center gap-3 text-sm text-slate-300 transition hover:text-white"
            >
              <span className="h-px w-3 rounded-full bg-white/18 transition duration-300 group-hover:w-5 group-hover:bg-cyan-300/80" />
              <span className="transition duration-300 group-hover:translate-x-0.5">
                {link.label}
              </span>
            </InteractiveLink>
          </m.div>
        ))}
      </div>
    </>
  );

  if (!animateContainer) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <m.div className="space-y-4" variants={footerColumnVariants}>
      {content}
    </m.div>
  );
}
