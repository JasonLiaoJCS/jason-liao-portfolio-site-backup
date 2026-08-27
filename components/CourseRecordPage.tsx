/* eslint-disable @next/next/no-img-element -- PDF preview is a generated, metadata-scrubbed local derivative. */
import { ArrowRight, BookOpen, Download, ExternalLink, FileText } from "lucide-react";

import {
  academicAward,
  academicAwardContext,
  academicHighlights,
  academicRecordText as academicText,
  overallAcademicContext,
} from "@/lib/academic-record";
import {
  courseRecordDomainLabel,
  courseRecordOutcome,
  courseRecordText,
  publicCourseRecord,
  type PublicCourseRecord,
} from "@/lib/course-record";
import type { Locale, ResolvedPage } from "@/lib/content-data";
import type { PublicAsset } from "@/lib/public-assets";
import { localizePath, siteConfig } from "@/lib/site-config";
import { CourseRecordFinder } from "./CourseRecordFinder";

type Props = {
  locale: Locale;
  page: ResolvedPage;
  document?: PublicAsset;
};

const alternateLocale = (locale: Locale): Locale => locale === "en" ? "zh" : "en";

function statusLabel(status: PublicCourseRecord["status"], locale: Locale) {
  const labels = {
    graded: { en: "Graded", zh: "計分" },
    pass: { en: "Pass", zh: "通過" },
    withdrawn: { en: "Withdrawn", zh: "停修" },
    exempt: { en: "Exempt", zh: "免修" },
  };
  return labels[status][locale];
}

