/* eslint-disable @next/next/no-img-element -- sources are pre-generated, metadata-scrubbed AVIF/WebP derivatives */
import { ArrowLeft, ArrowRight, Download, ExternalLink, FileText, Mail } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { academicRecordIntro, academicRecordText } from "@/lib/academic-record";
import { getEntityByCanonicalRoute, localizedCategory, type ContentEntity, type Locale, type ResolvedPage } from "@/lib/content-data";
import { maturityLabel } from "@/lib/content-labels";
import { parentRouteForEntity } from "@/lib/content-navigation";
import { getAutobiographyByRoute } from "@/lib/autobiographies";
import {
  getEventPublicDetail,
  type EventPublicDetailBlock,
} from "@/lib/event-public-details";
import {
  getCourseworkPublicDetail,
  type CourseworkPublicDetailBlock,
} from "@/lib/coursework-public-details";
import { landingCollectionGroups, type ArchiveStats } from "@/lib/page-runtime";
import type { PublicAsset } from "@/lib/public-assets";
import { localizePath, siteConfig } from "@/lib/site-config";
import { videosForRoute } from "@/lib/videos";
import { AutobiographyPage } from "./AutobiographyPage";
import { AcademicRecordProof } from "./AcademicRecordProof";
import { CourseRecordPage } from "./CourseRecordPage";
import { ElectronicContactCard } from "./ElectronicContactCard";
import { ResponsiveAssetImage } from "./ResponsiveAssetImage";
import { MediaLightbox } from "./MediaLightbox";
import { PortfolioArchivePage } from "./PortfolioArchivePage";
import { ProjectEvidenceCompare, type ProjectComparisonItem } from "./ProjectEvidenceCompare";
import { SectionNavigator } from "./SectionNavigator";
import { YouTubeEmbed } from "./YouTubeEmbed";

function lightboxAsset(asset: PublicAsset) {
  return {
    publicPath: asset.publicPath,
    alt: asset.alt,
    ...(asset.avifPath ? { avifPath: asset.avifPath } : {}),
    ...(asset.webpPath ? { webpPath: asset.webpPath } : {}),
    ...(asset.fallbackPath ? { fallbackPath: asset.fallbackPath } : {}),
  };
}

function entityCardCta(entity: ContentEntity, locale: Locale) {
  if (entity.route === "/experience/ntu-gpa-a-plus-record") {
    return locale === "en" ? "View GPA calculations" : "查看 GPA 計算說明";
  }
  const category = entity.category.toLowerCase();
  if (category.includes("research")) return locale === "en" ? "View research" : "查看研究";
  if (category.includes("project")) return locale === "en" ? "View project" : "查看專案";
  if (category.includes("course")) return locale === "en" ? "View coursework" : "查看課程成果";
  if (category.includes("honor")) return locale === "en" ? "View honor" : "查看獎項";
  if (category.includes("writing")) return locale === "en" ? "View writing" : "查看寫作";
  if (category.includes("leadership") || category.includes("teaching") || category.includes("service")) return locale === "en" ? "View experience" : "查看經歷";
  if (category.includes("personal") || category.includes("experience") || category.includes("education")) return locale === "en" ? "Read more" : "閱讀內容";
  return locale === "en" ? "View details" : "查看詳情";
}

type Props = {
  locale: Locale;
  page: ResolvedPage;
  entity: ContentEntity;
  related: ContentEntity[];
  collection: ContentEntity[];
  assets: PublicAsset[];
  representativeAssets?: Record<string, PublicAsset>;
  archiveStats: ArchiveStats;
};

function landingContextAction(route: string, locale: Locale) {
  const actions: Record<string, { route: string; en: string; zh: string }> = {
    "/about": {
      route: "/writing",
      en: "Read the complete autobiographies",
      zh: "閱讀兩篇完整自傳",
    },
    "/personal": {
      route: "/about",
      en: "View the professional overview",
      zh: "查看專業簡介",
    },
    "/writing": {
      route: "/about",
      en: "View the professional overview",
      zh: "查看專業簡介",
    },
  };
  const action = actions[route];
  return action ? { route: action.route, label: locale === "en" ? action.en : action.zh } : undefined;
}

