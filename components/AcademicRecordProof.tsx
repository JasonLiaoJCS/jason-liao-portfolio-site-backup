import { ArrowRight } from "lucide-react";
import {
  academicAward,
  academicAwardContext,
  academicHighlights,
  academicRecordDisclosure,
  academicRecordDisclosureCompact,
  academicRecordSources,
  academicRecordText,
  overallAcademicContext,
  type AcademicRecordLocale,
} from "@/lib/academic-record";
import { localizePath } from "@/lib/site-config";

type Props = {
  locale: AcademicRecordLocale;
  variant?: "indexed" | "trusted";
  surface?: "dark" | "paper";
  disclosure?: "compact" | "full";
};

export function AcademicRecordProof({ locale, variant = "indexed", surface = "dark", disclosure = "full" }: Props) {
  const highlights = academicHighlights(locale);
  const overall = overallAcademicContext(locale);
  const gridClass = variant === "trusted"
    ? "trusted-proof-grid academic-record-grid academic-record-grid--trusted"
    : "proof-grid proof-grid--indexed academic-record-grid";

  return (
    <div className={`academic-record-proof academic-record-proof--${surface}`}>
      <div className={gridClass} aria-label={locale === "en" ? "Academic record highlights" : "學業紀錄重點"}>
        {highlights.map((item, index) => (
          <article className={`${variant === "trusted" ? "academic-record-card" : "proof academic-record-card"}${index === 0 ? " academic-record-card--primary" : ""}`} key={item.id}>
            {variant === "indexed" ? <i className="proof__index" aria-hidden="true">0{index + 1}</i> : null}
            <strong>{item.value}</strong>
            {item.secondary ? <small className="academic-record-card__secondary">{item.secondary}</small> : null}
            <span className="academic-record-card__label">{item.label}</span>
            <small className="academic-record-card__scope">{item.scope}</small>
          </article>
        ))}
      </div>

      <div className="academic-record-context">
        <div className="academic-record-context__item">
          <span>{overall.label}</span>
          <strong>{overall.value}</strong>
          <small>{overall.secondary} · {overall.scope}</small>
        </div>
        <div className="academic-record-context__item academic-record-context__item--award">
          <span>{locale === "en" ? "Academic recognition" : "學業榮譽"}</span>
          <strong>{academicRecordText(academicAward, locale)}</strong>
          <small>{academicRecordText(academicAwardContext, locale)}</small>
        </div>
        <a className="academic-record-context__link" href={localizePath("/academics/course-record", locale)}>
          {locale === "en" ? "View all courses & grades" : "查看全部課程與成績"}
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>

      <p className="academic-record-disclosure">
        {academicRecordText(disclosure === "compact" ? academicRecordDisclosureCompact : academicRecordDisclosure, locale)}{" "}
        {disclosure === "compact" ? (
          <a href={localizePath("/experience/ntu-gpa-a-plus-record", locale)}>
            {locale === "en" ? "GPA calculations & sources" : "GPA 採計與換算說明"}
          </a>
        ) : (
          <span className="academic-record-disclosure__sources">
            <a href={localizePath("/experience/ntu-gpa-a-plus-record", locale)}>
              {locale === "en" ? "GPA calculation details" : "GPA 採計與換算說明"}
            </a>
            <span aria-hidden="true"> · </span>
            {locale === "en" ? "References: " : "參考來源："}
            <a href={academicRecordSources.majorDefinition} target="_blank" rel="noreferrer">
              {locale === "en" ? "UC Berkeley ME MEng admissions guidance" : "UC Berkeley 機械工程 MEng 招生說明"}
            </a>
            <span aria-hidden="true"> · </span>
            <a href={academicRecordSources.conversion} target="_blank" rel="noreferrer">
              {locale === "en" ? "UC Berkeley international GPA conversion table" : "UC Berkeley 國際 GPA 換算表"}
            </a>
            <span aria-hidden="true"> · </span>
            <a href={academicRecordSources.separateMajors} target="_blank" rel="noreferrer">
              {locale === "en" ? "Claremont McKenna major-GPA guidance" : "Claremont McKenna College 主修 GPA 計算說明"}
            </a>
          </span>
        )}
      </p>
    </div>
  );
}
