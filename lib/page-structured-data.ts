import type { ContentEntity, Locale, ResolvedPage } from "./content-data";
import { getEntityByCanonicalRoute } from "./content-data";
import { parentRouteForEntity } from "./content-navigation";
import { selectRepresentativeAsset } from "./media-presentation";
import { assetsForRoute } from "./page-runtime";
import { absoluteSiteUrl } from "./seo";
import { localizePath } from "./site-config";
import { videosForRoute } from "./videos";

function schemaType(entity: ContentEntity): string {
  if (entity.kind === "page") return "CollectionPage";
  if (entity.id.startsWith("autobiography-") || entity.kind === "writing") return "Article";
  if (entity.kind === "coursework") return "LearningResource";
  if (entity.kind === "research") return "ScholarlyArticle";
  return "CreativeWork";
}

export function structuredDataForPage(
  page: ResolvedPage,
  entity: ContentEntity,
  locale: Locale,
): Array<Record<string, unknown>> {
  const currentPath = localizePath(page.canonicalRoute, locale);
  const currentUrl = absoluteSiteUrl(currentPath);
  const authorName = locale === "en" ? "Chih-Hsiang Liao" : "廖致翔";
  const homeName = locale === "en" ? "Home" : "首頁";
  const inLanguage = locale === "en" ? "en" : "zh-Hant";
  const assets = assetsForRoute(page.canonicalRoute, locale);
  const primaryAsset = selectRepresentativeAsset(
    page.canonicalRoute,
    "hero",
    assets,
  );
  const primaryImagePath = primaryAsset?.kind === "image"
    ? primaryAsset.fallbackPath ?? primaryAsset.webpPath ?? primaryAsset.publicPath
    : primaryAsset?.previewPath;
  const workId = `${currentUrl}#work`;
  const imageId = primaryImagePath ? `${currentUrl}#primary-image` : undefined;
  const videoRecords = videosForRoute(page.canonicalRoute);
  const documentAssets = assets.filter((asset) => asset.kind === "document");
  const items: Array<Record<string, unknown>> = [
    { "@type": "ListItem", position: 1, name: homeName, item: absoluteSiteUrl(localizePath("/", locale)) },
  ];
  const parentRoute = parentRouteForEntity(entity);
  if (parentRoute) {
    const parent = getEntityByCanonicalRoute(parentRoute);
    if (parent) {
      items.push({
        "@type": "ListItem",
        position: items.length + 1,
        name: parent.title[locale],
        item: absoluteSiteUrl(localizePath(parentRoute, locale)),
      });
    }
  }
  if (page.canonicalRoute !== "/") {
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: page.title,
      item: currentUrl,
    });
  }

  const work: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@id": workId,
    "@type": schemaType(entity),
    name: page.title,
    headline: page.title,
    description: page.summary,
    url: currentUrl,
    inLanguage,
    author: { "@type": "Person", name: authorName },
    ...(imageId ? { image: { "@id": imageId } } : {}),
    ...(videoRecords.length || documentAssets.length
      ? {
          hasPart: [
            ...videoRecords.map((video) => ({ "@id": `${currentUrl}#video-${video.id}` })),
            ...documentAssets.map((document) => ({ "@id": `${currentUrl}#document-${document.id}` })),
          ],
        }
      : {}),
  };

  const imageObject: Record<string, unknown>[] = primaryImagePath && primaryAsset
    ? [{
        "@context": "https://schema.org",
        "@id": imageId,
        "@type": "ImageObject",
        contentUrl: absoluteSiteUrl(primaryImagePath),
        name: primaryAsset.title || page.title,
        caption: primaryAsset.caption || primaryAsset.alt,
        inLanguage,
        ...(primaryAsset.width ? { width: primaryAsset.width } : {}),
        ...(primaryAsset.height ? { height: primaryAsset.height } : {}),
      }]
    : [];

  const videoObjects: Record<string, unknown>[] = videoRecords.map((video) => ({
    "@context": "https://schema.org",
    "@id": `${currentUrl}#video-${video.id}`,
    "@type": "VideoObject",
    name: video.title[locale],
    description: video.summary[locale],
    thumbnailUrl: [absoluteSiteUrl(video.poster.fallback)],
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
    duration: isoDuration(video.duration),
    uploadDate: video.uploadDate,
    inLanguage,
    isPartOf: { "@id": workId },
  }));

  const documentObjects: Record<string, unknown>[] = documentAssets.map((document) => ({
    "@context": "https://schema.org",
    "@id": `${currentUrl}#document-${document.id}`,
    "@type": "DigitalDocument",
    name: document.title || page.title,
    description: document.caption || page.summary,
    url: absoluteSiteUrl(document.publicPath),
    encodingFormat: "application/pdf",
    inLanguage,
    isPartOf: { "@id": workId },
  }));

  return [
    work,
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    },
    ...imageObject,
    ...videoObjects,
    ...documentObjects,
  ];
}

function isoDuration(duration: string): string {
  const parts = duration.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return duration;

  const [hours, minutes, seconds] = parts.length === 3
    ? parts
    : [0, parts[0] ?? 0, parts[1] ?? 0];
  return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${seconds || (!hours && !minutes) ? `${seconds}S` : ""}`;
}
