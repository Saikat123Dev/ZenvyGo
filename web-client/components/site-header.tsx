"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { InteractiveLink } from "@/components/ui/interactive-link";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { MobileMenu } from "@/components/mobile-menu";
import { navItems, siteConfig } from "@/lib/site-data";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-slate-950/[0.72] backdrop-blur-xl">
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500 via-cyan-400 to-fuchsia-500 shadow-[0_10px_35px_rgba(37,99,235,0.38)]">
            <span className="font-display text-lg font-semibold tracking-[-0.08em] text-white">
              Z
            </span>
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-lg font-semibold tracking-[-0.03em] text-white">
              {siteConfig.name}
            </div>
            <div className="text-xs tracking-[0.2em] text-slate-400 uppercase">
              {siteConfig.tagline}
            </div>
          </div>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          />
          <InteractiveLink
            href="#features"
            aria-label="Learn more about ZenvyGo features"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/[0.18] hover:bg-white/[0.06] sm:inline-flex"
          >
            Learn More
          </InteractiveLink>
          <GetStartedButton
            ariaLabel="Open ZenvyGo and begin the real app flow"
            fallbackHref="#dashboard"
            size="compact"
            className="hover:shadow-[0_16px_40px_rgba(34,211,238,0.18)]"
          />
        </div>
      </Container>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
