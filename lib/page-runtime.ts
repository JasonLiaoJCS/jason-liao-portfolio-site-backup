import {
  allContent,
  autobiographyEntries,
  compareContentEntities,
  coursework,
  events,
  getEntityByCanonicalRoute,
  getPageByPath,
  localizedCategory,
  type ContentEntity,
  type Locale,
} from "./content-data";
import type { PublicAsset } from "./public-assets";
import { courseRecordSearchKeywords } from "./course-record";
import mediaManifest from "./media-manifest.json";
import {
  selectRepresentativeAsset,
  type MediaPresentationRole,
} from "./media-presentation";
import { videos } from "./videos";

type ManifestAsset = {
  id: string;
  publicPath: string;
  route: string;
  kind: "image" | "document";
  altEn: string;
  altZh: string;
  captionEn: string;
  captionZh: string;
  titleEn?: string;
  titleZh?: string;
  byteSize?: number;
  pageCount?: number;
  width?: number;
  height?: number;
  displayOrder?: number;
  placementSectionId?: string;
  previewPath?: string;
  variants?: {
    avif?: { publicPath: string };
    webp?: { publicPath: string };
    fallback?: { publicPath: string };
  };
};

export function pageBundle(path: string, locale: Locale) {
  const page = getPageByPath(path, locale);
  const entity = getEntityByCanonicalRoute(path);
  if (!page || !entity) return null;

  const seenRelatedRoutes = new Set<string>();
  const related = entity.relatedRoutes
    .map((route) => getEntityByCanonicalRoute(route))
    .filter((item): item is ContentEntity => {
      if (!item?.route || seenRelatedRoutes.has(item.route)) return false;
      seenRelatedRoutes.add(item.route);
      return true;
    });
  const collection = collectionForRoute(page.canonicalRoute);
  const representativeRoutes = [
    ...collection.flatMap((item) => item.route ? [item.route] : []),
    ...related.flatMap((item) => item.route ? [item.route] : []),
  ];
  const representativeAssets = representativeAssetsForRoutes(
    representativeRoutes,
    locale,
    "card",
  );
  const assets = assetsForRoute(page.canonicalRoute, locale);
  const heroAsset = selectRepresentativeAsset(
    page.canonicalRoute,
    "hero",
    assets,
  );
  if (heroAsset) representativeAssets[page.canonicalRoute] = heroAsset;

  return {
    page,
    entity,
    related,
    collection,
    assets,
    representativeAssets,
    archiveStats,
  };
}

export type ArchiveStats = {
  records: number;
  events: number;
  coursework: number;
  autobiographies: number;
  images: number;
  documents: number;
  videos: number;
};

export const archiveStats: ArchiveStats = {
  records: allContent.filter((entity) => entity.kind !== "page").length,
  events: events.filter((entity) => entity.route && !entity.localOnly).length,
  coursework: coursework.length,
  autobiographies: autobiographyEntries.length,
  images: (mediaManifest as ManifestAsset[]).filter((asset) => asset.kind === "image").length,
  documents: (mediaManifest as ManifestAsset[]).filter((asset) => asset.kind === "document").length,
  videos: videos.length,
};

export type RepresentativeAssetsMap = Record<string, PublicAsset>;

const teachingAndCommunicationIds = new Set([
  "event-015", // Engineering-mathematics notes
  "event-026", // NTU peer review sessions
  "event-027", // Chien Kuo science-club teaching
  "event-028", // Qingshui science outreach
  "event-029", // Zhongshan science camp
  "event-030", // Renai science camp
  "event-031", // After-school tutoring
  "event-058", // Taylor-series teaching video
  "event-059", // Popular mathematics writing
]);

/**
 * A deliberately curated milestone sequence. Ongoing degree labels and
 * autobiographies are not treated as news items simply because they contain a
 * date; each entry here marks a result, validation, transition, or recognition.
 */
