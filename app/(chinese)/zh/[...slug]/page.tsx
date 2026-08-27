import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageView } from "@/components/PageView";
import { SiteFrame } from "@/components/SiteFrame";
import { StructuredData } from "@/components/StructuredData";
import { allPublicRoutes, getPageByPath } from "@/lib/content-data";
import { pageMetadata } from "@/lib/metadata";
import { structuredDataForPage } from "@/lib/page-structured-data";
import { pageBundle, searchEntries } from "@/lib/page-runtime";

type Params = { slug: string[] };
const canonicalFor = (slug: string[]) => `/${slug.join("/")}`;

export function generateStaticParams(): Params[] { return allPublicRoutes.filter((route) => route !== "/" && route !== "/trusted").map((route) => ({ slug: route.slice(1).split("/") })); }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const canonical = canonicalFor(slug);
  const page = getPageByPath(`/zh${canonical}`, "zh");
  return page ? pageMetadata(page, "zh") : { title: "找不到頁面", robots: { index: false, follow: false } };
}

export default async function ChinesePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const canonical = canonicalFor(slug);
  const path = `/zh${canonical}`;
  const bundle = pageBundle(path, "zh");
  if (!bundle) notFound();
  return <SiteFrame locale="zh" path={path} searchEntries={searchEntries("zh")}><StructuredData data={structuredDataForPage(bundle.page, bundle.entity, "zh")} /><PageView locale="zh" {...bundle} /></SiteFrame>;
}
