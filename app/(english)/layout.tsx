import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { absoluteSiteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteSiteUrl("/")),
  title: { default: siteConfig.title, template: "%s — Jason Liao" },
  description: siteConfig.description,
  applicationName: "Jason Liao Academic Portfolio",
  authors: [{ name: siteConfig.formalName, url: absoluteSiteUrl("/") }],
  creator: siteConfig.formalName,
  category: "Academic Portfolio",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "dark", themeColor: "#06080F" };

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><head><meta property="og:locale:alternate" content="zh_TW" /></head><body>{children}</body></html>;
}