const updateRoutes = [
  "/projects/jarvis",
  "/experience/ntu-gpa-a-plus-record",
  "/projects/aero-carrier",
  "/research/redrhex",
  "/experience/joining-ntu-biorola",
  "/projects/lkas",
  "/experience/premier12-2024-fan-memory",
  "/experience/ntu-academic-journey",
  "/experience/chien-kuo-gifted-class",
  "/experience/apmoc-apmo-tmo-selection",
  "/experience/chien-kuo-mathematics-competition",
  "/experience/apx-2021",
  "/experience/trml-captain-2020-2021",
  "/writing/mathematical-popular-writing-2021",
  "/writing/teaching/taylor-series-video",
  "/experience/amc-10a-2020",
  "/experience/gifted-mathematics-camp-2020",
  "/experience/rongshu-cup-2019-2020",
  "/experience/tmt8-2018",
  "/experience/mathleague-2016",
  "/experience/tamc7-2016",
] as const;

export function representativeAssetsForRoutes(
  routes: readonly string[],
  locale: Locale,
  role: MediaPresentationRole = "card",
): RepresentativeAssetsMap {
  const uniqueRoutes = [...new Set(routes)];

  return Object.fromEntries(uniqueRoutes.flatMap((route) => {
    const representative = selectRepresentativeAsset(
      route,
      role,
      assetsForRoute(route, locale),
    );
    return representative ? [[route, representative] as const] : [];
  }));
}

export function collectionForRoute(route: string): ContentEntity[] {
  const available = allContent.filter((entity) => entity.route && entity.route !== route);
  const sort = (items: ContentEntity[]) => [...items].sort(compareContentEntities);

  if (route === "/research") return sort(available.filter((entity) => entity.kind === "research"));
  if (route === "/projects") return sort(available.filter((entity) => entity.kind === "project"));
  if (route === "/academics") return sort(available.filter((entity) => entity.kind === "coursework" || entity.kind === "honor"));
  if (route === "/leadership") return sort(available.filter((entity) => entity.kind === "leadership" || entity.kind === "teaching_service"));
  if (route === "/writing") return sort(available.filter((entity) => entity.kind === "writing"));
  if (route === "/writing/teaching") return sort(available.filter((entity) => teachingAndCommunicationIds.has(entity.id)));
  if (route === "/academics/honors") return sort(available.filter((entity) => entity.kind === "honor"));
  if (route === "/personal") return sort(available.filter((entity) => entity.kind === "personal"));
  if (route === "/updates") return updateRoutes.flatMap((updateRoute) => {
    const entity = available.find((item) => item.route === updateRoute);
    return entity ? [entity] : [];
  });
  if (route === "/about") {
    return sort(available.filter((entity) =>
      ["experience", "personal"].includes(entity.kind)
      || entity.id.startsWith("autobiography-"),
    )).slice(0, 20);
  }
  if (route === "/archive") return sort(available.filter((entity) => entity.kind !== "page"));
  return [];
}

export type LandingCollectionGroup = {
  id: string;
  title: string;
  description: string;
  items: ContentEntity[];
};

type LandingGroupDefinition = {
  id: string;
  title: [string, string];
  description: [string, string];
  includes: (entity: ContentEntity) => boolean;
};

const mathematicsCategories = new Set(["Mathematics", "Mathematics & Computation"]);
const mechanicsCategories = new Set(["Mechanics & Dynamics", "Mechanics, Dynamics & Control"]);
const computationCategories = new Set(["Computation", "Experiments"]);
const designCategories = new Set(["Design & Systems", "Experiments & Design", "Design & Manufacturing"]);

/**
 * Build visitor-facing groups without duplicating or dropping an entity.
 *
 * Academics is organized by subject domain, matching the promise made in the
 * landing-page copy. Writing is organized by form. Other collections retain
 * the established university-first chronology.
 */
