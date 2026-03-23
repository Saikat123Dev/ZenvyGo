"use client";

import type { MouseEvent } from "react";
import { ArrowRight } from "lucide-react";

import { InteractiveLink } from "@/components/ui/interactive-link";
import { siteConfig } from "@/lib/site-data";
import { cn } from "@/lib/utils";

interface GetStartedButtonProps {
  className?: string;
  ariaLabel?: string;
  fallbackHref?: string;
  size?: "default" | "compact";
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function GetStartedButton({
  className,
  ariaLabel = "Open ZenvyGo and start onboarding",
  fallbackHref = "#dashboard",
  size = "default",
}: GetStartedButtonProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    let pageHidden = false;

    const cleanup = () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };

    const fallback = () => {
      cleanup();

      if (pageHidden) {
        return;
      }

      if (fallbackHref.startsWith("#")) {
        const target = document.querySelector(fallbackHref);

        if (target instanceof HTMLElement) {
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
          window.history.replaceState(null, "", fallbackHref);
          return;
        }
      }

      window.location.assign(fallbackHref);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pageHidden = true;
        cleanup();
      }
    };

    const handlePageHide = () => {
      pageHidden = true;
      cleanup();
    };

    const timer = window.setTimeout(fallback, 900);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide, { once: true });
    window.location.href = siteConfig.links.app;
  }

  const sizeClassName =
    size === "compact"
      ? "h-11 px-4 text-sm" // 44px minimum for touch accessibility
      : "h-12 px-6 text-sm sm:h-13 sm:px-6.5";

  return (
    <InteractiveLink
      href={siteConfig.links.app}
      aria-label={ariaLabel}
      onClick={handleClick}
      className={cn(
        "group isolate inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/22 bg-[linear-gradient(135deg,#ffffff_0%,#eefbff_44%,#dfe7ff_100%)] text-[#06101f] shadow-[0_18px_55px_rgba(8,145,178,0.22),inset_0_1px_0_rgba(255,255,255,0.92)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] active:shadow-[0_8px_25px_rgba(8,145,178,0.18)]",
        sizeClassName,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(59,130,246,0.08))] opacity-0 transition duration-300 group-hover:opacity-100"
      />
      <span className="relative z-10 flex items-center gap-2.5">
        <span className="whitespace-nowrap font-semibold tracking-[-0.02em] text-[#06101f]">
          Get Started
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/10 text-[#06101f] ring-1 ring-black/5 transition duration-300 group-hover:bg-slate-950/14 group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" />
        </span>
      </span>
    </InteractiveLink>
  );
}
