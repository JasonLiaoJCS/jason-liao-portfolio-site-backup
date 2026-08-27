"use client";

import { ArrowRight, Check, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import {
  courseRecordDomainLabel,
  courseRecordOutcome,
  publicCourseRecord,
  type CourseRecordDomain,
  type PublicCourseRecord,
} from "@/lib/course-record";
import type { Locale } from "@/lib/content-data";
import { localizePath } from "@/lib/site-config";

type IndexedCourse = PublicCourseRecord & {
  semesterId: string;
  semesterLabel: string;
};

const COURSE_DOMAINS = Object.keys(publicCourseRecord.domains) as CourseRecordDomain[];

function normalizeCourseSearch(value: string, locale: Locale) {
  return value
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/\p{Mark}+/gu, "")
    .toLocaleLowerCase(locale === "en" ? "en" : "zh-TW")
    .replace(/[\p{Punctuation}\p{Symbol}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function finderStatusLabel(status: PublicCourseRecord["status"], locale: Locale) {
  const labels = {
    graded: { en: "Graded", zh: "計分" },
    pass: { en: "Pass", zh: "通過" },
    withdrawn: { en: "Withdrawn", zh: "停修" },
    exempt: { en: "Exempt", zh: "免修" },
  };
  return labels[status][locale];
}

export function CourseRecordFinder({ locale }: { locale: Locale }) {
  const english = locale === "en";
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<CourseRecordDomain | "all">("all");
  const [aPlusOnly, setAPlusOnly] = useState(false);
  const [evidenceOnly, setEvidenceOnly] = useState(false);

  const indexedCourses = useMemo<IndexedCourse[]>(() => [
    ...[...publicCourseRecord.semesters].reverse().flatMap((semester) => semester.courses.map((course) => ({
      ...course,
      semesterId: semester.id,
      semesterLabel: semester[locale],
    }))),
    ...publicCourseRecord.exemptions.map((course) => ({
      ...course,
      semesterId: english ? "ADDITIONAL" : "補充",
      semesterLabel: english ? "Exemptions" : "免修紀錄",
    })),
  ], [english, locale]);

  const normalizedQuery = normalizeCourseSearch(query, locale);
  const hasFilters = Boolean(normalizedQuery || domain !== "all" || aPlusOnly || evidenceOnly);
  const results = useMemo(() => {
    if (!hasFilters) return [];
    return indexedCourses.filter((course) => {
      if (domain !== "all" && course.domain !== domain) return false;
      if (aPlusOnly && course.result.zh !== "A+") return false;
      if (evidenceOnly && !course.relatedRoute) return false;
      if (!normalizedQuery) return true;
      const searchable = normalizeCourseSearch([
        course.code,
        course.title.en,
        course.title.zh,
        courseRecordDomainLabel(course.domain, "en"),
        courseRecordDomainLabel(course.domain, "zh"),
        course.semesterLabel,
      ].join(" "), locale);
      return normalizedQuery.split(" ").every((token) => searchable.includes(token));
    });
  }, [aPlusOnly, domain, evidenceOnly, hasFilters, indexedCourses, locale, normalizedQuery]);

  const representedCredits = results.reduce((total, course) => total + course.credits, 0);
  const clearFilters = () => {
    setQuery("");
    setDomain("all");
    setAPlusOnly(false);
    setEvidenceOnly(false);
  };

  return (
    <section id="course-finder" className="course-finder" aria-labelledby="course-finder-title">
      <div className="course-finder__heading">
        <div>
          <p className="eyebrow"><SlidersHorizontal size={14} aria-hidden="true" />{english ? "Course finder" : "課程查詢"}</p>
          <h3 id="course-finder-title">{english ? "Search the complete course record." : "查詢八學期修課紀錄"}</h3>
        </div>
        <p>{english
          ? "Search by title or course code, then narrow the record by field, grade, or related work on this site. The full semester record remains below."
          : "可依課名或課號搜尋，並以領域、成績與相關成果篩選；下方仍保留逐學期完整紀錄。"}</p>
      </div>

      <div className="course-finder__controls">
        <label className="course-finder__search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{english ? "Search course title or code" : "搜尋課名或課號"}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={english ? "Course title or code" : "輸入課名或課號"}
          />
        </label>
        <div className="course-finder__domain-rail" role="group" aria-label={english ? "Filter by course field" : "依課程領域篩選"}>
          <button type="button" className={domain === "all" ? "is-active" : ""} aria-pressed={domain === "all"} onClick={() => setDomain("all")}>
            {english ? "All fields" : "全部領域"}
          </button>
          {COURSE_DOMAINS.map((item) => (
            <button key={item} type="button" className={domain === item ? "is-active" : ""} aria-pressed={domain === item} onClick={() => setDomain(item)}>
              {courseRecordDomainLabel(item, locale)}
            </button>
          ))}
        </div>
        <div className="course-finder__toggles" role="group" aria-label={english ? "Additional course filters" : "其他課程篩選"}>
          <button type="button" className={aPlusOnly ? "is-active" : ""} aria-pressed={aPlusOnly} onClick={() => setAPlusOnly((value) => !value)}>
            <Check size={15} aria-hidden="true" />{english ? "A+ only" : "僅顯示 A+"}
          </button>
          <button type="button" className={evidenceOnly ? "is-active" : ""} aria-pressed={evidenceOnly} onClick={() => setEvidenceOnly((value) => !value)}>
            <ArrowRight size={15} aria-hidden="true" />{english ? "With linked work" : "附相關成果"}
          </button>
          <button type="button" className="course-finder__reset" onClick={clearFilters} disabled={!hasFilters}>
            <RotateCcw size={14} aria-hidden="true" />{english ? "Reset" : "重設"}
          </button>
        </div>
      </div>

      <div className="course-finder__summary" role="status" aria-live="polite" aria-atomic="true">
        {hasFilters
          ? <><strong>{results.length}</strong><span>{english ? "matching records" : "筆符合紀錄"}</span><i aria-hidden="true" /><strong>{representedCredits}</strong><span>{english ? "credits represented" : "學分"}</span></>
          : <span>{english ? "Enter a term or choose a filter to begin." : "輸入關鍵字或選擇篩選條件即可開始查詢。"}</span>}
      </div>

      {hasFilters ? (
        results.length ? (
          <ol className="course-finder__results">
            {results.map((course, index) => (
              <li key={`${course.semesterId}-${course.code}-${index}`}>
                <div className="course-finder__result-meta">
                  <span>{course.semesterId}</span>
                  <span>{courseRecordDomainLabel(course.domain, locale)}</span>
                </div>
                <div className="course-finder__result-title">
                  <strong>{course.title[locale]}</strong>
                  <small>{course.code} · {course.credits} {english ? "credits" : "學分"}</small>
                </div>
                <div className="course-finder__result-outcome">
                  <strong>{courseRecordOutcome(course, locale)}</strong>
                  <small>{finderStatusLabel(course.status, locale)}</small>
                </div>
                {course.relatedRoute ? (
                  <a href={localizePath(course.relatedRoute, locale)}>
                    {english ? "View work" : "查看成果"}<ArrowRight size={15} aria-hidden="true" />
                  </a>
                ) : <span className="course-finder__no-link">{english ? "No related work linked" : "無相關成果連結"}</span>}
              </li>
            ))}
          </ol>
        ) : (
          <div className="course-finder__empty">
            <strong>{english ? "No matching courses." : "沒有符合條件的課程。"}</strong>
            <p>{english ? "Try a broader term or remove one of the filters." : "可改用較廣泛的關鍵字，或取消部分篩選條件。"}</p>
          </div>
        )
      ) : null}
    </section>
  );
}