export function landingCollectionGroups(
  route: string,
  items: ContentEntity[],
  locale: Locale,
): LandingCollectionGroup[] {
  const languageIndex = locale === "en" ? 0 : 1;
  const definitions = groupDefinitionsForRoute(route);
  const assigned = new Set<string>();

  const groups = definitions.flatMap((definition) => {
    const groupItems = items.filter((item) => !assigned.has(item.id) && definition.includes(item));
    groupItems.forEach((item) => assigned.add(item.id));
    if (!groupItems.length) return [];
    return [{
      id: definition.id,
      title: definition.title[languageIndex],
      description: definition.description[languageIndex],
      items: groupItems,
    }];
  });

  const remaining = items.filter((item) => !assigned.has(item.id));
  if (remaining.length) {
    groups.push({
      id: "additional",
      title: locale === "en" ? "Additional records" : "其他相關紀錄",
      description: locale === "en"
        ? "Explore related work and experiences."
        : "其他相關作品與經歷。",
      items: remaining,
    });
  }

  return groups;
}

function groupDefinitionsForRoute(route: string): LandingGroupDefinition[] {
  if (route === "/academics") {
    return [
      {
        id: "academic-record",
        title: ["Academic record & calculation methods", "學業紀錄與計算方法"],
        description: [
          "The complete course record, GPA scopes, and documented conversion method used throughout this portfolio.",
          "整理完整修課紀錄、GPA 採計範圍，以及本網站採用的成績換算方法。",
        ],
        includes: (item) => item.route === "/experience/ntu-gpa-a-plus-record",
      },
      {
        id: "mathematics",
        title: ["Mathematical foundations", "數學基礎"],
        description: [
          "Proof, structure, numerical reasoning, and the mathematical language behind later engineering work.",
          "從證明、結構與數值推理，建立後續工程工作所需的數學語言。",
        ],
        includes: (item) => item.kind === "coursework" && mathematicsCategories.has(item.category),
      },
      {
        id: "mechanics-control",
        title: ["Mechanics, dynamics & control", "力學、動力學與控制"],
        description: [
          "Physical models, motion, stability, fluids, and control across analytical and implemented systems.",
          "涵蓋物理模型、運動、穩定性、流體與控制，連結解析推導與實作系統。",
        ],
        includes: (item) => item.kind === "coursework" && mechanicsCategories.has(item.category),
      },
      {
        id: "computation-experiments",
        title: ["Computation & experiments", "計算與實驗"],
        description: [
          "Programs, measurements, diagnostics, and validation practices that test whether an answer can be trusted.",
          "透過程式、量測、診斷與驗證，檢查一個答案是否值得信任。",
        ],
        includes: (item) => item.kind === "coursework" && computationCategories.has(item.category),
      },
      {
        id: "design-manufacturing",
        title: ["Design & manufacturing", "設計與製造"],
        description: [
          "CAD, fabrication, interfaces, iteration, and the constraints that turn an idea into a physical result.",
          "從 CAD、製造、介面與反覆迭代，看見構想如何在真實限制下成形。",
        ],
        includes: (item) => item.kind === "coursework" && designCategories.has(item.category),
      },
      {
        id: "honors",
        title: ["Honors & academic recognition", "榮譽與學術肯定"],
        description: [
          "University awards and earlier distinctions in mathematics and engineering.",
          "大學階段的學業與工程獎項，以及早期數學與科學競賽成果。",
        ],
        includes: (item) => item.kind === "honor",
      },
    ];
  }

  if (route === "/writing") {
    return [
      {
        id: "long-form",
        title: ["Long-form autobiographies", "完整自傳"],
        description: [
          "Two complete autobiographies in Traditional Chinese and English.",
          "兩篇完整自傳，分別提供繁體中文原文與英文譯文。",
        ],
        includes: (item) => item.id.startsWith("autobiography-"),
      },
      {
        id: "technical-research",
        title: ["Technical & research writing", "技術與研究寫作"],
        description: [
          "Research notes, software records, mathematical derivations, and technical reports.",
          "研究紀錄、程式成果、數學推導與技術報告。",
        ],
        includes: (item) => item.kind === "writing" && !teachingAndCommunicationIds.has(item.id),
      },
      {
        id: "teaching-communication",
        title: ["Teaching & mathematical communication", "教學與數學溝通"],
        description: [
          "Notes, lessons, videos, and explanations designed so another learner can follow and apply the ideas.",
          "將筆記、課程、影片與解說整理成他人能理解並運用的內容。",
        ],
        includes: (item) => teachingAndCommunicationIds.has(item.id),
      },
    ];
  }

  const currentTitle: [string, string] = route === "/about"
    ? ["Education, research & professional direction", "學業、研究與專業方向"]
    : route === "/personal"
      ? ["University life & personal interests", "大學生活與個人興趣"]
      : ["Current and university work", "大學階段與近期成果"];
  const currentDescription: [string, string] = route === "/about"
    ? [
        "Education, current research, and the experiences that shaped my professional direction.",
        "學業、目前研究，以及影響我專業方向的重要經歷。",
      ]
    : route === "/personal"
      ? [
          "University life, interests, service, and personal experiences.",
          "大學生活、興趣、服務與個人經歷。",
        ]
      : [
          "Recent research, engineering projects, coursework, and experiences.",
          "近期研究、工程專案、課程成果與相關經歷。",
        ];

  return [
    {
      id: "current",
      title: currentTitle,
      description: currentDescription,
      includes: (item) => ["university", "other"].includes(item.stage ?? "other"),
    },
    {
      id: "high-school",
      title: ["High-school foundations", "高中階段基礎"],
      description: [
        "Mathematics, leadership, teaching, research, and service from high school.",
        "高中階段的數學、領導、教學、研究與服務經歷。",
      ],
      includes: (item) => item.stage === "high_school",
    },
    {
      id: "earlier",
      title: ["Earlier foundations", "更早期的學習基礎"],
      description: [
        "Early mathematics and science study and competition results.",
        "國中階段與更早期的數學、科學學習及競賽成果。",
      ],
      includes: (item) => item.stage === "pre_high_school",
    },
  ];
}

