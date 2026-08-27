import { ArrowLeft, ArrowRight, BookOpen, Languages } from "lucide-react";
import type { Locale } from "@/lib/content-data";
import {
  getOtherAutobiography,
  type AutobiographyParagraph,
  type LiteraryAutobiography,
} from "@/lib/autobiographies";
import { localizePath } from "@/lib/site-config";

type Props = {
  locale: Locale;
  article: LiteraryAutobiography;
};

const sourceText = (paragraph: AutobiographyParagraph, locale: Locale) =>
  locale === "en" ? paragraph.en : paragraph.zh;

function readingTime(article: LiteraryAutobiography, locale: Locale) {
  const text = article.paragraphs.map((paragraph) => sourceText(paragraph, locale)).join(" ");
  if (locale === "zh") {
    return Math.max(2, Math.ceil(text.replace(/\s/g, "").length / 520));
  }
  return Math.max(2, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 235));
}

function chapterId(paragraph: AutobiographyParagraph) {
  return `chapter-${paragraph.sourceIndex}`;
}

export function AutobiographyPage({ locale, article }: Props) {
  const other = getOtherAutobiography(article.id);
  const bylinePosition = article.paragraphs.findIndex((paragraph) => paragraph.kind === "byline");
  let heroEnd = Math.max(0, bylinePosition);
  while (article.paragraphs[heroEnd + 1]?.kind === "spacer") heroEnd += 1;

  const heroSlots = article.paragraphs.slice(0, heroEnd + 1);
  const bodySlots = article.paragraphs.slice(heroEnd + 1);
  const chapters = bodySlots.filter((paragraph) => paragraph.kind === "section");
  const firstBodyIndex = bodySlots.findIndex((paragraph) => paragraph.kind === "paragraph");
  const isPreface = article.id === "autobiography-gewu-xiangzhe-preface";
  const minutes = readingTime(article, locale);

  return (
    <main id="main-content" className="longform-page" tabIndex={-1}>
      <header className={`longform-hero${isPreface ? " longform-hero--preface" : ""}`}>
        <div className="longform-hero__inner">
          <div className="longform-hero__copy">
            <a className="longform-back" href={localizePath("/writing", locale)}>
              <ArrowLeft size={15} aria-hidden="true" />
              {locale === "en" ? "Long-form writing" : "寫作與長文"}
            </a>
            <p className="eyebrow">{locale === "en" ? "Full autobiography" : "自傳全文"}</p>
            {heroSlots.map((paragraph) => {
              if (paragraph.kind === "title") {
                return <h1 id="autobiography-title" data-source-index={paragraph.sourceIndex} key={paragraph.sourceIndex}>{sourceText(paragraph, locale)}</h1>;
              }
              if (paragraph.kind === "subtitle") {
                return <p className="longform-hero__subtitle" data-source-index={paragraph.sourceIndex} key={paragraph.sourceIndex}>{sourceText(paragraph, locale)}</p>;
              }
              if (paragraph.kind === "byline") {
                return <p className="longform-hero__byline" data-source-index={paragraph.sourceIndex} key={paragraph.sourceIndex}>{sourceText(paragraph, locale)}</p>;
              }
              return <span className="longform-source-spacer" data-source-index={paragraph.sourceIndex} aria-hidden="true" key={paragraph.sourceIndex} />;
            })}
          </div>
          <aside className="longform-hero__folio" aria-label={locale === "en" ? "Article information" : "文章資訊"}>
            <span className="longform-hero__folio-number">{isPreface ? "II" : "I"}</span>
            <div>
              <strong>{locale === "en" ? "Full text" : "全文"}</strong>
              <span>{article.paragraphs.length} {locale === "en" ? "paragraphs" : "個段落"}</span>
              <span>{locale === "en" ? `${minutes} min read` : `約 ${minutes} 分鐘讀完`}</span>
            </div>
            <Languages size={19} aria-hidden="true" />
          </aside>
        </div>
      </header>

      <section className="longform-reading">
        <div className="longform-reading__inner">
          <aside className="longform-toc">
            <div className="longform-toc__mark"><BookOpen size={18} aria-hidden="true" /></div>
            <p className="eyebrow">{locale === "en" ? "Essay contents" : "文章導覽"}</p>
            {chapters.length ? (
              <nav aria-label={locale === "en" ? "Autobiography chapters" : "自傳章節"}>
                {chapters.map((chapter, index) => (
                  <a href={`#${chapterId(chapter)}`} key={chapter.sourceIndex}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {sourceText(chapter, locale)}
                  </a>
                ))}
              </nav>
            ) : null}
            <div className="longform-toc__note">
              {locale === "en"
                ? "The English edition follows every paragraph of the Traditional Chinese original without abridgment."
                : "本頁逐段保留原始繁體中文全文，未經刪節或摘要。"}
            </div>
          </aside>

          <article className={`longform-article${isPreface ? " longform-article--preface" : ""}`} aria-labelledby="autobiography-title">
            {bodySlots.map((paragraph, index) => {
              if (paragraph.kind === "spacer") {
                return <div className="longform-spacer" data-source-index={paragraph.sourceIndex} aria-hidden="true" key={paragraph.sourceIndex} />;
              }
              if (paragraph.kind === "section") {
                return (
                  <h2 className="longform-section-title" id={chapterId(paragraph)} data-source-index={paragraph.sourceIndex} key={paragraph.sourceIndex}>
                    {sourceText(paragraph, locale)}
                  </h2>
                );
              }

              const originalZh = paragraph.zh;
              const isAccent = originalZh.startsWith("——")
                || originalZh === "理性為骨，熱血為心。"
                || originalZh === "不負所學，不負少年，不負星河。";
              return (
                <p
                  className={`${index === firstBodyIndex ? "longform-opening" : ""}${isAccent ? " longform-accent-line" : ""}`.trim() || undefined}
                  data-source-index={paragraph.sourceIndex}
                  key={paragraph.sourceIndex}
                >
                  {sourceText(paragraph, locale)}
                </p>
              );
            })}

            <div className="longform-endmark" aria-hidden="true"><span />JL<span /></div>
            <footer className="longform-article__footer">
              <p>{locale === "en" ? "End of essay." : "全文完。"}</p>
              <div className="button-row">
                <a className="button" href={localizePath("/about", locale)}>
                  {locale === "en" ? "About the author" : "關於作者"}
                </a>
                <a className="button button--quiet" href={localizePath("/writing", locale)}>
                  {locale === "en" ? "All writing" : "所有寫作"}
                </a>
              </div>
            </footer>
          </article>
        </div>
      </section>

      {other ? (
        <section className="longform-next">
          <div className="container">
            <p className="eyebrow">{locale === "en" ? "Continue reading" : "繼續閱讀"}</p>
            <a className="longform-next__card" href={localizePath(other.canonicalRoute, locale)}>
              <span>{locale === "en" ? "The other autobiography" : "另一篇自傳"}</span>
              <strong>{other.title[locale]}</strong>
              <p>{other.card[locale]}</p>
              <ArrowRight size={24} aria-hidden="true" />
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
