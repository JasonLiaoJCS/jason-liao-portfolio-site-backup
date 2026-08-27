/* eslint-disable @next/next/no-img-element -- public previews are pre-generated, metadata-scrubbed derivatives */
import { ArrowRight, FileText, Network } from "lucide-react";
import type { ContentEntity, Locale, ResolvedPage } from "@/lib/content-data";
import { localizedCategory } from "@/lib/content-data";
import type { ArchiveStats, RepresentativeAssetsMap } from "@/lib/page-runtime";
import type { PublicAsset } from "@/lib/public-assets";
import { localizePath } from "@/lib/site-config";
import { BrandLogo } from "./BrandLogo";
import { PortfolioConstellation, type ConstellationGroup, type ConstellationItem } from "./PortfolioConstellation";
import { ResponsiveAssetImage } from "./ResponsiveAssetImage";

type Props = {
  locale: Locale;
  page: ResolvedPage;
  collection: ContentEntity[];
  representativeAssets: RepresentativeAssetsMap;
  stats: ArchiveStats;
};

const stageGroups = [
  {
    id: "university",
    stages: new Set(["university", "other"]),
    title: { en: "University and current work", zh: "大學階段與近期成果" },
    description: {
      en: "Current research, engineering projects, coursework, writing, leadership, and service.",
      zh: "目前的研究、工程專案、課程成果、寫作、領導與服務。",
    },
  },
  {
    id: "high-school",
    stages: new Set(["high_school"]),
    title: { en: "High-school foundations", zh: "高中階段成果" },
    description: {
      en: "Mathematics, research, leadership, teaching, and service from Chien Kuo High School.",
      zh: "高中階段的數學訓練、研究、領導、教學、服務與代表作品。",
    },
  },
  {
    id: "earlier",
    stages: new Set(["pre_high_school"]),
    title: { en: "Earlier foundations", zh: "國中階段與更早的學習基礎" },
    description: {
      en: "Early mathematics and science study and competition results.",
      zh: "早期數學與科學學習及競賽成果。",
    },
  },
] as const;

const kindOrder = [
  "research",
  "project",
  "coursework",
  "honor",
  "leadership",
  "teaching_service",
  "writing",
  "experience",
  "personal",
] as const;

const kindLabels: Record<string, { en: string; zh: string }> = {
  research: { en: "Research", zh: "研究" },
  project: { en: "Projects", zh: "工程專案" },
  coursework: { en: "Coursework", zh: "課程成果" },
  honor: { en: "Honors", zh: "榮譽與競賽" },
  leadership: { en: "Leadership", zh: "領導" },
  teaching_service: { en: "Teaching & Service", zh: "教學與服務" },
  writing: { en: "Writing", zh: "寫作" },
  experience: { en: "Experience", zh: "經歷" },
  personal: { en: "Personal", zh: "個人" },
};

const pathLinks = [
  ["Research", "研究", "/research"],
  ["Projects", "工程專案", "/projects"],
  ["Academics", "學術與課程", "/academics"],
  ["Leadership", "領導與服務", "/leadership"],
  ["Writing", "寫作", "/writing"],
  ["About", "關於我", "/about"],
] as const;

const constellationBlueprint: Array<{
  route: string;
  group: ConstellationGroup;
  x: number;
  y: number;
  labelPlacement?: "above" | "below";
}> = [
  { route: "/research/redrhex", group: "research", x: 500, y: 72 },
  { route: "/research/geometry-covering", group: "research", x: 170, y: 140 },
  { route: "/projects/jarvis", group: "systems", x: 820, y: 132 },
  { route: "/projects/aero-carrier", group: "systems", x: 900, y: 305 },
  { route: "/academics/numerical-analysis", group: "academics", x: 340, y: 205 },
  { route: "/academics/intermediate-dynamics", group: "academics", x: 620, y: 205 },
  { route: "/experience/chien-kuo-gifted-class", group: "academics", x: 112, y: 330 },
  { route: "/experience/trml-captain-2020-2021", group: "people", x: 205, y: 505 },
  { route: "/experience/qingshui-science-outreach", group: "people", x: 400, y: 390, labelPlacement: "above" },
  { route: "/experience/zhongshan-primary-science-camp", group: "people", x: 405, y: 548 },
  { route: "/experience/ntu-civil-night-vocalist", group: "people", x: 650, y: 375, labelPlacement: "above" },
  { route: "/experience/chien-kuo-chorus-best-soloist", group: "people", x: 690, y: 535, labelPlacement: "below" },
  { route: "/experience/ntu-mechanical-baseball-team", group: "people", x: 842, y: 472 },
  { route: "/experience/baseball-fandom", group: "people", x: 910, y: 565 },
];

