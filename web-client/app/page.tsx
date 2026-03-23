import { MotionProvider } from "@/components/motion-provider";
import { PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteStructuredData } from "@/components/site-structured-data";
import { DashboardPreviewSection } from "@/sections/dashboard-preview-section";
import { FeaturesSection } from "@/sections/features-section";
import { HeroSection } from "@/sections/hero-section";
import { HowItWorksSection } from "@/sections/how-it-works-section";
import { TrustSection } from "@/sections/trust-section";

export default function Home() {
  return (
    <MotionProvider>
      <SiteStructuredData />
      <SiteHeader />
      <PageShell>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DashboardPreviewSection />
        <TrustSection />
      </PageShell>
      <SiteFooter />
    </MotionProvider>
  );
}
