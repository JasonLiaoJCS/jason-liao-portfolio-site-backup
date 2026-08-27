import { ArrowRight, Download, FlaskConical, Layers3, Sigma, UsersRound } from "lucide-react";
import { localizedCategory, type ContentEntity, type Locale } from "@/lib/content-data";
import { maturityLabel } from "@/lib/content-labels";
import { localizePath, siteConfig } from "@/lib/site-config";
import { videos } from "@/lib/videos";
import { AcademicRecordProof } from "./AcademicRecordProof";
import { BrandLogo } from "./BrandLogo";
import { CapabilityAtlas } from "./CapabilityAtlas";
import { PortfolioCinema } from "./PortfolioCinema";
import { PortfolioTrajectory } from "./PortfolioTrajectory";
import { ProcessLab } from "./ProcessLab";
import type { ImageAsset } from "./ResponsiveAssetImage";
import { ResponsiveAssetImage } from "./ResponsiveAssetImage";

type Props = {
  locale: Locale;
  page: ContentEntity;
  find: (route: string) => ContentEntity | undefined;
  media: (route: string) => Array<ImageAsset & { caption?: string; width?: number; height?: number }>;
};

const strengths = [
  [Sigma, "Academic preparation", "學術準備", "Coursework in mathematics, mechanics, control, and computation, supported by complete derivations and quantitative analysis.", "透過數學、力學、控制與計算課程，以及完整推導與量化分析，建立扎實的學術基礎。"],
  [FlaskConical, "Research judgment", "研究判斷", "I distinguish observations, assumptions, objectives, and verified results—especially when a high training return masks physically incorrect behavior.", "我清楚區分觀察、假設、研究目標與已驗證結果，尤其重視高獎勵值是否掩蓋了錯誤的物理行為。"],
  [Layers3, "System integration", "系統整合", "I bring models and algorithms into CAD, hardware, interfaces, controlled tests, and technical documentation.", "我把模型與演算法落實到 CAD、硬體、系統介面、受控測試與技術文件。"],
  [UsersRound, "Teamwork", "團隊合作", "I clarify interfaces, document decisions, and help teams turn coupled failures into specific next steps.", "我釐清介面、記錄決策，並協助團隊把相互牽連的故障拆解成明確的下一步。"],
] as const;

const portfolioMap = [
  ["Research", "研究", "Current research and earlier studies", "目前研究與早期探索", "/research"],
  ["Projects", "工程專案", "Design, integration, and testing", "設計、整合與測試", "/projects"],
  ["Academics", "學術與課程", "Coursework, grades, and reports", "課程、成績與報告", "/academics"],
  ["Leadership", "領導與服務", "Teamwork, teaching, and service", "團隊合作、教學與服務", "/leadership"],
  ["Writing", "寫作", "Autobiographies and technical writing", "自傳與技術寫作", "/writing"],
  ["Constellation & index", "互動星圖與完整索引", "Related work and the complete index", "內容關聯與完整索引", "/archive"],
] as const;