function CourseTable({ locale, semesterId, courses }: { locale: Locale; semesterId: string; courses: PublicCourseRecord[] }) {
  const otherLocale = alternateLocale(locale);
  return (
    <div className="course-record-table-wrap">
      <table className="course-record-table">
        <thead>
          <tr>
            <th scope="col">{locale === "en" ? "Course" : "課程"}</th>
            <th scope="col">{locale === "en" ? "Code" : "課號"}</th>
            <th scope="col">{locale === "en" ? "Credits" : "學分"}</th>
            <th scope="col">{locale === "en" ? "Result" : "成績／結果"}</th>
            <th scope="col">{locale === "en" ? "Portfolio" : "作品連結"}</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr
              className={`course-record-row course-record-row--${course.status}${course.result.zh === "A+" ? " course-record-row--a-plus" : ""}`}
              data-course-record
              key={`${semesterId}-${course.code}-${index}`}
            >
              <td className="course-record-row__course">
                <strong>{course.title[locale]}</strong>
                <small>{course.title[otherLocale]}</small>
                <span>{courseRecordDomainLabel(course.domain, locale)}</span>
                {course.note ? <em>{course.note[locale]}</em> : null}
              </td>
              <td className="course-record-row__code"><small>{locale === "en" ? "Code" : "課號"}</small><span>{course.code}</span></td>
              <td className="course-record-row__credits"><small>{locale === "en" ? "Credits" : "學分"}</small><span>{course.credits}</span></td>
              <td className="course-record-row__result"><small>{locale === "en" ? "Result" : "成績／結果"}</small><strong>{courseRecordOutcome(course, locale)}</strong><span>{statusLabel(course.status, locale)}</span></td>
              <td className="course-record-row__evidence">
                {course.relatedRoute ? (
                  <a href={localizePath(course.relatedRoute, locale)}>
                    {locale === "en" ? "View work" : "查看成果"}<ArrowRight size={14} aria-hidden="true" />
                  </a>
                ) : <span aria-hidden="true">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CourseRecordPage({ locale, page, document }: Props) {
  const english = locale === "en";
  const counts = publicCourseRecord.counts;
  const semesters = [...publicCourseRecord.semesters].reverse();
  const pdfPath = document?.publicPath ?? siteConfig.courseRecordPath;
  const academicSignals = academicHighlights(locale);
  const major = academicSignals.find((item) => item.id === "mechanical-major")!;
  const required = academicSignals.find((item) => item.id === "mechanical-required")!;
  const aPlus = academicSignals.find((item) => item.id === "a-plus")!;
  const core = academicSignals.find((item) => item.id === "core")!;
  const overall = overallAcademicContext(locale);

  return (
    <main id="main-content" className="page-shell course-record-page" tabIndex={-1}>
      <header className="page-hero course-record-hero">
        <div className="page-hero__inner course-record-hero__inner">
          <div>
            <nav className="page-breadcrumb" aria-label={english ? "Breadcrumb" : "路徑導覽"}>
              <a href={localizePath("/", locale)}>{english ? "Home" : "首頁"}</a>
              <span aria-hidden="true">/</span>
              <a href={localizePath("/academics", locale)}>{english ? "Academics" : "學術與課程"}</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{page.title}</span>
            </nav>
            <p className="eyebrow">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p className="page-hero__lede">{page.summary}</p>
            <div className="button-row page-hero__actions">
              <a className="button" href={pdfPath} download>
                <Download size={16} aria-hidden="true" />{english ? "Download the bilingual PDF" : "下載雙語 PDF"}
              </a>
              <a className="button button--quiet" href="#semester-record">
                <BookOpen size={16} aria-hidden="true" />{english ? "View all courses" : "查看全部課程"}
              </a>
            </div>
          </div>
          <aside className="course-record-hero__folio" aria-label={english ? "Course record coverage" : "修課紀錄範圍"}>
            <span>{english ? "COURSE AND GRADE RECORD" : "修課與成績紀錄"}</span>
            <strong>{counts.gradedRecords}</strong>
            <p>{english ? "graded courses" : "門計分課程"}</p>
            <div><b>{counts.earnedCredits}</b><small>{english ? "earned credits" : "已取得學分"}</small></div>
            <div><b>8</b><small>{english ? "semesters" : "學期"}</small></div>
          </aside>
        </div>
      </header>

      <nav className="landing-outline course-record-outline" aria-label={english ? "On this page" : "本頁導覽"}>
        <div className="container landing-outline__inner">
          <span>{english ? "On this page" : "本頁導覽"}</span>
          <div>
            {[
              ["record-highlights", english ? "Academic highlights" : "學業亮點"],
              ["semester-record", english ? "Complete record & course finder" : "完整修課紀錄"],
              ["capability-map", english ? "Coursework by field" : "課程領域"],
              ["record-method", english ? "Method & download" : "方法與下載"],
            ].map(([id, label], index) => (
              <a href={`#${id}`} key={id}><small aria-hidden="true">0{index + 1}</small>{label}</a>
            ))}
          </div>
        </div>
      </nav>

      <section className="section section--graphite course-record-proof-section" id="record-highlights">
        <div className="container">
          <div className="section-header section-header--split">
            <div><p className="eyebrow">{english ? "Academic highlights" : "學業成果"}</p><h2>{english ? "Key academic results" : "主要學業成果"}</h2></div>
            <p>{english ? "Highlights include the NTU Academic Excellence Award, a 4.19 / 4.30 Mechanical Engineering Major GPA, 110 graded credits at A+, and 50 core credits completed at 4.30 / 4.30. The cumulative GPA and full course record appear below." : "臺大書卷獎、機械工程主修 GPA、A+ 學分占比與核心課程表現整理如下；完整課程與成績則依學期列於後方。"}</p>
          </div>
          <div className="course-record-strengths">
            <article className="course-record-award">
              <span>{english ? "Academic honor" : "學業榮譽"}</span>
              <h3>{academicText(academicAward, locale)}</h3>
              <p>{academicText(academicAwardContext, locale)}</p>
            </article>
            <div className="course-record-strength-grid" aria-label={english ? "Primary academic strengths" : "主要學業優勢"}>
              {[major, aPlus, core].map((item, index) => (
                <article className={`course-record-strength-card${index === 0 ? " course-record-strength-card--primary" : ""}`} key={item.id}>
                  <i aria-hidden="true">0{index + 1}</i>
                  <strong>{item.value}</strong>
                  {item.secondary ? <small>{item.secondary}</small> : null}
                  <h3>{item.label}</h3>
                  <p>{item.scope}</p>
                </article>
              ))}
            </div>
            <div className="course-record-scope-band">
              <div>
                <span>{required.label}</span>
                <strong>{required.value}</strong>
                <small>{required.secondary} · {required.scope}</small>
              </div>
              <div>
                <span>{overall.label}</span>
                <strong>{overall.value}</strong>
                <small>{overall.secondary} · {overall.scope}</small>
              </div>
              <a href={localizePath("/experience/ntu-gpa-a-plus-record", locale)}>
                {english ? "GPA calculation method" : "GPA 採計與換算說明"}<ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section course-record-semesters" id="semester-record">
        <div className="container">
          <div className="section-header section-header--split">
            <div><p className="eyebrow">{english ? "Complete course record" : "完整修課紀錄"}</p><h2>{english ? "Courses and grades by semester." : "八個學期的課程、學分與成績"}</h2></div>
            <p>{english ? `The record lists each course title, code, credit value, and result by semester: ${counts.gradedRecords} graded courses, ${counts.passRecords} pass/fail courses, and ${counts.withdrawnRecords} withdrawals.` : `所有計分、通過制與停修紀錄均依學期列出，並標示課名、課號、學分與成績；共 ${counts.gradedRecords} 門計分課程、${counts.passRecords} 門通過制課程與 ${counts.withdrawnRecords} 筆停修紀錄。`}</p>
          </div>
          <CourseRecordFinder locale={locale} />
          <div className="course-record-legend" aria-label={english ? "Record legend" : "紀錄圖例"}>
            <span><i className="course-record-legend__a" />A+</span>
            <span><i className="course-record-legend__graded" />{english ? "Graded" : "計分"}</span>
            <span><i className="course-record-legend__pass" />{english ? "Pass / exempt" : "通過／免修"}</span>
            <span><i className="course-record-legend__withdrawn" />{english ? "Withdrawn" : "停修"}</span>
          </div>
          <div className="course-semester-list">
            {semesters.map((semester, index) => (
              <details className="course-semester" open={index < 2} key={semester.id}>
                <summary>
                  <div><small>{semester.id}</small><h3>{semester[locale]}</h3></div>
                  <div className="course-semester__summary-metrics">
                    <span><b>{semester.earnedCredits}</b>{english ? " earned credits" : " 已取得學分"}</span>
                    <span><b>{semester.gradedCredits}</b>{english ? " graded credits" : " 計分學分"}</span>
                    <span><b>{semester.courses.length}</b>{english ? " records" : " 筆紀錄"}</span>
                  </div>
                  <i aria-hidden="true">+</i>
                </summary>
                <CourseTable locale={locale} semesterId={semester.id} courses={semester.courses} />
              </details>
            ))}
            <details className="course-semester course-semester--exemptions">
              <summary>
                <div><small>{english ? "ADDITIONAL" : "補充"}</small><h3>{english ? "Exemptions" : "免修紀錄"}</h3></div>
                <div className="course-semester__summary-metrics"><span><b>{publicCourseRecord.exemptions.length}</b>{english ? " records" : " 筆紀錄"}</span></div>
                <i aria-hidden="true">+</i>
              </summary>
              <CourseTable locale={locale} semesterId="exemptions" courses={publicCourseRecord.exemptions} />
            </details>
          </div>
          <p className="course-record-translation-note">{courseRecordText(publicCourseRecord.titleTranslationStatus, locale)}</p>
        </div>
      </section>

      <section className="section section--paper" id="capability-map">
        <div className="container">
          <div className="section-header section-header--split">
            <div><p className="eyebrow">{english ? "Coursework by field" : "課程領域"}</p><h2>{english ? "Preparation across mathematics, mechanics, control, design, and thermal sciences." : "數學、力學、控制、設計與熱流領域的課程基礎。"}</h2></div>
            <p>{english ? "The groupings below summarize related coursework. GPA values are shown only for fields with a documented calculation." : "以下分組依課程內容整理；GPA 僅列出已有明確計算依據的範圍，正式成績仍以臺大成績單為準。"}</p>
          </div>
          <div className="course-capability-grid">
            {publicCourseRecord.capabilityHighlights.map((item, index) => (
              <article className="course-capability-card" key={item.id}>
                <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                <span>{item.records} {english ? "records" : "筆"} · {item.credits} {english ? "credits" : "學分"}</span>
                <h3>{courseRecordText(item.title, locale)}</h3>
                <strong>{locale === "zh" ? item.value.replaceAll(" / ", "／") : item.value}</strong>
                <p>{courseRecordText(item.detail, locale)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--paper course-record-method" id="record-method">
        <div className="container course-record-method__grid">
          <div>
            <p className="eyebrow">{english ? "Record and calculation notes" : "資料來源與計算方式"}</p>
            <h2>{english ? "Course-by-course record compiled from NTU academic records." : "依臺大學業紀錄整理的修課與成績資料"}</h2>
            <p>{english ? "Course titles, credits, letter grades, and enrollment status are compiled from records through Spring 2026. GPA figures are credit-weighted self-calculations, and the 4.00-scale values use a documented course-by-course conversion. This page is not an official transcript." : "課名、學分、字母成績與修課狀態依截至 2026 年春季的學業資料整理；GPA 按實際學分加權計算，4.00 制採逐科換算。正式成績仍以臺大核發的成績單為準。"}</p>
            <div className="button-row">
              <a className="button" href={localizePath("/experience/ntu-gpa-a-plus-record", locale)}>{english ? "GPA calculation method" : "GPA 採計與換算說明"}<ArrowRight size={15} aria-hidden="true" /></a>
              <a className="button button--quiet" href={localizePath("/academics", locale)}>{english ? "Return to academic work" : "回到學術與課程成果"}</a>
            </div>
          </div>
          <article className="course-record-download-card">
            <div className="course-record-download-card__cover" aria-hidden="true">
              {document?.previewPath ? <img src={document.previewPath} alt="" width="520" height="736" loading="lazy" decoding="async" /> : <><FileText size={34} /><span>PDF</span></>}
            </div>
            <div>
              <span>{english ? "Bilingual PDF" : "中英雙語 PDF"}</span>
              <h3>{english ? "Complete Course & Grade Record · Through Spring 2026" : "完整修課與成績紀錄｜截至 2026 年春季"}</h3>
              <p>{english ? "A bilingual PDF containing academic highlights, calculation notes, and the complete semester-by-semester record." : "收錄學業概況、GPA 採計說明與逐學期修課紀錄，可於瀏覽器開啟或下載留存。"}</p>
              <div className="button-row">
                <a className="button button--small" href={pdfPath} target="_blank" rel="noreferrer">{english ? "Open PDF" : "開啟 PDF"}<ExternalLink size={14} aria-hidden="true" /></a>
                <a className="button button--small button--quiet" href={pdfPath} download>{english ? "Download" : "下載"}<Download size={14} aria-hidden="true" /></a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