export function PageView({ locale, page, entity, related, collection, assets, representativeAssets = {}, archiveStats }: Props) {
  const autobiography = getAutobiographyByRoute(page.canonicalRoute);
  if (autobiography) return <AutobiographyPage locale={locale} article={autobiography} />;

  const isCore = entity.kind === "page";
  const images = assets.filter((asset) => asset.kind === "image");
  const documents = assets.filter((asset) => asset.kind === "document");
  const videos = videosForRoute(page.canonicalRoute);
  const heroAsset = !isCore
    ? representativeAssets[page.canonicalRoute] ?? images[0] ?? documents.find((asset) => asset.previewPath)
    : undefined;
  const parentRoute = !isCore ? parentRouteForEntity(entity) : undefined;
  const parentEntity = parentRoute ? getEntityByCanonicalRoute(parentRoute) : undefined;
  const parent = parentRoute && parentEntity
    ? { label: parentEntity.title[locale], route: parentRoute }
    : undefined;
  const relatedWork = related.filter((item) => item.route !== parentRoute);

  if (page.canonicalRoute === "/contact") return <ContactPage locale={locale} page={page} />;
  if (page.canonicalRoute === "/cv") return <CvPage locale={locale} page={page} documents={documents} />;
  if (page.canonicalRoute === "/academics/course-record") return <CourseRecordPage locale={locale} page={page} document={documents[0]} />;
  if (page.canonicalRoute === "/archive") return <PortfolioArchivePage locale={locale} page={page} collection={collection} representativeAssets={representativeAssets} stats={archiveStats} />;

  return (
    <main id="main-content" className={`page-shell${isCore ? " page-shell--landing" : " page-shell--detail"}`} tabIndex={-1}>
      <header className={`page-hero${isCore ? " page-hero--landing" : " page-hero--case"}${heroAsset ? " page-hero--with-media" : ""}`}>
        <div className={`page-hero__inner${heroAsset ? " page-hero__inner--case-media" : ""}`}>
          <div className="page-hero__copy">
            {!isCore ? (
              <nav className="page-breadcrumb" aria-label={locale === "en" ? "Breadcrumb" : "路徑導覽"}>
                <a href={localizePath("/", locale)}>{locale === "en" ? "Home" : "首頁"}</a>
                {parent ? <><span aria-hidden="true">/</span><a href={localizePath(parent.route, locale)}>{parent.label}</a></> : null}
                <span aria-hidden="true">/</span><span aria-current="page">{page.title}</span>
              </nav>
            ) : null}
            <div className="page-hero__meta">
              <span className="chip chip--gold">{page.eyebrow}</span>
              {!isCore ? <span className="chip">{maturityLabel(page.maturity, locale)}</span> : null}
            </div>
            <h1>{page.title}</h1>
            <p className="page-hero__lede">{page.summary}</p>
            <div className="button-row page-hero__actions">
              {!isCore && documents[0] ? <a className="button" href={documents[0].publicPath} target="_blank" rel="noreferrer"><FileText size={16} />{locale === "en" ? "Open full document" : "開啟完整文件"}</a> : null}
              {!isCore && parent ? <a className="button button--quiet" href={localizePath(parent.route, locale)}><ArrowLeft size={16} />{locale === "en" ? `Back to ${parent.label}` : `回到${parent.label}`}</a> : null}
              {isCore ? <a className="button button--quiet" href={localizePath("/contact", locale)}>{locale === "en" ? "Contact me" : "聯絡我"}</a> : null}
            </div>
          </div>
          {heroAsset ? <HeroAsset locale={locale} asset={heroAsset} /> : null}
        </div>
      </header>

      {isCore ? (
        <LandingBody locale={locale} page={page} collection={collection} representativeAssets={representativeAssets} ownAssets={images} />
      ) : (
        <DetailBody locale={locale} page={page} images={images.filter((asset) => asset.id !== heroAsset?.id)} documents={documents} videos={videos} />
      )}

      {!isCore && relatedWork.length ? (
        <section className="section section--paper">
          <div className="container">
            <div className="section-header section-header--split">
              <div>
                <p className="eyebrow">{locale === "en" ? "Related work" : "延伸閱讀"}</p>
                <h2>{relatedWork[0].title[locale]}</h2>
              </div>
              <div>
                <p>{relatedWork[0].card[locale]}</p>
                <div className="button-row">
                  <a className="button" href={localizePath(relatedWork[0].route ?? "/", locale)}>{locale === "en" ? "View related work" : "繼續閱讀"}<ArrowRight size={16} /></a>
                </div>
              </div>
            </div>
            {relatedWork.length > 1 ? (
              <>
                <div className="section-header"><p className="eyebrow">{locale === "en" ? "More related work" : "相關內容"}</p><h2>{locale === "en" ? "Related projects, coursework, and experiences." : "其他相關研究、課程與經歷。"}</h2></div>
                <div className="card-grid card-grid--three">
                  {relatedWork.slice(1, 6).map((item) => <EntityCard locale={locale} entity={item} asset={representativeAssets[item.route ?? ""]} key={item.id} />)}
                </div>
              </>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}

const featuredRoutesByLanding: Record<string, string[]> = {
  "/research": ["/research/redrhex"],
  "/projects": ["/projects/aero-carrier", "/projects/jarvis", "/projects/lkas"],
  "/academics": [
    "/academics/numerical-analysis",
    "/academics/intermediate-dynamics",
    "/academics/engineering-mathematics",
    "/academics/mechanical-laboratory-ii",
    "/academics/linear-algebra-fft",
  ],
  "/leadership": [
    "/experience/ntu-bicycle-service-week",
    "/experience/ntu-civil-engineering-camp",
    "/experience/ntu-mechanical-orientation-staff",
    "/experience/ntu-peer-review-sessions",
  ],
  "/writing": [
    "/writing/autobiography/from-confusion-to-inner-coherence",
    "/writing/autobiography/gewu-xiangzhe-preface",
  ],
  "/about": [
    "/experience/ntu-academic-journey",
    "/experience/ntu-mechanical-engineering",
    "/experience/ntu-mathematics-minor",
  ],
};

const comparableProjectRoutes = [
  "/projects/aero-carrier",
  "/projects/jarvis",
  "/projects/lkas",
  "/projects/inventor-system-integration",
  "/projects/polar-arm",
] as const;

const evidenceFirstLandingRoutes = new Set([
  "/research",
  "/projects",
  "/academics",
  "/academics/honors",
  "/leadership",
  "/writing",
  "/writing/teaching",
  "/updates",
]);

function projectComparisonItems(collection: ContentEntity[], locale: Locale): ProjectComparisonItem[] {
  return comparableProjectRoutes.flatMap((route) => {
    const entity = collection.find((item) => item.route === route);
    if (!entity) return [];
    const section = (id: string) => entity.sections.find((item) => item.id === id)?.body?.[locale] ?? entity.card[locale];
    return [{
      id: entity.id,
      route: localizePath(route, locale),
      title: entity.title[locale],
      date: entity.dateLabel?.[locale],
      summary: entity.card[locale],
      maturity: maturityLabel(entity.maturity, locale),
      evidence: {
        question: section("question-constraints"),
        role: section("role-system"),
        turningPoint: section("turning-point"),
        validation: section("evaluation"),
        next: section("next"),
      },
    }];
  });
}

function featuredIntroForLanding(route: string, locale: Locale) {
  const english = locale === "en";
  if (route === "/academics") return {
    eyebrow: english ? "Selected coursework" : "代表課程成果",
    title: english ? "Five examples of mathematical and engineering work." : "五項數學與工程領域的代表成果。",
    description: english
      ? "Each page includes derivations, validation, diagnostic reasoning, and complete documentation."
      : "每項成果都包含推導、驗證、診斷過程與相關文件。",
  };
  if (route === "/writing") return {
    eyebrow: english ? "Autobiographies" : "自傳全文",
    title: english ? "Read both autobiographies in full." : "完整閱讀兩篇自傳。",
    description: english
      ? "Read the complete personal narratives, followed by technical, research, and teaching-related writing."
      : "兩篇自傳之後，亦可繼續閱讀技術報告、研究紀錄與教學寫作。",
  };
  if (route === "/about") return {
    eyebrow: english ? "Academic path" : "學術歷程",
    title: english ? "The academic path behind my current work." : "我的學術背景與目前方向。",
    description: english
      ? "Study across mechanical engineering and mathematics shows how mechanics, computation, and robotics converged into a coherent direction."
      : "機械工程與數學的跨域訓練，使力學、計算與機器人逐步成為目前的研究與工程方向。",
  };
  if (route === "/personal") return {
    eyebrow: english ? "Beyond academics" : "研究與課業之外",
    title: english ? "Life outside the classroom." : "課堂之外的生活。",
    description: english
      ? "Baseball, music, travel, service, and the relationships that have shaped me."
      : "棒球、音樂、旅行、服務與重要關係，也構成研究與課業之外的生活。",
  };
  return {
    eyebrow: english ? "Selected work" : "代表成果",
    title: english ? "Selected research and engineering projects." : "代表研究與工程專案。",
    description: english
      ? "Each entry presents the problem, my role, key decisions, and results."
      : "每項內容都說明問題、我的角色、關鍵決策與結果。",
  };
}

function collectionIntroForLanding(route: string, locale: Locale, count: number) {
  const english = locale === "en";
  if (route === "/academics") return {
    eyebrow: english ? "Browse by academic domain" : "依學術領域瀏覽",
    title: english ? "Coursework by field." : "依領域瀏覽課程成果。",
    description: english
      ? `${count} entries across mathematics, mechanics, computation, experiments, design, and academic honors.`
      : `共 ${count} 項內容，涵蓋數學、力學、計算、實驗、設計與學術榮譽。`,
  };
  if (route === "/writing") return {
    eyebrow: english ? "More writing" : "其他寫作",
    title: english ? "Technical writing, research notes, and teaching materials." : "技術報告、研究紀錄與教學材料。",
    description: english
      ? "Browse technical reports, software records, mathematical exposition, and teaching materials."
      : "內容涵蓋技術報告、程式紀錄、數學論述與教學材料。",
  };
  if (route === "/about") return {
    eyebrow: english ? "Education and experience" : "專業歷程與背景",
    title: english ? "Education, research, and professional direction." : "學歷、研究與專業方向。",
    description: english
      ? `${count} entries covering academic development, current research, and related experiences.`
      : `共 ${count} 項學歷與經歷，涵蓋學術發展、目前研究與工程方向。`,
  };
  if (route === "/personal") return {
    eyebrow: english ? "Interests and experiences" : "個人紀錄",
    title: english ? "Interests, service, relationships, and formative experiences." : "興趣、服務、關係與成長經歷。",
    description: english
      ? `${count} entries from university life, music, baseball, travel, and service.`
      : `共 ${count} 項內容，記錄大學生活、音樂、棒球、旅行與服務。`,
  };
  return {
    eyebrow: english ? "All entries" : "相關作品與經歷",
    title: english ? "Complete collection." : "本主題的作品與經歷",
    description: english
      ? `${count} entries, including project pages, reports, and supporting materials.`
      : `共 ${count} 項，包含相關專案、報告與補充資料。`,
  };
}

function landingGalleryCopy(route: string, locale: Locale) {
  const english = locale === "en";
  if (route === "/about") {
    return {
      eyebrow: english ? "Beyond the classroom" : "課堂之外",
      title: english ? "Personal photographs" : "個人照片",
      outline: english ? "Personal photographs" : "個人照片",
    };
  }
  if (route === "/academics/honors") {
    return {
      eyebrow: english ? "Academic record" : "學業紀錄",
      title: english ? "Spring 2026 course results" : "114-2 學期成績紀錄",
      outline: english ? "Course results" : "成績紀錄",
    };
  }
  return {
    eyebrow: english ? "Photographs and figures" : "照片與圖表",
    title: english ? "Visual documentation" : "影像資料",
    outline: english ? "Visual documentation" : "影像資料",
  };
}

function LandingBody({ locale, page, collection, representativeAssets, ownAssets }: { locale: Locale; page: ResolvedPage; collection: ContentEntity[]; representativeAssets: Record<string, PublicAsset>; ownAssets: PublicAsset[] }) {
  const explicitFeatured = featuredRoutesByLanding[page.canonicalRoute] ?? [];
  const automaticFeatured = collection
    .filter((item) => item.route && representativeAssets[item.route])
    .slice(0, page.canonicalRoute === "/personal" || page.canonicalRoute === "/about" ? 3 : 0)
    .map((item) => item.route!);
  const featuredRoutes = explicitFeatured.length ? explicitFeatured : automaticFeatured;
  const featured = featuredRoutes
    .map((route) => collection.find((item) => item.route === route))
    .filter((item): item is ContentEntity => Boolean(item));
  const featuredIds = new Set(featured.map((item) => item.id));
  const archive = collection.filter((item) => !featuredIds.has(item.id));
  const archiveGroups = landingCollectionGroups(page.canonicalRoute, archive, locale);
  const featuredIntro = featuredIntroForLanding(page.canonicalRoute, locale);
  const contextAction = landingContextAction(page.canonicalRoute, locale);
  const comparisonItems = page.canonicalRoute === "/projects" ? projectComparisonItems(collection, locale) : [];
  const projectsLanding = page.canonicalRoute === "/projects";
  const evidenceFirstLanding = evidenceFirstLandingRoutes.has(page.canonicalRoute);
  const galleryCopy = landingGalleryCopy(page.canonicalRoute, locale);
  const collectionIntro = projectsLanding
    ? {
        eyebrow: locale === "en" ? "More engineering projects" : "其他工程專案",
        title: locale === "en" ? "Additional work across design, control, fabrication, and integration." : "涵蓋設計、控制、製造與系統整合的其他工程成果。",
        description: locale === "en"
          ? `${archive.length} additional projects, each presenting its design process, individual responsibilities, and results.`
          : `另收錄 ${archive.length} 項專案，分別呈現設計過程、個人職責與成果。`,
      }
    : collectionIntroForLanding(page.canonicalRoute, locale, collection.length);
  const outlineItems = [
    ...(page.canonicalRoute === "/academics" ? [["academic-record", locale === "en" ? "Academic highlights" : "學業成果摘要"]] : []),
    ...(featured.length ? [["selected-work", locale === "en" ? "Selected work" : "精選成果"]] : []),
    ...(evidenceFirstLanding && archive.length ? [["all-records", projectsLanding ? (locale === "en" ? "More projects" : "其他專案") : (locale === "en" ? "All work" : "全部內容")]] : []),
    ...(ownAssets.length ? [["landing-visuals", galleryCopy.outline]] : []),
    ...(page.sections.length ? [["page-overview", locale === "en" ? "Overview" : "重點摘要"]] : []),
    ...(comparisonItems.length >= 2 ? [["project-comparison", locale === "en" ? "Compare projects" : "專案比較"]] : []),
    ...(!evidenceFirstLanding && archive.length ? [["all-records", locale === "en" ? "All work" : "全部內容"]] : []),
  ];

  return (
    <>
      {outlineItems.length > 1 ? (
        <nav className="landing-outline" aria-label={locale === "en" ? "On this page" : "本頁導覽"}>
          <div className="container landing-outline__inner">
            <span>{locale === "en" ? "On this page" : "本頁導覽"}</span>
            <div>
              {outlineItems.map(([id, label], index) => (
                <a href={`#${id}`} key={id}>
                  <small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      ) : null}
      {page.canonicalRoute === "/academics" ? <AcademicRecordSection locale={locale} /> : null}
      {featured.length ? (
        <section className="section section--featured-index" id="selected-work">
          <div className="container">
            <div className="section-header section-header--split">
              <div>
                <p className="eyebrow">{featuredIntro.eyebrow}</p>
                <h2>{featuredIntro.title}</h2>
                {contextAction ? <div className="button-row" style={{ marginTop: 18 }}><a className="button button--quiet" href={localizePath(contextAction.route, locale)}>{contextAction.label}<ArrowRight size={16} /></a></div> : null}
              </div>
              <p>{featuredIntro.description}</p>
            </div>
            <div className={`visual-feature-grid visual-feature-grid--${Math.min(featured.length, 5)}`}>
              {featured.map((item, index) => (
                <EntityCard
                  locale={locale}
                  entity={item}
                  asset={representativeAssets[item.route ?? ""]}
                  variant={index === 0 ? "featured-lead" : "featured"}
                  key={item.id}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {evidenceFirstLanding && archive.length ? <LandingCollectionIndex locale={locale} intro={collectionIntro} groups={archiveGroups} representativeAssets={representativeAssets} /> : null}
      {ownAssets.length ? <div id="landing-visuals"><Gallery locale={locale} images={ownAssets} eyebrow={galleryCopy.eyebrow} title={galleryCopy.title} /></div> : null}
      {page.sections.length ? (
        <section className="section section--graphite" id="page-overview">
          <div className="container">
            <div className="card-grid card-grid--two">
              {page.sections.map((section, index) => (
                <article className="strength-card" key={section.id}>
                  <div className="strength-card__number">{String(index + 1).padStart(2, "0")}</div>
                  <h3>{section.heading}</h3>
                  {section.body ? <p>{section.body}</p> : null}
                  {section.metrics?.length ? <div className="status-row">{section.metrics.map((metric) => <span className="chip chip--gold" key={`${section.id}-${metric.value}`}>{metric.value} · {metric.label}</span>)}</div> : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {comparisonItems.length >= 2 ? <ProjectEvidenceCompare locale={locale} items={comparisonItems} /> : null}
      {!evidenceFirstLanding && archive.length ? <LandingCollectionIndex locale={locale} intro={collectionIntro} groups={archiveGroups} representativeAssets={representativeAssets} /> : null}
    </>
  );
}

function LandingCollectionIndex({
  locale,
  intro,
  groups,
  representativeAssets,
}: {
  locale: Locale;
  intro: { eyebrow: string; title: string; description: string };
  groups: ReturnType<typeof landingCollectionGroups>;
  representativeAssets: Record<string, PublicAsset>;
}) {
  return (
    <section className="section section--paper section--collection-index" id="all-records">
      <div className="container">
        <div className="section-header section-header--split"><div><p className="eyebrow">{intro.eyebrow}</p><h2>{intro.title}</h2></div><p>{intro.description}</p></div>
        <div className="landing-collection-groups">
          {groups.map((group, index) => (
            <section className="landing-collection-group" key={group.id} aria-labelledby={`collection-${group.id}`}>
              <div className="landing-collection-group__heading">
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 id={`collection-${group.id}`}>{group.title}</h3>
                  <p>{group.description}</p>
                </div>
                <strong>{group.items.length} {locale === "en" ? (group.items.length === 1 ? "entry" : "entries") : "筆"}</strong>
              </div>
              <div className="visual-index-grid">
                {group.items.map((item) => (
                  <EntityCard locale={locale} entity={item} asset={representativeAssets[item.route ?? ""]} variant="index" key={item.id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function AcademicRecordSection({ locale, context = "academics" }: { locale: Locale; context?: "academics" | "cv" }) {
  const cvContext = context === "cv";
  return (
    <section className="section section--graphite academic-record-section" id="academic-record">
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <p className="eyebrow">{locale === "en" ? "Academic record" : "學業紀錄"}</p>
            <h2>
              {locale === "en"
                ? (cvContext ? "Academic preparation summarized in the CV." : "Academic preparation for mechanical engineering and robotics.")
                : (cvContext ? "履歷中的學業表現摘要。" : "機械工程與機器人研究的學術準備。")}
            </h2>
          </div>
          <p>{academicRecordText(academicRecordIntro, locale)}</p>
        </div>
        <AcademicRecordProof locale={locale} />
      </div>
    </section>
  );
}

function DetailBody({ locale, page, images, documents, videos }: { locale: Locale; page: ResolvedPage; images: PublicAsset[]; documents: PublicAsset[]; videos: ReturnType<typeof videosForRoute> }) {
  const completeEventDetail = getEventPublicDetail(page.canonicalRoute);
  const completeEventBlocks = completeEventDetail?.sourceStatus === "canonical_markdown"
    ? completeEventDetail.blocks[locale]
    : [];
  const completeCourseworkDetail = getCourseworkPublicDetail(page.canonicalRoute);
  const completeCourseworkBlocks = completeCourseworkDetail?.blocks[locale] ?? [];
  const completeDetailBlocks = completeEventBlocks.length
    ? completeEventBlocks
    : completeCourseworkBlocks;
  const completeDetailKind = completeCourseworkBlocks.length ? "coursework" : "event";
  const lastSectionIndex = Math.max(0, page.sections.length - 1);
  const imagePlacements = new Map<number, PublicAsset[]>();
  const imageSlots = page.sections.length > 1
    ? Array.from({ length: page.sections.length - 1 }, (_, index) => index + 1)
    : [0];
  images.forEach((image, index) => {
    const requestedSlot = image.placementSectionId
      ? page.sections.findIndex((section) => section.id === image.placementSectionId)
      : -1;
    const slotPosition = Math.min(
      imageSlots.length - 1,
      Math.floor((index * imageSlots.length) / Math.max(1, images.length)),
    );
    const slot = requestedSlot >= 0
      ? requestedSlot
      : imageSlots[slotPosition] ?? lastSectionIndex;
    imagePlacements.set(slot, [...(imagePlacements.get(slot) ?? []), image]);
  });
  const videoPlacements = new Map<number, typeof videos>();
  videos.forEach((video, index) => {
    const requestedSlot = video.placementSectionId
      ? page.sections.findIndex((section) => section.id === video.placementSectionId)
      : -1;
    const slot = requestedSlot >= 0
      ? requestedSlot
      : index === 0 ? 0 : Math.min(lastSectionIndex, index + 1);
    videoPlacements.set(slot, [...(videoPlacements.get(slot) ?? []), video]);
  });
  const toc = [
    ...page.sections.map((section) => [section.id, section.heading] as const),
    ...(completeDetailBlocks.length
      ? [[
          "complete-detail",
          completeDetailKind === "coursework"
            ? (locale === "en" ? "Coursework details" : "課程詳解")
            : (locale === "en" ? "Experience details" : "經歷詳情"),
        ] as const]
      : []),
    ...(documents.length ? [["artifacts", locale === "en" ? "Documents" : "相關文件"] as const] : []),
  ];

  return (
    <section className="section">
      <div className="container detail-layout">
        <SectionNavigator items={toc} label={locale === "en" ? "On this page" : "本頁目錄"} />
        <article className="prose">
          {page.sections.map((section, index) => {
            const sectionImages = imagePlacements.get(index) ?? [];
            const sectionVideos = videoPlacements.get(index) ?? [];
            const isBehindTheBuild = sectionVideos.some((video) => video.presentation === "behind-the-build");
            return (
              <div className="narrative-block" key={section.id}>
                <section id={section.id} className={/turn|decision|diagnos/i.test(section.id) ? "turning-point" : undefined}>
                  <p className="eyebrow">{String(index + 1).padStart(2, "0")} · {localizedCategory(page.category, locale)}</p>
                  <h2>{section.heading}</h2>
                  {section.body ? section.body.split(/\n\n+/).map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>) : null}
                  {section.bullets?.length ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
                  {section.metrics?.length ? <div className="proof-grid" style={{ marginTop: 26 }}>{section.metrics.map((metric) => <div className="proof" key={`${section.id}-${metric.value}`}><strong>{metric.value}</strong><span>{metric.label}{metric.context ? ` · ${metric.context}` : ""}</span></div>)}</div> : null}
                  {section.table ? <div className="prose-table-wrap"><table><thead><tr>{section.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{section.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div> : null}
                </section>
                {sectionVideos.length ? (
                  <div className="story-media story-media--video" id={index === 0 ? "demonstration" : undefined}>
                    <div className="story-media__heading">
                      <span>{isBehindTheBuild ? (locale === "en" ? "Project documentary" : "參賽全紀錄") : (locale === "en" ? "Demonstration" : "成果影片")}</span>
                      <p>{isBehindTheBuild
                        ? (locale === "en" ? "A documentary view of the pace, teamwork, and decisions behind the finished prototype." : "記錄原型完成前的工作節奏、團隊協作與關鍵取捨。")
                        : (locale === "en" ? "Watch the demonstration here or open it on YouTube." : "觀看原型展示與測試過程；也可前往 YouTube 播放。")}</p>
                    </div>
                    {sectionVideos.map((video) => <YouTubeEmbed video={video} locale={locale} key={video.id} />)}
                  </div>
                ) : null}
                {sectionImages.length ? (
                  <div className="story-media story-media--images" id={index === imageSlots[0] ? "visual-record" : undefined}>
                    <div className="story-media__heading"><span>{locale === "en" ? "Images and figures" : "圖片與圖表"}</span><p>{locale === "en" ? "Select an image to view it in detail." : "點選圖片即可放大查看細節。"}</p></div>
                    <GalleryGrid locale={locale} images={sectionImages} className="gallery-grid--narrative" />
                  </div>
                ) : null}
              </div>
            );
          })}
          {completeDetailBlocks.length ? (
            <CompletePublicDetail
              locale={locale}
              blocks={completeDetailBlocks}
              kind={completeDetailKind}
            />
          ) : null}
          {documents.length ? <section id="artifacts"><p className="eyebrow">{locale === "en" ? "Documents" : "相關文件"}</p><h2>{locale === "en" ? "Reports and documents" : "報告與文件"}</h2><div className="document-grid">{documents.map((document) => <DocumentCard locale={locale} asset={document} key={document.id} />)}</div></section> : null}
        </article>
      </div>
    </section>
  );
}

type CompletePublicDetailBlock = EventPublicDetailBlock | CourseworkPublicDetailBlock;

function CompletePublicDetail({
  locale,
  blocks,
  kind,
}: {
  locale: Locale;
  blocks: CompletePublicDetailBlock[];
  kind: "event" | "coursework";
}) {
  const isCoursework = kind === "coursework";
  return (
    <section id="complete-detail">
      <p className="eyebrow">
        {isCoursework
          ? (locale === "en" ? "Coursework details" : "課程詳解")
          : (locale === "en" ? "Experience details" : "經歷詳情")}
      </p>
      <h2>
        {isCoursework
          ? (locale === "en" ? "Methods, results, and reflection" : "方法、結果與反思")
          : (locale === "en" ? "Experience, responsibilities, and reflections" : "經歷、工作內容與收穫")}
      </h2>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "heading") {
          return block.level === 4
            ? <h4 key={key}>{inlineContent(block.text)}</h4>
            : <h3 key={key}>{inlineContent(block.text)}</h3>;
        }
        if (block.type === "paragraph") {
          return <p key={key}>{inlineContent(block.text)}</p>;
        }
        if (block.type === "list") {
          const items = block.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{inlineContent(item)}</li>
          ));
          return block.ordered
            ? <ol key={key}>{items}</ol>
            : <ul key={key}>{items}</ul>;
        }
        return (
          <div className="prose-table-wrap" key={key}>
            <table>
              <thead><tr>{block.headers.map((header, cellIndex) => <th key={`${key}-head-${cellIndex}`}>{inlineContent(header)}</th>)}</tr></thead>
              <tbody>{block.rows.map((row, rowIndex) => <tr key={`${key}-row-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${key}-cell-${rowIndex}-${cellIndex}`}>{inlineContent(cell)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
      })}
    </section>
  );
}

function inlineContent(text: string): ReactNode[] {
  const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\)|https?:\/\/[^\s]+)/g;
  const output: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > cursor) output.push(text.slice(cursor, match.index));
    const token = match[0];
    const key = `${match.index}-${token.length}`;
    if (token.startsWith("**")) {
      output.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      output.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      const markdownLink = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      const href = markdownLink?.[2] ?? token;
      const label = markdownLink?.[1] ?? token;
      output.push(<a href={href} target="_blank" rel="noreferrer" key={key}>{label}</a>);
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) output.push(text.slice(cursor));
  return output;
}

function Gallery({ locale, images, eyebrow, title }: { locale: Locale; images: PublicAsset[]; eyebrow: string; title: string }) {
  return <section className="section"><div className="container"><div className="section-header"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><GalleryGrid locale={locale} images={images} /></div></section>;
}

function GalleryGrid({ locale, images, className }: { locale: Locale; images: PublicAsset[]; className?: string }) {
  const ratios = images.map((image) => image.width && image.height ? image.width / image.height : 1);
  const firstRatio = ratios[0] ?? 1;
  const isBalancedPortraitPair = images.length === 2 && ratios.every((ratio) => ratio < 1);
  const isMixedPair = images.length === 2
    && ratios.some((ratio) => ratio < 1.05)
    && ratios.some((ratio) => ratio >= 1.05);
  const hasCenteredLandscapeOrphan = images.length > 1
    && images.length % 2 === 1
    && ratios.every((ratio) => ratio >= 1.05 && ratio < 1.75);
  const gridClassName = [
    "gallery-grid",
    className ?? "",
    images.length === 1 ? "gallery-grid--single" : "",
    images.length === 1 && firstRatio < 0.82 ? "gallery-grid--single-portrait" : "",
    isBalancedPortraitPair ? "gallery-grid--balanced-pair" : "",
    isMixedPair ? "gallery-grid--mixed-pair" : "",
  ].filter(Boolean).join(" ");
  const gridStyle = isBalancedPortraitPair ? {
    "--gallery-column-a": `${firstRatio.toFixed(3)}fr`,
    "--gallery-column-b": `${(ratios[1] ?? 1).toFixed(3)}fr`,
  } as CSSProperties : undefined;

  return (
    <div className={gridClassName} style={gridStyle}>
      {images.map((asset, index) => {
        const caption = asset.title?.trim() || asset.caption?.trim();
        const ratio = asset.width && asset.height ? asset.width / asset.height : 1.38;
        const orientation = ratio >= 1.75 ? "panoramic" : ratio <= 0.82 ? "portrait" : "standard";
        const isCenteredOrphan = hasCenteredLandscapeOrphan && index === images.length - 1;
        const useFullWidth = isMixedPair
          || images.length === 1
          || ratio >= 1.75
          || (images.length <= 2 && ratio >= 1.05)
          || (index === 0 && images.length >= 3 && ratio >= 1.45)
          || isCenteredOrphan;
        return (
          <div className={`gallery-item gallery-item--${orientation}${useFullWidth ? " gallery-item--full" : ""}${isCenteredOrphan ? " gallery-item--centered-orphan" : ""}${isMixedPair && ratio < 1.05 ? " gallery-item--mixed-pair-compact" : ""}`} key={asset.id}>
            <div className="gallery-item__media">
              <MediaLightbox
                asset={lightboxAsset(asset)}
                width={asset.width ?? 900}
                height={asset.height ?? 650}
                locale={locale}
                title={caption}
                className="gallery-item__lightbox"
              />
            </div>
            {caption ? (
              <div className="gallery-item__caption-row">
                <span className="gallery-item__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="gallery-item__caption">{caption}</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function EntityCard({ locale, entity, asset, variant = "standard" }: { locale: Locale; entity: ContentEntity; asset?: PublicAsset; variant?: "standard" | "featured" | "featured-lead" | "index" }) {
  const ratio = asset?.kind === "image" && asset.width && asset.height ? asset.width / asset.height : undefined;
  const style = ratio ? { "--card-media-ratio": String(Math.min(2.1, Math.max(.72, ratio))) } as CSSProperties : undefined;
  return (
    <a className={`case-card case-card--${variant}${asset ? " case-card--with-media" : " case-card--without-media"}${asset?.kind === "document" ? " case-card--document" : ""}`} href={localizePath(entity.route ?? "/", locale)}>
      {asset ? (
        <div className={`case-card__media${asset.kind === "document" ? " case-card__media--document" : ""}`} style={style}>
          {asset.kind === "image" ? (
            <ResponsiveAssetImage asset={asset} width={asset.width ?? 960} height={asset.height ?? 720} />
          ) : asset.previewPath ? (
            <img src={asset.previewPath} alt={asset.alt} width="640" height="820" loading="lazy" decoding="async" />
          ) : (
            <span className="case-card__media-fallback" aria-hidden="true">{entity.category.slice(0, 2).toUpperCase()}</span>
          )}
          <span className="case-card__media-label">{asset.kind === "document" ? (locale === "en" ? "Full report" : "完整文件") : localizedCategory(entity.category, locale)}</span>
        </div>
      ) : null}
      <div className="case-card__body">
        <div className="case-card__meta"><span>{localizedCategory(entity.category, locale)}</span><span>·</span><span>{maturityLabel(entity.maturity, locale)}</span>{entity.dateLabel?.[locale] ? <><span>·</span><span>{entity.dateLabel[locale]}</span></> : null}</div>
        <h3>{entity.title[locale]}</h3>
        <p>{entity.card[locale]}</p>
        <div className="case-card__footer"><span>{entityCardCta(entity, locale)}</span><ArrowRight size={17} /></div>
      </div>
    </a>
  );
}

function HeroAsset({ locale, asset }: { locale: Locale; asset: PublicAsset }) {
  const caption = asset.title?.trim() || asset.caption?.trim();
  return (
    <div className={`case-hero-media case-hero-media--${asset.kind}`}>
      <div className="case-hero-media__frame">
        {asset.kind === "image" ? (
          <MediaLightbox asset={lightboxAsset(asset)} width={asset.width ?? 1200} height={asset.height ?? 900} locale={locale} title={caption} className="case-hero-media__lightbox" eager />
        ) : asset.previewPath ? (
          <img src={asset.previewPath} alt={asset.alt} width="760" height="980" decoding="async" fetchPriority="high" />
        ) : null}
      </div>
      <div className="case-hero-media__caption"><span>{asset.kind === "image" ? (locale === "en" ? "Featured image" : "代表圖片") : (locale === "en" ? "Featured document" : "代表文件")}</span>{caption ? <strong>{caption}</strong> : null}</div>
    </div>
  );
}

function DocumentCard({ locale, asset }: { locale: Locale; asset: PublicAsset }) {
  const pageCount = asset.pages
    ? (locale === "en" ? `${asset.pages} ${asset.pages === 1 ? "page" : "pages"}` : `${asset.pages} 頁`)
    : "PDF";
  const title = asset.title ?? (locale === "en" ? "Document" : "文件");
  const caption = asset.caption?.trim();
  const showCaption = Boolean(caption && caption !== title);
  return <article className="document-card"><div className="document-card__cover" aria-hidden="true">{asset.previewPath ? <img src={asset.previewPath} alt="" width="260" height="340" loading="lazy" decoding="async" /> : <>PDF<br />{locale === "en" ? "FULL TEXT" : "全文"}</>}</div><div className="document-card__content"><div className="document-card__meta"><span>{pageCount}</span>{asset.size ? <span>{asset.size}</span> : null}<span>{locale === "en" ? "PDF document" : "PDF 文件"}</span></div><h3>{title}</h3>{showCaption ? <p>{caption}</p> : null}<div className="button-row"><a className="button button--small" href={asset.publicPath} target="_blank" rel="noreferrer">{locale === "en" ? "Open" : "開啟"}<ExternalLink size={14} /></a><a className="button button--small button--quiet" href={asset.publicPath} download>{locale === "en" ? "Download PDF" : "下載 PDF"}<Download size={14} /></a></div></div></article>;
}

function CvPage({ locale, page, documents }: { locale: Locale; page: ResolvedPage; documents: PublicAsset[] }) {
  const cv = documents.find((document) => document.publicPath === siteConfig.cvPath) ?? documents[0];
  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <header className="page-hero"><div className="page-hero__inner"><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p className="page-hero__lede">{page.summary}</p><div className="button-row page-hero__actions"><a className="button" href={siteConfig.cvPath} download><Download size={16} />{locale === "en" ? "Download CV" : "下載 CV"}</a><a className="button button--quiet" href={siteConfig.cvPath} target="_blank" rel="noreferrer">{locale === "en" ? "Open in browser" : "在瀏覽器開啟"}<ExternalLink size={15} /></a></div></div></header>
      <AcademicRecordSection locale={locale} context="cv" />
      <section className="section section--paper"><div className="container">
        <div className="section-header section-header--split"><div><p className="eyebrow">{locale === "en" ? "Academic CV" : "學術履歷"}</p><h2>{locale === "en" ? "A concise two-page overview for academic and research applications." : "兩頁精要，涵蓋學術背景與代表成果。"}</h2></div><p>{locale === "en" ? "The CV summarizes my education, academic record, research, projects, honors, teaching, and leadership, with links to the corresponding work on this site." : "履歷整理學歷、學業表現、研究、工程專案、獎項、教學與領導經驗，並連結至網站中的相關成果。"}</p></div>
        <div className="document-card document-card--featured"><div className="document-card__cover" aria-hidden="true">{cv?.previewPath ? <img src={cv.previewPath} alt="" width="520" height="680" loading="eager" decoding="async" /> : <>CV<br />2026</>}</div><div className="document-card__content"><div className="document-card__meta"><span>{locale === "en" ? "2 pages" : "2 頁"}</span><span>PDF</span></div><h3>{cv?.title ?? (locale === "en" ? "Academic CV" : "學術履歷")}</h3><p>{locale === "en" ? "Two-page academic CV in PDF format." : "兩頁學術履歷，提供 PDF 閱覽與下載。"}</p><div className="button-row"><a className="button" href={siteConfig.cvPath} target="_blank" rel="noreferrer">{locale === "en" ? "Open CV" : "開啟 CV"}</a><a className="button button--quiet" href={siteConfig.cvPath} download>{locale === "en" ? "Download" : "下載"}<Download size={15} /></a></div></div></div>
      </div></section>
    </main>
  );
}

function ContactPage({ locale, page }: { locale: Locale; page: ResolvedPage }) {
  const quickPaths = [
    {
      number: "01",
      title: locale === "en" ? "Research" : "研究",
      description: locale === "en" ? "RedRHex and geometry" : "RedRHex 與幾何研究",
      href: localizePath("/research", locale),
    },
    {
      number: "02",
      title: locale === "en" ? "Projects" : "專案",
      description: locale === "en" ? "Engineering projects and prototypes" : "系統實作",
      href: localizePath("/projects", locale),
    },
    {
      number: "03",
      title: "CV",
      description: locale === "en" ? "Two-page academic CV" : "兩頁學術履歷",
      href: siteConfig.cvPath,
      external: true,
    },
  ];

  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="page-hero__lede">{page.summary}</p>
        </div>
      </header>

      <section className="section section--paper contact-section">
        <div className="container feature-split contact-layout">
          <div className="contact-intro">
            <p className="eyebrow">
              {locale === "en" ? "Contact" : "聯絡我"}
            </p>
            <h2 className="contact-heading">
              {locale === "en"
                ? "Please include the opportunity or question, relevant context, and any next steps or deadlines."
                : "請簡要說明合作機會或問題、相關背景，以及預計的下一步或時程。"}
            </h2>
            <p className="contact-copy">
              {locale === "en"
                ? "I welcome conversations about robotics, learning-based control, mechanical systems, applied mathematics, research opportunities, internships, and technical collaboration."
                : "歡迎來信討論機器人、學習式控制、機械系統、應用數學、研究機會、實習或技術合作。"}
            </p>
            <a
              className="button contact-email"
              href={`mailto:${siteConfig.email}?subject=${encodeURIComponent("Portfolio inquiry — Jason Liao")}`}
            >
              <Mail size={16} />
              <span>{siteConfig.email}</span>
            </a>
          </div>

          <aside className="turning-point contact-quick-panel" aria-labelledby="contact-quick-title">
            <p className="eyebrow">{locale === "en" ? "Quick paths" : "快速入口"}</p>
            <h2 className="contact-quick-title" id="contact-quick-title">
              {locale === "en" ? "Suggested starting points" : "聯絡前可先查看"}
            </h2>
            <nav className="contact-quick-list" aria-label={locale === "en" ? "Suggested pages" : "建議先查看的頁面"}>
              {quickPaths.map((item) => (
                <a
                  className="contact-quick-row"
                  href={item.href}
                  key={item.number}
                  {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  <span className="contact-quick-row__number" aria-hidden="true">{item.number}</span>
                  <span className="contact-quick-row__copy">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </section>

      <section id="professional-contact-card" className="section section--graphite contact-card-section">
        <div className="container">
          <header className="section-header section-header--split contact-card-section__header">
            <div>
              <p className="eyebrow">{locale === "en" ? "Professional contact card" : "專業電子名片"}</p>
              <h2>{locale === "en" ? "Direct contact, when you need it." : "需要進一步聯繫時，可在此查看完整資料。"}</h2>
            </div>
            <p>{locale === "en" ? "Email is available to everyone. Invited visitors may sign in to view direct contact details, professional profiles, and a portable contact card." : "Email 對所有訪客開放；受邀者登入後，可查看電話、專業社群與可攜式聯絡名片。"}</p>
          </header>
          <ElectronicContactCard
            locale={locale}
            placement="contact"
            publicEmail={siteConfig.email}
            redirectTo={`${localizePath("/contact", locale)}#professional-contact-card`}
          />
        </div>
      </section>
    </main>
  );
}
