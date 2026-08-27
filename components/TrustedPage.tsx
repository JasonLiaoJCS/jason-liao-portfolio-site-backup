import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Handshake,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import type { ComponentType } from "react";
import TrustedAccess, { TrustedLogoutButton } from "./TrustedAccess";
import { isTrustedSession } from "@/lib/trusted-auth";
import type { Locale } from "@/lib/site-config";
import { localizePath, siteConfig } from "@/lib/site-config";
import { AcademicRecordProof } from "./AcademicRecordProof";
import { ElectronicContactCard } from "./ElectronicContactCard";

type ReviewPath = {
  icon: ComponentType<{ size?: number }>;
  title: string;
  description: string;
  links: Array<{ label: string; route: string }>;
};

export async function TrustedPage({ locale }: { locale: Locale }) {
  const authorized = await isTrustedSession();
  if (!authorized) return <TrustedLoginPage locale={locale} />;
  return <TrustedReviewRoom locale={locale} />;
}

function TrustedLoginPage({ locale }: { locale: Locale }) {
  const english = locale === "en";

  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <section className="page-hero page-hero--trusted">
        <div className="page-hero__inner">
          <div className="page-hero__meta">
            <span className="chip chip--gold">
              <LockKeyhole size={14} />
              {english ? "Invitation-only access" : "受邀資料"}
            </span>
            <span className="chip">
              <TimerReset size={14} />
              {english ? "8-hour session" : "8 小時工作階段"}
            </span>
          </div>
          <h1>
            {english
              ? "Invitation-only materials"
              : "受邀資料"}
          </h1>
          <p className="page-hero__lede">
            {english
              ? "Additional academic and professional materials are available by invitation. Research, projects, coursework, videos, and full reports remain available throughout the site."
              : "研究、工程專案、課程成果、展示影片與完整報告均可直接查閱；其他學術與專業資料則限受邀者閱覽。"}
          </p>
        </div>
      </section>

      <section className="section section--paper trusted-entry-section">
        <div className="container feature-split trusted-entry-grid">
          <TrustedAccess
            locale={english ? "en" : "zh-TW"}
            redirectTo={localizePath("/trusted", locale)}
          />

          <aside className="trusted-boundary" aria-labelledby="trusted-boundary-title">
            <p className="eyebrow">
              {english ? "Access and privacy" : "資料用途與隱私"}
            </p>
            <h2 id="trusted-boundary-title">
              {english
                ? "Access is time-limited and may be revoked."
                : "存取權限有明確期限，必要時可撤銷。"}
            </h2>
            <ul className="trusted-boundary__list">
              <li>
                <ShieldCheck size={19} />
                <span>
                  <strong>{english ? "Protected access" : "安全存取"}</strong>
                  {english
                    ? "The password is checked securely and is not stored in the browser."
                    : "密碼只會在伺服器端驗證，不會儲存在瀏覽器中。"}
                </span>
              </li>
              <li>
                <TimerReset size={19} />
                <span>
                  <strong>{english ? "Time-limited" : "限時存取"}</strong>
                  {english
                    ? "Authorization expires automatically after eight hours."
                    : "授權會在八小時後自動失效。"}
                </span>
              </li>
              <li>
                <LockKeyhole size={19} />
                <span>
                  <strong>{english ? "Sensitive information remains protected" : "敏感資料不公開"}</strong>
                  {english
                    ? "Government identifiers, credentials, recommendation letters, and third-party private material are never uploaded to or served by this site."
                    : "政府證件號碼、帳號密碼、推薦信及涉及第三人的私人資料，不會透過本網站提供。"}
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section section--graphite trusted-contact-card-section">
        <div className="container">
          <header className="section-header section-header--split">
            <div>
              <p className="eyebrow">{english ? "Professional contact card" : "專業電子名片"}</p>
              <h2>{english ? "Direct contact details are included with trusted access." : "受邀權限亦包含完整聯絡名片。"}</h2>
            </div>
            <p>{english ? "Use the access form above to unlock the phone number, professional profiles, QR code, and vCard for this eight-hour session." : "請使用上方表單登入；電話、專業社群、QR Code 與 vCard 將在本次八小時工作階段內開放。"}</p>
          </header>
          <ElectronicContactCard
            locale={locale}
            placement="trusted"
            publicEmail={siteConfig.email}
            redirectTo={`${localizePath("/trusted", locale)}#professional-contact-card`}
            inlineLogin={false}
            loginHref="#trusted-access-password"
          />
        </div>
      </section>
    </main>
  );
}

