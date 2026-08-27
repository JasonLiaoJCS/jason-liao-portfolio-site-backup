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
const pathFor = (slug: string[]) => `/${slug.join("/")}`;

export function generateStaticParams(): Params[] { return allPublicRoutes.filter((route) => route !== "/" && route !== "/trusted").map((route) => ({ slug: route.slice(1).split("/") })); }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageByPath(pathFor(slug), "en");
  return page ? pageMetadata(page, "en") : { title: "Page not found", robots: { index: false, follow: false } };
}

export default async function EnglishPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const path = pathFor(slug);
  const bundle = pageBundle(path, "en");
  if (!bundle) notFound();
  return <SiteFrame locale="en" path={path} searchEntries={searchEntries("en")}><StructuredData data={structuredDataForPage(bundle.page, bundle.entity, "en")} /><PageView locale="en" {...bundle} /></SiteFrame>;
}