export function HomePage({ locale, page, find, media }: Props) {
  const text = (value: { en: string; zh: string }) => value[locale];
  const redrhex = find("/research/redrhex");
  const systems = [find("/projects/jarvis"), find("/projects/aero-carrier"), find("/projects/lkas")].filter(Boolean) as ContentEntity[];
  const academic = [find("/academics/numerical-analysis"), find("/academics/intermediate-dynamics"), find("/academics/engineering-mathematics")].filter(Boolean) as ContentEntity[];
  const cinemaItems = videos.map((video) => ({
    video,
    contextTitle: find(video.route)?.title[locale] ?? video.title[locale],
  }));
  const trajectoryPeriods = [
    {
      id: "mathematical-foundations",
      date: { en: "2016–2019", zh: "2016–2019" },
      title: { en: "Mathematical foundations take shape", zh: "數學基礎逐步成形" },
      summary: {
        en: "An early interest in patterns and problem solving developed into sustained mathematical training.",
        zh: "從對規律與解題的興趣出發，逐步建立持續而扎實的數學訓練。",
      },
      routes: [
        "/experience/mathleague-2016",
        "/experience/jhmc",
        "/experience/tmt8-2018",
        "/experience/national-math-olympiad-grade-9",
      ],
    },
    {
      id: "inquiry-teaching-leadership",
      date: { en: "2019–2022", zh: "2019–2022" },
      title: { en: "From competition to inquiry, teaching, and leadership", zh: "從競賽走向研究、教學與帶隊" },
      summary: {
        en: "High school broadened mathematical training into research, communication, and responsibility for a team.",
        zh: "高中階段不只延續數學訓練，也開始投入研究、說明知識，並承擔團隊責任。",
      },
      routes: [
        "/experience/chien-kuo-gifted-class",
        "/experience/apmoc-apmo-tmo-selection",
        "/research/geometry-covering",
        "/experience/trml-captain-2020-2021",
        "/writing/teaching/taylor-series-video",
      ],
    },
    {
      id: "interdisciplinary-foundation",
      date: { en: "2022–2024", zh: "2022–2024" },
      title: { en: "Rebuilding an interdisciplinary foundation at NTU", zh: "在臺大重建跨域基礎" },
      summary: {
        en: "Mechanical engineering, civil engineering, and mathematics formed a shared foundation in mechanics, computation, proof, and engineering judgment.",
        zh: "機械、土木與數學共同建立力學、計算、證明與工程判斷的跨域基礎。",
      },
      routes: [
        "/experience/ntu-mechanical-engineering",
        "/experience/ntu-civil-engineering",
        "/experience/ntu-mathematics-minor",
        "/experience/ntu-peer-review-sessions",
      ],
    },
    {
      id: "physical-systems",
      date: { en: "2024–2025", zh: "2024–2025" },
      title: { en: "Taking models into physical systems", zh: "讓模型進入實體系統" },
      summary: {
        en: "Control, mechanisms, and integration began to meet the constraints of fabrication, interfaces, and physical testing.",
        zh: "控制、機構與系統整合，開始接受製造、介面與實體測試的檢驗。",
      },
      routes: [
        "/projects/lkas",
        "/projects/polar-arm",
        "/projects/inventor-system-integration",
        "/experience/joining-ntu-biorola",
      ],
    },
    {
      id: "verifiable-results",
      date: { en: "2025–Present", zh: "2025 年至今" },
      title: { en: "Research, integration, and tested systems", zh: "研究、整合與實作成果" },
      summary: {
        en: "Current work combines simulation, control, hardware testing, system integration, and technical documentation.",
        zh: "目前的工作結合模擬、控制、硬體測試、系統整合與技術文件。",
      },
      routes: [
        "/research/redrhex",
        "/projects/aero-carrier",
        "/projects/jarvis",
        "/academics/numerical-analysis",
      ],
    },
  ] as const;
  const trajectory = trajectoryPeriods
    .map((period) => ({
      id: period.id,
      date: text(period.date),
      title: text(period.title),
      summary: text(period.summary),
      entries: period.routes
        .map((route) => find(route))
        .filter((entity): entity is ContentEntity => Boolean(entity?.route))
        .map((entity) => ({
          id: entity.id,
          date: entity.dateLabel ? text(entity.dateLabel) : undefined,
          category: localizedCategory(entity.category, locale),
          title: text(entity.title),
          href: localizePath(entity.route ?? "/", locale),
        })),
    }))
    .filter((period) => period.entries.length > 0);
  const aboutMedia = media("/about");
  const homePortrait = aboutMedia.find((asset) => asset.publicPath.includes("a44ea8d43c")) ?? aboutMedia[0];
  const humanMedia = aboutMedia.find((asset) => asset.publicPath !== homePortrait?.publicPath);
  const redMedia = media("/research/redrhex")[0];
  const academicMonograms = ["NA", "ID", "EM"] as const;

  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <section className="hero">
        <div className="hero__inner hero__grid">
          <div className="hero__intro">
            <p className="hero__kicker">{text(page.eyebrow)}</p>
            <h1>{locale === "en" ? <>From first principles to systems that <span className="gold">work.</span></> : <>我把數學與力學，做成<span className="gold">真正會動的系統。</span></>}</h1>
          </div>
          <div className="hero__support">
            <p className="hero__subhead">{text(page.summary)}</p>
            <div className="button-row hero__actions">
              <a className="button" href={localizePath("/research", locale)}>{locale === "en" ? "View research" : "查看研究"}<ArrowRight size={16} /></a>
              <a className="button button--quiet" href={siteConfig.cvPath} download><Download size={16} />{locale === "en" ? "Download CV" : "下載 CV"}</a>
              <a className="button button--quiet" href={localizePath("/projects", locale)}>{locale === "en" ? "Explore projects" : "探索專案"}</a>
            </div>
            <div className="hero__meta">
              <span>{locale === "en" ? "NTU · Mechanical Engineering & Civil Engineering double major · Mathematics minor" : "臺大機械工程與土木工程雙主修 · 數學輔系"}</span>
              <span>{locale === "en" ? "Robotics · Mechanics · Applied Mathematics" : "機器人 · 力學 · 應用數學"}</span>
            </div>
            <div className="hero__method-line" aria-label={locale === "en" ? "Working method" : "工作方法"}>
              {[
                locale === "en" ? "Define" : "定義",
                locale === "en" ? "Model" : "建模",
                locale === "en" ? "Integrate" : "整合",
                locale === "en" ? "Verify" : "驗證",
                locale === "en" ? "Document" : "紀錄",
                locale === "en" ? "Handoff" : "交接",
              ].map((step, index) => (
                <span key={step}><i aria-hidden="true">0{index + 1}</i>{step}</span>
              ))}
            </div>
          </div>
          <div className="hero__visual" aria-label={locale === "en" ? "Portrait of Jason Liao and current research" : "廖致翔個人照片與目前研究"}>
            <figure className="hero__portrait-stage">
              <div className="hero__portrait-frame">
                {homePortrait ? <ResponsiveAssetImage asset={homePortrait} width={1290} height={1423} eager /> : <div className="hero__portrait-fallback" aria-hidden="true">JL</div>}
              </div>
              <figcaption className="hero__portrait-caption">
                <span>{locale === "en" ? "Jason Liao" : "廖致翔"}</span>
                <span>{locale === "en" ? "Undergraduate researcher · NTU" : "臺大仿生機器人實驗室｜學士專題研究"}</span>
              </figcaption>
              <div className="hero__brand-seal" aria-hidden="true">
                <BrandLogo className="hero__brand-seal-logo" decorative eager />
              </div>
            </figure>
            <a className="hero__research-note hero__research-note--visual" href={localizePath("/research/redrhex", locale)}>
              {redMedia ? <span className="hero__research-thumb"><ResponsiveAssetImage asset={redMedia} width={360} height={240} eager /></span> : null}
              <span className="hero__research-index" aria-hidden="true">R·01</span>
              <span className="hero__research-copy">
                <small>{locale === "en" ? "Current research" : "目前研究"}</small>
                <strong>{locale === "en" ? "RedRHex Locomotion" : "RedRHex 步態控制"}</strong>
                <span>{locale === "en" ? "Learning-based control · Sim-to-Real · In progress" : "學習式控制 · Sim-to-Real · 進行中"}</span>
              </span>
              <ArrowRight className="hero__research-arrow" size={19} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="section section--tight home-proof-stage" id="home-academic-record">
        <div className="container">
          <div className="home-proof-heading">
            <p className="eyebrow">{locale === "en" ? "Academic record at a glance" : "學業表現一覽"}</p>
            <span>{locale === "en" ? "GPA shown on the NTU 4.30 scale and through a documented course-by-course 4.00 conversion" : "GPA 以臺大 4.30 制呈現，並附逐科計算的 4.00 制換算值"}</span>
          </div>
          <AcademicRecordProof locale={locale} disclosure="compact" />
        </div>
      </section>

      {redrhex ? (
        <section className="section section--graphite home-research-section" id="home-current-research">
          <div className="container feature-split home-research-split">
            <div className="feature-media home-research-gallery">
              {redMedia ? (
                <figure className="home-research-gallery__primary">
                  <div className="home-research-gallery__image">
                    <ResponsiveAssetImage asset={redMedia} width={1000} height={1333} />
                  </div>
                  <figcaption><span aria-hidden="true">R·01</span><span>{redMedia.caption ?? redMedia.alt}</span></figcaption>
                </figure>
              ) : <div className="hero__monogram"><span>R6</span></div>}
            </div>
            <div className="feature-copy">
              <p className="eyebrow">{locale === "en" ? "Current research · NTU BioRoLa" : "目前研究 · 臺大仿生機器人實驗室"}</p>
              <h2>RedRHex</h2>
              <p>{text(redrhex.card)}</p>
          <div className="status-row"><span className="chip chip--gold">{locale === "en" ? "Verified baseline" : "已驗證基準模型"}</span><span className="chip">{locale === "en" ? "Controlled hardware testing" : "受控真機測試"}</span><span className="chip">{locale === "en" ? "280D / 327D branch · In progress" : "280D／327D 實驗分支 · 進行中"}</span></div>
              <div className="turning-point">
          <p><strong>{locale === "en" ? "Key finding:" : "關鍵發現："}</strong> {locale === "en" ? "a high training return was masking synchronized leg motion, slipping, and body contact. I changed the question from “does it score well?” to “does it move correctly?”" : "高獎勵值掩蓋了六腳同步擺動、打滑與機身觸地。我把問題從「分數高不高」改成「是否真的走對」。"}</p>
              </div>
              <div className="button-row" style={{ marginTop: 24 }}><a className="button" href={localizePath("/research/redrhex", locale)}>{locale === "en" ? "View the research" : "查看研究"}<ArrowRight size={16} /></a></div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section--paper home-systems-section" id="home-selected-systems">
        <div className="container">
          <div className="section-header section-header--split">
            <div><p className="eyebrow">{locale === "en" ? "Selected systems" : "代表工程系統"}</p><h2>{locale === "en" ? "Engineering systems in practice." : "從模型、原型到可運作的工程系統。"}</h2></div>
              <p>{locale === "en" ? "Three projects under different constraints: a multimodal prototype built in 36 hours, a quadrotor carrier designed for reliability, and a lane-keeping controller implemented on a physical vehicle." : "三個專案面對不同限制：36 小時完成的多模態原型、以可靠度為核心的四旋翼搬運系統，以及實作於實車的車道置中控制器。"}</p>
          </div>
          <div className="visual-feature-grid visual-feature-grid--3 home-systems-grid">
            {systems.map((entity, index) => {
              const asset = media(entity.route ?? "")[0];
              return <a className={`case-card case-card--featured home-system-card${index === 0 ? " case-card--featured-lead" : ""}`} href={localizePath(entity.route ?? "/projects", locale)} key={entity.id}>
                <div className="case-card__media">{asset ? <ResponsiveAssetImage asset={asset} width={index === 0 ? 1200 : 800} height={index === 0 ? 720 : 500} /> : null}<span className="case-card__media-label">{locale === "en" ? `System 0${index + 1}` : `系統 0${index + 1}`}</span></div>
                <div className="case-card__body"><div className="case-card__meta"><span>{entity.dateLabel ? text(entity.dateLabel) : localizedCategory(entity.category, locale)}</span><span>·</span><span>{maturityLabel(entity.maturity, locale)}</span></div><h3>{text(entity.title)}</h3><p>{text(entity.card)}</p><div className="case-card__footer"><span>{locale === "en" ? "View project" : "查看專案"}</span><ArrowRight size={17} /></div></div>
              </a>;
            })}
          </div>
        </div>
      </section>

      <section className="section home-academics-section" id="home-academic-work">
        <div className="container">
          <div className="section-header"><p className="eyebrow">{locale === "en" ? "Academic preparation" : "學術準備"}</p><h2>{locale === "en" ? "Selected coursework in mathematics, mechanics, and computation." : "數學、力學與計算領域的代表課程成果。"}</h2><p>{locale === "en" ? "Each example presents the problem, method, results, limitations, and available report." : "各項成果說明研究題目、採用方法、結果與限制，並附相關報告。"}</p></div>
          <div className="home-academic-grid">
            {academic.map((entity, index) => {
              const asset = media(entity.route ?? "")[0];
              return <a className={`archive-card home-academic-card${asset ? " home-academic-card--media" : ""}`} href={localizePath(entity.route ?? "/academics", locale)} key={entity.id}>
                <div className="home-academic-card__visual">
                  {asset ? <ResponsiveAssetImage asset={asset} width={840} height={620} /> : <span aria-hidden="true">{academicMonograms[index]}</span>}
                  <i aria-hidden="true">0{index + 1}</i>
                </div>
                <div className="home-academic-card__body">
                  <div className="case-card__meta"><span>{locale === "en" ? "Featured academic work" : "代表學術成果"}</span><span>·</span><span>{maturityLabel(entity.maturity, locale)}</span></div>
                  <h3>{text(entity.title)}</h3>
                  <p>{text(entity.card)}</p>
                  <div className="case-card__footer"><span>{locale === "en" ? "View coursework" : "查看課程成果"}</span><ArrowRight size={17} /></div>
                </div>
              </a>;
            })}
          </div>
          <ProcessLab locale={locale} />
        </div>
      </section>

      <section className="section section--tight" id="home-capability-summary">
        <div className="container">
          <div className="section-header section-header--split">
            <div><p className="eyebrow">{locale === "en" ? "Academic and engineering strengths" : "學術與工程能力"}</p><h2>{locale === "en" ? "Mathematics, mechanics, research, and system integration." : "數學、力學、研究與系統整合。"}</h2></div>
            <p>{locale === "en" ? "These four strengths shape how I approach modeling, integration, testing, and diagnosis across coursework, research, and projects." : "這四項能力貫穿我的課程、研究與專案，也構成我處理建模、整合、測試與診斷問題的方法。"}</p>
          </div>
          <div className="strength-grid strength-grid--editorial">
            {strengths.map(([Icon, enTitle, zhTitle, enBody, zhBody], index) => (
              <article className={`strength-card strength-card--editorial strength-card--editorial-${index + 1}`} key={enTitle}>
                <div className="strength-card__number">0{index + 1}</div>
                <span className="strength-card__icon"><Icon size={21} aria-hidden="true" /></span>
                <h3>{locale === "en" ? enTitle : zhTitle}</h3>
                <p>{locale === "en" ? enBody : zhBody}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CapabilityAtlas locale={locale} />

      <PortfolioCinema locale={locale} items={cinemaItems} />

      <PortfolioTrajectory locale={locale} items={trajectory} />

      <section className="section section--graphite home-leadership-section" id="home-leadership">
        <div className="container home-leadership-grid">
          <div className="feature-copy home-leadership-intro">
            <div className="home-leadership-intro__heading">
              <p className="eyebrow">{locale === "en" ? "Leadership & teaching" : "領導與教學"}</p>
              <h2>{locale === "en" ? "Clear responsibilities, open communication, and reliable follow-through." : "釐清責任、保持溝通，與團隊一起把工作完成。"}</h2>
            </div>
            <div className="home-leadership-intro__body">
              <p>{locale === "en" ? "Two years as a TRML team captain, system integration across Inventor modules, peer review sessions, science outreach, and international-student support taught me to make goals, interfaces, schedules, and decisions clear to everyone involved." : "連續兩年擔任 TRML 隊長、整合團隊 Inventor 模組、舉辦同儕複習、投入科學推廣與國際生支持，讓我學會把目標、介面、時程與決策向每位參與者說明清楚。"}</p>
              <div className="button-row"><a className="button" href={localizePath("/leadership", locale)}>{locale === "en" ? "Explore leadership & service" : "查看領導與服務"}<ArrowRight size={16} /></a><a className="button button--quiet" href={localizePath("/about", locale)}>{locale === "en" ? "Read my story" : "閱讀個人故事"}</a></div>
            </div>
          </div>
          <blockquote className="turning-point human-note home-human-note">
            {humanMedia ? <div className="home-human-note__media"><ResponsiveAssetImage asset={humanMedia} width={humanMedia.width ?? 1440} height={humanMedia.height ?? 2560} /></div> : null}
            <div className="home-human-note__copy"><p className="eyebrow">{locale === "en" ? "Beyond academics" : "研究之外"}</p><p className="human-note__quote">{locale === "en" ? "Reason as the structure, passion as the heart." : "理性為骨，熱血為心。"}</p><p>{locale === "en" ? "Mathematics, music, baseball, friendship, and service all contribute to the curiosity, discipline, and collaboration I bring to my work." : "數學、音樂、棒球、友誼與服務，讓我在研究與課業之外保持好奇與紀律，也更懂得與人合作。"}</p></div>
          </blockquote>
        </div>
      </section>

      <section className="section section--portfolio-map" id="home-portfolio-map">
        <div className="container portfolio-map">
          <div className="portfolio-map__identity">
            <div className="portfolio-map__mark">
              <div className="portfolio-map__logo"><BrandLogo /></div>
            </div>
            <div className="portfolio-map__copy">
              <p className="eyebrow">{locale === "en" ? "Continue exploring" : "繼續瀏覽"}</p>
              <h2>{locale === "en" ? "Research, projects, coursework, and the experiences behind them." : "研究、工程專案、課程成果與一路累積的經歷。"}</h2>
              <p>{locale === "en" ? "Continue by area, or open the complete index to browse the full body of work." : "可依主題繼續瀏覽，也可從完整索引查看所有內容。"}</p>
            </div>
          </div>
          <nav className="portfolio-map__paths" aria-label={locale === "en" ? "Portfolio map" : "作品集地圖"}>
            {portfolioMap.map(([enTitle, zhTitle, enBody, zhBody, route], index) => (
              <a href={localizePath(route, locale)} key={route}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{locale === "en" ? enTitle : zhTitle}</strong><small>{locale === "en" ? enBody : zhBody}</small></span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </section>

    </main>
  );
}
