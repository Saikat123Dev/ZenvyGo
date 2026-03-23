import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.links.website,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
