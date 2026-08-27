import { Mail } from "lucide-react";
import type { Locale } from "@/lib/site-config";
import { localizePath, siteConfig } from "@/lib/site-config";
import { BrandLogo } from "./BrandLogo";
import { ElectronicContactCard } from "./ElectronicContactCard";

export function SiteFooter({ locale, path }: { locale: Locale; path: string }) {
  const year = new Date().getFullYear();
  const isHome = path === "/" || path === "/zh";
  const homePath = localizePath("/", locale);
  return (
    <footer className="site-footer">
      <div className={`site-footer__lead${isHome ? " site-footer__lead--home" : ""}`}>
        <div className="site-footer__lead-copy">
          <p className="eyebrow">{locale === "en" ? "Research · Engineering · Collaboration" : "研究・工程・合作"}</p>
          <h2>{locale === "en" ? "Have a question or an opportunity in mind? Get in touch." : "如果你想交流研究、工程或合作機會，歡迎與我聯絡。"}</h2>
          <div className="button-row">
            <a className="button" href={localizePath("/contact", locale)}>{locale === "en" ? "Get in touch" : "與我聯絡"}</a>
            <a className="button button--quiet" href={siteConfig.cvPath} download>{locale === "en" ? "Download CV" : "下載 CV"}</a>
          </div>
        </div>
        {isHome ? (
          <div id="professional-contact-card" className="site-footer__contact-card">
            <ElectronicContactCard
              locale={locale}
              placement="footer"
              publicEmail={siteConfig.email}
              redirectTo={`${homePath}#professional-contact-card`}
            />
          </div>
        ) : null}
      </div>
      <div className="site-footer__sitemap">
        <div className="site-footer__identity">
          <a className="site-footer__logo" href={localizePath("/", locale)} aria-label={locale === "en" ? "Jason Liao, home" : "廖致翔，首頁"}><BrandLogo decorative /></a>
          <div>
            <strong>{locale === "en" ? siteConfig.formalName : siteConfig.nameZh}</strong>
            <p>{locale === "en" ? "Robotics · Mechanics · Applied Mathematics" : "機器人 · 力學 · 應用數學"}</p>
            <a className="footer-index-link" href={localizePath("/archive", locale)}>{locale === "en" ? "View the complete portfolio index" : "查看完整作品索引"}</a>
          </div>
        </div>
        <FooterColumn locale={locale} title={locale === "en" ? "Explore" : "探索"} links={[
          ["Research", "研究", "/research"],
          ["Projects", "工程專案", "/projects"],
          ["Academics", "學術與課程", "/academics"],
          ["Leadership", "領導與服務", "/leadership"],
        ]} />
        <FooterColumn locale={locale} title={locale === "en" ? "Profile" : "個人"} links={[
          ["About", "關於我", "/about"],
          ["Writing", "寫作", "/writing"],
          ["Personal", "個人故事", "/personal"],
          ["Updates", "近況", "/updates"],
        ]} />
        <div className="footer-column">
          <strong>{locale === "en" ? "Contact & documents" : "聯絡與文件"}</strong>
          <a href={localizePath("/cv", locale)}>CV</a>
          <a href={localizePath("/contact", locale)}>{locale === "en" ? "Contact" : "聯絡我"}</a>
          <a href={`mailto:${siteConfig.email}`}><Mail size={14} />Email</a>
          <a href={localizePath("/trusted", locale)}>{locale === "en" ? "Verified contact card" : "受邀聯絡名片"}</a>
          <a href={localizePath("/trusted", locale)}>{locale === "en" ? "Invitation-only materials" : "受邀資料"}</a>
        </div>
      </div>
      <div className="site-footer__base">
        <span>© {year} {siteConfig.formalName}</span>
        <span>{locale === "en" ? "Robotics · Mechanics · Applied Mathematics" : "機器人 · 力學 · 應用數學"}</span>
      </div>
    </footer>
  );
}

function FooterColumn({ locale, title, links }: { locale: Locale; title: string; links: ReadonlyArray<readonly [string, string, string]> }) {
  return <div className="footer-column"><strong>{title}</strong>{links.map(([en, zh, route]) => <a href={localizePath(route, locale)} key={route}>{locale === "en" ? en : zh}</a>)}</div>;
}
