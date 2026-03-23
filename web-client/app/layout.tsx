import type { Metadata, Viewport } from "next";

import { siteConfig } from "@/lib/site-data";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.links.website),
  title: {
    default: `${siteConfig.name} | Privacy-First Vehicle Contact`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author, url: siteConfig.links.website }],
  creator: siteConfig.author,
  publisher: siteConfig.legalName,
  keywords: siteConfig.keywords,
  category: siteConfig.category,
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.links.website,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Privacy-First Vehicle Contact`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImagePath,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} premium landing page preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@zenvygo",
    title: `${siteConfig.name} | Privacy-First Vehicle Contact`,
    description: siteConfig.description,
    images: [siteConfig.twitterImagePath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#04070d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground font-sans">
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