export function searchEntries(locale: Locale) {
  const alternateLocale: Locale = locale === "en" ? "zh" : "en";
  return allContent
    .filter((entity) => entity.route && entity.route !== "/trusted")
    .sort(compareContentEntities)
    .map((entity) => ({
      path: entity.route!,
      title: entity.title[locale],
      summary: entity.card[locale],
      kind: localizedCategory(entity.category, locale),
      tags: [
        localizedCategory(entity.category, locale),
        localizedCategory(entity.category, alternateLocale),
        entity.title[alternateLocale],
        entity.card[alternateLocale],
        ...(entity.tags ?? []),
        ...(entity.route === "/academics/course-record" ? [courseRecordSearchKeywords(locale)] : []),
      ],
    }));
}

export function assetsForRoute(route: string, locale: Locale): PublicAsset[] {
  return (mediaManifest as ManifestAsset[])
    .filter((asset) => asset.route === route)
    .sort((left, right) => (
      left.kind.localeCompare(right.kind)
      || (left.displayOrder ?? 1_000) - (right.displayOrder ?? 1_000)
      || left.id.localeCompare(right.id)
    ))
    .map((asset) => {
      const titleEn = naturalizeEnAssetText(asset.titleEn);
      const titleZh = naturalizeZhAssetText(asset.titleZh);
      return {
        id: asset.id,
        publicPath: asset.publicPath,
        kind: asset.kind,
        alt: locale === "en"
          ? naturalizeEnAssetText(asset.altEn) ?? asset.altEn
          : naturalizeZhAssetText(asset.altZh) ?? asset.altZh,
        caption: locale === "en"
          ? naturalizeEnAssetCaption(asset.captionEn, titleEn)
          : naturalizeZhAssetCaption(asset.captionZh, titleZh),
        title: locale === "en" ? titleEn : titleZh,
        ...(asset.byteSize ? { size: formatBytes(asset.byteSize) } : {}),
        ...(asset.pageCount ? { pages: asset.pageCount } : {}),
        ...(asset.width ? { width: asset.width } : {}),
        ...(asset.height ? { height: asset.height } : {}),
        ...(asset.displayOrder ? { displayOrder: asset.displayOrder } : {}),
        ...(asset.placementSectionId ? { placementSectionId: asset.placementSectionId } : {}),
        ...(asset.previewPath ? { previewPath: asset.previewPath } : {}),
        ...(asset.variants?.avif?.publicPath ? { avifPath: asset.variants.avif.publicPath } : {}),
        ...(asset.variants?.webp?.publicPath ? { webpPath: asset.variants.webp.publicPath } : {}),
        ...(asset.variants?.fallback?.publicPath ? { fallbackPath: asset.variants.fallback.publicPath } : {}),
      };
    });
}

