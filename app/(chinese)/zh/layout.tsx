import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../../globals.css";
import { absoluteSiteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteSiteUrl("/zh")),
  title: { default: siteConfig.titleZh, template: "%s — 廖致翔" },
  description: siteConfig.descriptionZh,
  applicationName: "廖致翔學術作品集",
  authors: [{ name: siteConfig.nameZh, url: absoluteSiteUrl("/zh") }],
  creator: siteConfig.nameZh,
  category: "學術作品集",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "dark", themeColor: "#06080F" };

export default function ChineseLayout({ children }: { children: ReactNode }) {
  return <html lang="zh-Hant"><head><meta property="og:locale:alternate" content="en_US" /></head><body>{children}</body></html>;
}
