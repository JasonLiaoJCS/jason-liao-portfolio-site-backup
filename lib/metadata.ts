import type { Metadata } from "next";
import type { Locale, ResolvedPage } from "./content-data";
import { selectRepresentativeAsset } from "./media-presentation";
import { assetsForRoute } from "./page-runtime";
import { absoluteSiteUrl } from "./seo";

const englishMetadataTitles: Record<string, string> = {
  "/writing/autobiography/gewu-xiangzhe-preface": "Gewu Xiangzhe: A Self-Preface",
  "/research/redrhex": "RedRHex Locomotion Control",
  "/projects/polar-arm": "Mechanical Polar-Coordinate Transport Arm",
  "/experience/chien-kuo-gifted-class": "Chien Kuo Mathematics & Science Gifted Class",
  "/writing/mathematica-curvilinear-basis": "Curvilinear Basis Differentiation in Mathematica",
  "/experience/chien-kuo-mathematics-competition": "Chien Kuo Mathematics Competition Awards",
  "/experience/chien-kuo-overseas-program-planning": "Chien Kuo Overseas Program Planning Lead",
  "/experience/chien-kuo-research-presentation-lead": "Chien Kuo Research Symposium Coordinator",
  "/experience/baseball-fandom": "Baseball: Team Taiwan, CTBC & Yankees",
  "/experience/apx-2021": "2021 APX Mathematics Awards",
  "/writing/teaching/taylor-series-video": "Taylor-Series Science Club Lesson",
  "/writing/mathematical-popular-writing-2021": "Popular Mathematics Writing (2021)",
};

export function pageMetadata(page: ResolvedPage, locale: Locale): Metadata {
  const english = page.canonicalRoute;
  const chinese = page.canonicalRoute === "/" ? "/zh" : `/zh${page.canonicalRoute}`;
  const current = locale === "en" ? english : chinese;
  const pageTitle = locale === "en" ? englishMetadataTitles[page.canonicalRoute] ?? page.title : page.title;
  const title = page.canonicalRoute === "/" ? pageTitle : `${pageTitle} — ${locale === "en" ? "Jason Liao" : "廖致翔"}`;
  const socialImage = socialImageForPage(page, locale);
  const socialImages = socialImage ? [socialImage] : undefined;
  return {
    title: { absolute: title },
    description: page.summary,
    alternates: {
      canonical: absoluteSiteUrl(current),
      languages: {
        en: absoluteSiteUrl(english),
        "zh-Hant": absoluteSiteUrl(chinese),
        "x-default": absoluteSiteUrl(english),
      },
    },
    openGraph: {
      type: page.canonicalRoute.startsWith("/writing/autobiography/") ? "article" : "website",
      locale: locale === "en" ? "en_US" : "zh_TW",
      alternateLocale: [locale === "en" ? "zh_TW" : "en_US"],
      url: absoluteSiteUrl(current),
      title,
      description: page.summary,
      siteName: "Jason Liao Academic Portfolio",
      ...(socialImages ? { images: socialImages } : {}),
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title,
      description: page.summary,
      ...(socialImage ? { images: [socialImage.url] } : {}),
    },
    robots: page.canonicalRoute === "/trusted" ? { index: false, follow: false, nocache: true } : { index: true, follow: true },
  };
}

function socialImageForPage(
  page: ResolvedPage,
  locale: Locale,
): { url: string; width?: number; height?: number; alt: string } | undefined {
  // Collection pages share the established site-wide identity card. Detail
  // pages use their real primary artifact and never inherit an unrelated image.
  if (page.kind === "page") {
    return {
      url: absoluteSiteUrl("/og.png"),
      width: 1672,
      height: 941,
      alt: locale === "en"
        ? "Jason Liao — from first principles to systems that work"
        : "廖致翔｜從第一原理到可靠運作的系統",
    };
  }

  const asset = selectRepresentativeAsset(
    page.canonicalRoute,
    "hero",
    assetsForRoute(page.canonicalRoute, locale),
  );
  if (!asset) return undefined;

  const publicPath = asset.kind === "document"
    ? asset.previewPath
    : asset.fallbackPath ?? asset.webpPath ?? asset.publicPath;
  if (!publicPath) return undefined;

  return {
    url: absoluteSiteUrl(publicPath),
    ...(asset.kind === "image" && asset.width ? { width: asset.width } : {}),
    ...(asset.kind === "image" && asset.height ? { height: asset.height } : {}),
    alt: asset.alt || asset.title || page.title,
  };
}
