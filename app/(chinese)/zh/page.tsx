import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { SiteFrame } from "@/components/SiteFrame";
import { StructuredData } from "@/components/StructuredData";
import { getEntityByCanonicalRoute, getPageByPath } from "@/lib/content-data";
import { pageMetadata } from "@/lib/metadata";
import { assetsForRoute, searchEntries } from "@/lib/page-runtime";
import { absoluteSiteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const page = getPageByPath("/zh", "zh")!;
export const metadata: Metadata = pageMetadata(page, "zh");

export default function ChineseHome() {
  const entity = getEntityByCanonicalRoute("/")!;
  return <SiteFrame locale="zh" path="/zh" searchEntries={searchEntries("zh")}><StructuredData data={[{ "@context": "https://schema.org", "@type": "Person", name: siteConfig.nameZh, alternateName: [siteConfig.name, siteConfig.formalName], url: absoluteSiteUrl("/zh"), email: `mailto:${siteConfig.email}`, affiliation: { "@type": "CollegeOrUniversity", name: "國立臺灣大學" } }, { "@context": "https://schema.org", "@type": "WebSite", name: "廖致翔學術作品集", url: absoluteSiteUrl("/zh"), inLanguage: ["zh-Hant", "en"] }]} /><HomePage locale="zh" page={entity} find={getEntityByCanonicalRoute} media={(route) => assetsForRoute(route, "zh").filter((asset) => asset.kind === "image")} /></SiteFrame>;
}
