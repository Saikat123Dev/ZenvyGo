import { featureItems, siteConfig, workflowSteps } from "@/lib/site-data";

const websiteUrl = siteConfig.links.website;

export function getStructuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.legalName,
      url: websiteUrl,
      email: siteConfig.supportEmail,
      logo: `${websiteUrl}/favicon.ico`,
      sameAs: [siteConfig.links.twitter, siteConfig.links.github],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: websiteUrl,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: {
        "@type": "Organization",
        name: siteConfig.legalName,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "iOS, Android, Web",
      url: websiteUrl,
      description: siteConfig.description,
      creator: {
        "@type": "Organization",
        name: siteConfig.legalName,
      },
      featureList: featureItems.map((item) => item.title),
      audience: {
        "@type": "Audience",
        audienceType: "Vehicle owners, families, parking operations, fleet supervisors",
      },
      keywords: siteConfig.keywords.join(", "),
      softwareHelp: {
        "@type": "CreativeWork",
        name: "Owner-to-public vehicle contact workflow",
        about: workflowSteps.map((step) => step.title),
      },
    },
  ];
}