function TrustedReviewRoom({ locale }: { locale: Locale }) {
  const english = locale === "en";
  const paths = reviewPaths(locale);
  const subject = english
    ? "Request for additional portfolio materials — Jason Liao"
    : "補充資料索取｜廖致翔";
  const body = english
    ? "Hello Jason,\n\nProgram, laboratory, or role:\nDeadline:\nRequested materials:\n\nThank you."
    : "致翔你好：\n\n資料用途（研究室／學程／職缺／合作）：\n希望收到的資料：\n回覆期限（如適用）：\n\n謝謝。";
  const requestHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <section className="page-hero page-hero--trusted page-hero--authorized">
        <div className="page-hero__inner">
          <div className="page-hero__meta">
            <span className="chip chip--gold">
              <ShieldCheck size={14} />
              {english ? "Access granted" : "存取權限已啟用"}
            </span>
            <span className="chip">
              <TimerReset size={14} />
              {english ? "Expires after 8 hours" : "8 小時後自動失效"}
            </span>
          </div>
          <h1>{english ? "Invitation-only materials" : "受邀資料"}</h1>
          <p className="page-hero__lede">
            {english
              ? "Selected materials for graduate study, research, engineering, and academic collaboration."
              : "研究、升學、工程與合作資料，依主題分類整理。"}
          </p>
          <div className="button-row trusted-hero-actions">
            <a className="button" href={siteConfig.cvPath} target="_blank" rel="noreferrer">
              <FileCheck2 size={17} />
              {english ? "Open academic CV" : "開啟學術履歷"}
            </a>
            <TrustedLogoutButton
              locale={english ? "en" : "zh-TW"}
              redirectTo={localizePath("/trusted", locale)}
              className="button button--quiet"
            />
          </div>
        </div>
      </section>

      <section id="professional-contact-card" className="section section--graphite trusted-contact-card-section trusted-contact-card-section--authorized">
        <div className="container">
          <header className="section-header section-header--split">
            <div>
              <p className="eyebrow">{english ? "Professional contact card" : "專業電子名片"}</p>
              <h2>{english ? "Verified contact details for academic and professional correspondence." : "供學術與專業聯繫使用的完整資料。"}</h2>
            </div>
            <p>{english ? "Call, email, open a professional profile, scan the QR code, or save the vCard directly." : "可直接撥打電話、寄送 Email、開啟專業社群，亦可掃描 QR Code 或下載 vCard。"}</p>
          </header>
          <ElectronicContactCard
            locale={locale}
            placement="trusted"
            publicEmail={siteConfig.email}
            redirectTo={`${localizePath("/trusted", locale)}#professional-contact-card`}
            inlineLogin={false}
            loginHref={localizePath("/trusted", locale)}
          />
        </div>
      </section>

      <section className="section section--paper trusted-brief-section">
        <div className="container">
          <header className="section-header section-header--split">
            <div>
            <p className="eyebrow">{english ? "Academic profile at a glance" : "學術摘要"}</p>
              <h2>
                {english
                  ? "Sustained academic performance across an interdisciplinary course load."
                   : "跨領域修課下持續穩定的學業表現。"}
              </h2>
            </div>
            <p>
              {english
                ? "Mechanical Engineering and Civil Engineering double major, Mathematics minor at National Taiwan University, with current undergraduate research in biomimetic robotics."
                : "國立臺灣大學機械工程與土木工程雙主修、數學輔系，現於仿生機器人實驗室進行學士專題研究。"}
            </p>
          </header>

          <AcademicRecordProof locale={locale} variant="trusted" surface="paper" />
        </div>
      </section>

      <section className="section section--graphite trusted-paths-section">
        <div className="container">
          <header className="section-header">
            <p className="eyebrow">{english ? "Selected materials" : "資料分類"}</p>
            <h2>{english ? "Browse by area." : "依主題瀏覽。"}</h2>
            <p>{english ? "Research, academic preparation, engineering projects, and collaboration are grouped below." : "研究、學術準備、工程專案與合作經驗皆依主題分類整理。"}</p>
          </header>

          <div className="trusted-path-grid">
            {paths.map((path) => {
              const Icon = path.icon;
              return (
                <article className="trusted-path-card" key={path.title}>
                  <div className="trusted-path-card__head">
                    <span aria-hidden="true"><Icon size={21} /></span>
                    <h3>{path.title}</h3>
                  </div>
                  <p>{path.description}</p>
                  <nav aria-label={path.title}>
                    {path.links.map((link, index) => (
                      <a href={localizePath(link.route, locale)} key={link.route}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{link.label}</strong>
                        <ArrowRight size={15} />
                      </a>
                    ))}
                  </nav>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--paper trusted-materials-section">
        <div className="container feature-split">
          <div>
            <p className="eyebrow">{english ? "Available materials" : "可查閱資料"}</p>
            <h2 className="trusted-materials-heading">
              {english
                ? "Available materials and additional documents."
                : "可直接查閱的資料與其他補充文件。"}
            </h2>
            <p className="trusted-materials-copy">
              {english
                ? "The academic CV, course record, reports, and demonstrations are available on this site. Official or third-party documents may be provided privately when appropriate."
                : "學術履歷、修課紀錄、完整報告與展示影片可直接查閱；正式證明及涉及第三方的文件，則於具體需求下另行提供。"}
            </p>
          </div>

          <div className="trusted-material-list">
            <a href={siteConfig.cvPath} target="_blank" rel="noreferrer">
              <FileCheck2 size={18} />
              <span><strong>{english ? "Academic CV" : "學術履歷"}</strong><small>{english ? "PDF · available now" : "PDF · 可直接開啟"}</small></span>
              <ArrowRight size={16} />
            </a>
            <a href={localizePath("/academics", locale)}>
              <BookOpenCheck size={18} />
              <span><strong>{english ? "Academic record and coursework" : "學業紀錄與課程成果"}</strong><small>{english ? "Academic record and full reports" : "學業紀錄與完整報告"}</small></span>
              <ArrowRight size={16} />
            </a>
            <a href={localizePath("/research/redrhex", locale)}>
              <FlaskConical size={18} />
              <span><strong>{english ? "Research materials" : "研究資料"}</strong><small>{english ? "Status, limitations, demonstrations, and reports" : "研究進度、限制、展示影片與相關報告"}</small></span>
              <ArrowRight size={16} />
            </a>
            <div>
              <LockKeyhole size={18} />
              <span><strong>{english ? "Official and third-party materials" : "正式與第三方資料"}</strong><small>{english ? "Available privately on request" : "可依具體需求另行提供"}</small></span>
              <span className="trusted-material-list__status">{english ? "On request" : "依需求提供"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--graphite trusted-request-section">
        <div className="container trusted-request-panel">
          <div>
            <p className="eyebrow">{english ? "Request additional materials" : "索取補充資料"}</p>
            <h2>{english ? "Please include the program or opportunity, deadline, and any required documents." : "請註明申請學程或機會、截止日期與所需文件。"}</h2>
            <p>{english ? "I will respond with the relevant materials that can be shared for that purpose." : "我會依來信內容回覆可提供的相關資料。"}</p>
          </div>
          <a className="button" href={requestHref}>
            <Mail size={17} />
            {english ? "Request materials" : "索取資料"}
          </a>
        </div>
      </section>
    </main>
  );
}

function reviewPaths(locale: Locale): ReviewPath[] {
  const english = locale === "en";
  return [
    {
      icon: FlaskConical,
      title: english ? "Research" : "研究",
      description: english
        ? "Learning-based control, quantitative analysis, and the diagnosis of physically incorrect behavior."
        : "學習式控制、量化分析，以及錯誤物理行為的診斷。",
      links: [
        { label: "RedRHex", route: "/research/redrhex" },
        { label: english ? "Numerical Analysis" : "數值分析", route: "/academics/numerical-analysis" },
        { label: english ? "Intermediate Dynamics" : "中等動力學", route: "/academics/intermediate-dynamics" },
        { label: english ? "Earlier mathematical research" : "早期數學研究", route: "/research/geometry-covering" },
      ],
    },
    {
      icon: GraduationCap,
      title: english ? "Graduate study" : "研究所與博士班申請",
      description: english
        ? "Academic record, mathematical preparation, honors, writing, and sustained performance."
        : "學業紀錄、數學基礎、榮譽、寫作與長期學習表現。",
      links: [
        { label: english ? "Academic overview" : "學術總覽", route: "/academics" },
        { label: english ? "Honors" : "榮譽與獎項", route: "/academics/honors" },
        { label: english ? "Engineering Mathematics" : "工程數學", route: "/academics/engineering-mathematics" },
        { label: english ? "Writing archive" : "學術寫作", route: "/writing" },
      ],
    },
    {
      icon: BriefcaseBusiness,
      title: english ? "Engineering experience" : "工程經驗",
      description: english
        ? "Projects in system integration, control, prototyping, debugging, and team delivery."
        : "系統整合、控制、原型製作、除錯與團隊協作的工程專案。",
      links: [
        { label: "Aero Carrier", route: "/projects/aero-carrier" },
        { label: "Jarvis", route: "/projects/jarvis" },
        { label: "LKAS", route: "/projects/lkas" },
        { label: english ? "Inventor system integration" : "Inventor 系統整合", route: "/projects/inventor-system-integration" },
      ],
    },
    {
      icon: Handshake,
      title: english ? "Academic collaboration" : "學術合作",
      description: english
        ? "Technical documentation, teaching, leadership, and communication that support collaborative work."
        : "收錄技術文件、教學、領導與溝通經驗。",
      links: [
        { label: english ? "Software notes" : "軟體與技術筆記", route: "/writing/software" },
        { label: english ? "Teaching materials" : "教學內容", route: "/writing/teaching" },
        { label: english ? "Leadership and service" : "領導與服務", route: "/leadership" },
        { label: english ? "Contact" : "聯絡我", route: "/contact" },
      ],
    },
  ];
}