function naturalizeEnAssetText(value?: string): string | undefined {
  if (!value) return value;
  return value
    .replaceAll("Public Academic CV 2026-08", "Academic CV — August 2026")
    .replaceAll(" — Public Redacted Copy", " — Privacy-Redacted Copy")
    .replaceAll(" — 24-Slide Public Edition", "")
    .replaceAll(" (Archived)", "")
    .replaceAll("Geometry-Covering Optimization: Complete 36-Page Work", "Geometry-Covering Optimization — Complete 36-Page Report")
    .replaceAll("Jarvis team - NXP x Avnet challenge first prize", "Jarvis team after winning the NXP × Avnet challenge")
    .replaceAll("Jarvis team after receiving the enterprise award", "Jarvis team after receiving the corporate challenge award")
    .replaceAll("NXP x Avnet enterprise-award ceremony", "NXP × Avnet corporate challenge award ceremony")
    .replaceAll("Research-presentation website responsibility map", "Independent Research Symposium website responsibility chart")
    .trim();
}

function naturalizeZhAssetText(value?: string): string | undefined {
  if (!value) return value;
  return value
    .replaceAll("2026-08 公開學術履歷", "學術履歷｜2026 年 8 月")
    .replaceAll("｜公開遮蔽版", "｜隱私遮蔽版")
    .replaceAll("｜24 頁公開版", "")
    .replaceAll("LKAS 較早期專題報告（封存版）", "LKAS 早期專題報告")
    .replaceAll("JasonLiao", "Jason Liao ")
    .replaceAll("AeroCarrier", "Aero Carrier ")
    .replaceAll("BambuH2D", "Bambu H2D ")
    .replaceAll("3D列印", "3D 列印")
    .replace(/Inventor(?=[\p{Script=Han}])/gu, "Inventor ")
    .replace(/LKAS(?=[\p{Script=Han}])/gu, "LKAS ")
    .replace(/RedRHex(?=[\p{Script=Han}])/gu, "RedRHex ")
    .replace(/TRML(?=\d)/g, "TRML ")
    .replace(/(?<=[\p{Script=Han}])CAD/gu, " CAD")
    .replace(/CAD(?=[\p{Script=Han}])/gu, "CAD ")
    .replace(/Simulink(?=[\p{Script=Han}])/gu, "Simulink ")
    .replaceAll("RedRHex 結果影片幀", "RedRHex 結果影片畫面")
    .replace(/RedRHex 機構與配線側視(?!圖)/g, "RedRHex 機構與配線側視圖")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function naturalizeZhAssetCaption(caption: string, title?: string): string {
  return naturalizeZhAssetText(caption) ?? title ?? caption;
}

function naturalizeEnAssetCaption(caption: string, title?: string): string {
  return naturalizeEnAssetText(caption) ?? title ?? caption;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
