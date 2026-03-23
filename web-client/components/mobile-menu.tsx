"use client";

import { useEffect } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { navItems, siteConfig } from "@/lib/site-data";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { EASE_OUT } from "@/lib/motion";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const reduceMotion = useReducedMotion();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md"
          />

          {/* Drawer */}
          <m.nav
            id="mobile-menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE_OUT }}
            className="fixed bottom-0 right-0 top-0 z-[70] w-[85vw] max-w-sm overflow-y-auto rounded-l-[32px] border-l border-white/10 glass-panel"
          >
            <div className="flex h-full flex-col p-6">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500 via-cyan-400 to-fuchsia-500">
                    <span className="font-display text-base font-semibold text-white">
                      Z
                    </span>
                  </div>
                  <div>
                    <div className="font-display text-base font-semibold text-white">
                      {siteConfig.name}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {siteConfig.tagline}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav Items */}
              <div className="flex-1 space-y-2">
                {navItems.map((item, index) => (
                  <m.a
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.3,
                      delay: reduceMotion ? 0 : index * 0.05,
                      ease: EASE_OUT,
                    }}
                    className="block rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-4 text-base font-medium text-white transition hover:border-white/[0.12] hover:bg-white/[0.08] active:scale-[0.98]"
                  >
                    {item.label}
                  </m.a>
                ))}
              </div>

              {/* CTA */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.3,
                  delay: reduceMotion ? 0 : 0.25,
                  ease: EASE_OUT,
                }}
                className="mt-6"
              >
                <GetStartedButton
                  ariaLabel="Open ZenvyGo and begin"
                  fallbackHref="#dashboard"
                  className="w-full"
                />
              </m.div>
            </div>
          </m.nav>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