export function PortfolioArchivePage({ locale, page, collection, representativeAssets, stats }: Props) {
  const english = locale === "en";
  const populatedStages = stageGroups.flatMap((group) => {
    const items = collection.filter((item) => group.stages.has(item.stage ?? "other"));
    return items.length ? [{ ...group, items }] : [];
  });
  const kindJumps = kindOrder.flatMap((kind) => {
    const firstStage = populatedStages.find((group) => group.items.some((item) => item.kind === kind));
    return firstStage ? [{ kind, stageId: firstStage.id, label: kindLabels[kind][locale] }] : [];
  });
  const collectionByRoute = new Map(collection.flatMap((entity) => entity.route ? [[entity.route, entity] as const] : []));
  const constellationRoutes = new Set(constellationBlueprint.map((item) => item.route));
  const constellationEntities = constellationBlueprint.flatMap((item) => {
    const entity = collectionByRoute.get(item.route);
    return entity ? [{ blueprint: item, entity }] : [];
  });
  const adjacency = new Map(constellationEntities.map(({ entity }) => [entity.id, new Set<string>()]));
  constellationEntities.forEach(({ entity }) => {
    entity.relatedRoutes.filter((route) => constellationRoutes.has(route)).forEach((route) => {
      const connected = collectionByRoute.get(route);
      if (!connected) return;
      adjacency.get(entity.id)?.add(connected.id);
      adjacency.get(connected.id)?.add(entity.id);
    });
  });
  const constellationItems: ConstellationItem[] = constellationEntities.map(({ blueprint, entity }) => {
    const asset = representativeAssets[blueprint.route];
    const image = asset?.kind === "image"
      ? {
          publicPath: asset.publicPath,
          alt: asset.alt,
          avifPath: asset.avifPath,
          webpPath: asset.webpPath,
          fallbackPath: asset.fallbackPath,
          width: asset.width ?? 960,
          height: asset.height ?? 640,
        }
      : asset?.previewPath
        ? { publicPath: asset.previewPath, fallbackPath: asset.previewPath, alt: asset.alt, width: 640, height: 820 }
        : undefined;
    return {
      id: entity.id,
      route: localizePath(blueprint.route, locale),
      title: entity.title[locale],
      summary: entity.card[locale],
      category: localizedCategory(entity.category, locale),
      date: entity.dateLabel?.[locale],
      group: blueprint.group,
      x: blueprint.x,
      y: blueprint.y,
      labelPlacement: blueprint.labelPlacement,
      connections: [...(adjacency.get(entity.id) ?? [])],
      image,
    };
  });

  return (
    <main id="main-content" className="page-shell archive-page" tabIndex={-1}>
      <header className="archive-hero">
        <div className="container archive-hero__grid">
          <div className="archive-hero__copy">
            <p className="eyebrow">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
            <div className="archive-hero__paths" aria-label={english ? "Portfolio sections" : "作品集分類"}>
              <a className="archive-hero__primary-link" href="#archive-all"><FileText size={15} aria-hidden="true" />{english ? "Browse the complete index" : "瀏覽完整索引"}<ArrowRight size={15} /></a>
              <a href="#portfolio-constellation"><Network size={15} aria-hidden="true" />{english ? "Open the constellation" : "開啟互動星圖"}<ArrowRight size={15} /></a>
              {pathLinks.map(([en, zh, route]) => (
                <a href={localizePath(route, locale)} key={route}>{english ? en : zh}<ArrowRight size={15} /></a>
              ))}
            </div>
          </div>
          <div className="archive-identity" aria-label={english ? "Jason Liao identity mark" : "廖致翔網站主識別"}>
            <BrandLogo eager />
            <div>
              <span>{english ? "Portfolio overview" : "作品集總覽"}</span>
              <strong>{english ? "Research, projects, coursework, and supporting materials." : "研究、工程專案、課程成果與相關資料。"}</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="section section--tight archive-stats" aria-label={english ? "Portfolio at a glance" : "作品集收錄概況"}>
        <div className="container archive-stats__grid">
          <ArchiveStat value={stats.records} label={english ? "portfolio entries" : "項作品與經歷"} />
          <ArchiveStat value={stats.coursework} label={english ? "coursework entries" : "門課程成果"} />
          <ArchiveStat value={stats.images} label={english ? "images" : "張影像"} />
          <ArchiveStat value={stats.documents} label={english ? "documents" : "份文件"} />
          <ArchiveStat value={stats.videos} label={english ? "videos" : "支影片"} />
          <ArchiveStat value={stats.autobiographies} label={english ? "full autobiographies" : "篇自傳全文"} />
        </div>
      </section>

      <section className="section section--paper archive-map" id="archive-all">
        <div className="container">
          <div className="section-header section-header--split">
            <div>
              <p className="eyebrow">{english ? "Complete index" : "完整索引"}</p>
              <h2>{english ? "From current university work to earlier foundations." : "從近期研究與工程實作，回溯早期數學學習。"}</h2>
            </div>
            <p>{english ? "Browse by stage, then explore research, projects, coursework, honors, leadership, teaching, writing, or personal milestones." : "先依學習階段瀏覽，再查看研究、專案、課程、榮譽、領導、教學、寫作或個人紀錄。"}</p>
          </div>

          <nav className="button-row" style={{ marginBottom: 28 }} aria-label={english ? "Jump to a record type" : "依內容類型快速前往"}>
            <a className="button button--quiet button--small" href="#archive-all">{english ? "All records" : "全部紀錄"}<ArrowRight size={15} /></a>
            {kindJumps.map(({ kind, stageId, label }) => (
              <a className="button button--quiet button--small" href={`#archive-kind-${stageId}-${kind}`} key={kind}>{label}<ArrowRight size={15} /></a>
            ))}
          </nav>

          <div className="archive-stage-list">
            {populatedStages.map((group, index) => {
              const stageItems = group.items;
              return (
                <details className="archive-stage" open={index === 0} key={group.id}>
                  <summary>
                    <span className="archive-stage__index">0{index + 1}</span>
                    <span><strong>{group.title[locale]}</strong><small>{group.description[locale]}</small></span>
                    <span className="archive-stage__count">{stageItems.length} {english ? "records" : "筆"}</span>
                  </summary>
                  <div className="archive-stage__body">
                    {kindOrder.map((kind) => {
                      const items = stageItems.filter((item) => item.kind === kind);
                      if (!items.length) return null;
                      return (
                        <section className="archive-kind" id={`archive-kind-${group.id}-${kind}`} style={{ scrollMarginTop: 112 }} key={`${group.id}-${kind}`}>
                          <div className="archive-kind__heading">
                            <h3>{kindLabels[kind][locale]}</h3>
                            <span>{items.length}</span>
                          </div>
                          <div className="archive-record-grid">
                            {items.map((item) => (
                              <ArchiveRecordCard
                                locale={locale}
                                entity={item}
                                asset={representativeAssets[item.route ?? ""]}
                                key={item.id}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      <PortfolioConstellation locale={locale} items={constellationItems} />
    </main>
  );
}

function ArchiveStat({ value, label }: { value: number; label: string }) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}

function ArchiveRecordCard({ locale, entity, asset }: { locale: Locale; entity: ContentEntity; asset?: PublicAsset }) {
  const route = entity.route ?? "/archive";
  const preview = asset?.kind === "document" ? asset.previewPath : undefined;
  return (
    <a
      className={`archive-record-card${asset ? " archive-record-card--visual" : ""}`}
      data-archive-entity={entity.id}
      href={localizePath(route, locale)}
    >
      <div className="archive-record-card__media" aria-hidden={!asset}>
        {asset?.kind === "image" ? (
          <ResponsiveAssetImage asset={asset} width={asset.width ?? 640} height={asset.height ?? 480} />
        ) : preview ? (
          <img src={preview} alt="" width="320" height="426" loading="lazy" decoding="async" />
        ) : (
          <span>{entity.kind === "coursework" ? "C" : entity.kind === "project" ? "P" : entity.kind === "research" ? "R" : "JL"}</span>
        )}
        {asset?.kind === "document" ? <FileText size={15} /> : null}
      </div>
      <div className="archive-record-card__copy">
        <div className="archive-record-card__meta">
          <span>{localizedCategory(entity.category, locale)}</span>
          {entity.dateLabel?.[locale] ? <small>{entity.dateLabel[locale]}</small> : null}
        </div>
        <h4>{entity.title[locale]}</h4>
        <p>{entity.card[locale]}</p>
        <span className="archive-record-card__action">
          {locale === "en" ? "View details" : "查看詳情"}
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}
