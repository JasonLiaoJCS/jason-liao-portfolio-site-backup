import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { SiteFrame } from "@/components/SiteFrame";
import { StructuredData } from "@/components/StructuredData";
import { getEntityByCanonicalRoute, getPageByPath } from "@/lib/content-data";
import { pageMetadata } from "@/lib/metadata";
import { assetsForRoute, searchEntries } from "@/lib/page-runtime";
import { absoluteSiteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const page = getPageByPath("/", "en")!;
export const metadata: Metadata = pageMetadata(page, "en");

export default function EnglishHome() {
  const entity = getEntityByCanonicalRoute("/")!;
  return <SiteFrame locale="en" path="/" searchEntries={searchEntries("en")}><StructuredData data={[{ "@context": "https://schema.org", "@type": "Person", name: siteConfig.formalName, alternateName: [siteConfig.name, siteConfig.nameZh], url: absoluteSiteUrl("/"), email: `mailto:${siteConfig.email}`, affiliation: { "@type": "CollegeOrUniversity", name: "National Taiwan University" } }, { "@context": "https://schema.org", "@type": "WebSite", name: "Jason Liao Academic Portfolio", url: absoluteSiteUrl("/"), inLanguage: ["en", "zh-Hant"] }]} /><HomePage locale="en" page={entity} find={getEntityByCanonicalRoute} media={(route) => assetsForRoute(route, "en").filter((asset) => asset.kind === "image")} /></SiteFrame>;
}
