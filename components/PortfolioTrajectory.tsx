import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/content-data";
import { localizePath } from "@/lib/site-config";

export type TrajectoryEntry = {
  id: string;
  date?: string;
  category: string;
  title: string;
  href: string;
};

export type TrajectoryPeriod = {
  id: string;
  date: string;
  title: string;
  summary: string;
  entries: TrajectoryEntry[];
};

type Props = {
  locale: Locale;
  items: TrajectoryPeriod[];
};

export function PortfolioTrajectory({ locale, items }: Props) {
  const periods = items.filter((period) => period.entries.length > 0);

  if (periods.length < 2) return null;

  return (
    <section className="section trajectory-section" id="home-trajectory" aria-labelledby="trajectory-title">
      <div className="container portfolio-trajectory">
        <div className="section-header section-header--split portfolio-trajectory__header">
          <div>
            <p className="eyebrow">{locale === "en" ? "Academic & engineering timeline" : "學術與工程歷程"}</p>
            <h2 id="trajectory-title">
              {locale === "en" ? "A progression from mathematical foundations to integrated systems." : "從數學基礎，走向研究與系統整合。"}
            </h2>
          </div>
          <p>
            {locale === "en"
              ? "Each period groups related coursework, projects, research, and responsibilities."
              : "每個時期整理相關課程、專案、研究與責任，呈現學術方向如何逐步發展。"}
          </p>
        </div>

        <div className="portfolio-trajectory__console">
          <ol className="portfolio-trajectory__timeline" aria-label={locale === "en" ? "Academic and engineering periods" : "學術與工程時期"}>
            <li className="portfolio-trajectory__scan" aria-hidden="true" />
            {periods.map((period, periodIndex) => {
              const periodNumber = String(periodIndex + 1).padStart(2, "0");
              const titleId = `trajectory-period-${period.id}`;

              return (
                <li className="portfolio-trajectory__period" key={period.id}>
                  <div className="portfolio-trajectory__date">
                    <time>{period.date}</time>
                    <span>
                      {locale === "en"
                        ? `${period.entries.length} selected records`
                        : `${period.entries.length} 筆代表紀錄`}
                    </span>
                  </div>
                  <div className="portfolio-trajectory__marker" aria-hidden="true">
                    <span>{periodNumber}</span>
                  </div>
                  <article className="portfolio-trajectory__period-card" aria-labelledby={titleId}>
                    <div className="portfolio-trajectory__period-heading">
                      <p className="eyebrow">{locale === "en" ? `Period ${periodNumber}` : `時期 ${periodNumber}`}</p>
                      <h3 id={titleId}>{period.title}</h3>
                      <p>{period.summary}</p>
                    </div>
                    <ul className="portfolio-trajectory__entries">
                      {period.entries.map((entry, entryIndex) => (
                        <li className="portfolio-trajectory__entry" key={entry.id}>
                          <a href={entry.href}>
                            <span className="portfolio-trajectory__entry-number" aria-hidden="true">
                              {String(entryIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="portfolio-trajectory__entry-copy">
                              <small>{[entry.date, entry.category].filter(Boolean).join(" · ")}</small>
                              <strong>{entry.title}</strong>
                            </span>
                            <ArrowRight size={17} aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              );
            })}
          </ol>

          <a className="portfolio-trajectory__index" href={localizePath("/archive", locale)}>
            <span>
              <small>{locale === "en" ? "Complete portfolio" : "完整作品集"}</small>
              <strong>{locale === "en" ? "View the complete portfolio index" : "查看完整作品索引"}</strong>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
