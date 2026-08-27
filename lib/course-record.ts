import record from "./course-record.json";

import type { Locale } from "./content-data";

export type CourseRecordStatus = "graded" | "pass" | "withdrawn" | "exempt";
export type CourseRecordDomain = keyof typeof record.domains;

export type LocalizedCourseText = { en: string; zh: string };

export type PublicCourseRecord = {
  code: string;
  title: LocalizedCourseText;
  credits: number;
  result: LocalizedCourseText;
  status: CourseRecordStatus;
  domain: CourseRecordDomain;
  note?: LocalizedCourseText;
  relatedRoute?: string;
};

export type PublicCourseSemester = {
  id: string;
  en: string;
  zh: string;
  earnedCredits: number;
  gradedCredits: number;
  gpa: string;
  courses: PublicCourseRecord[];
};

export type CapabilityHighlight = {
  id: string;
  value: string;
  records: number;
  credits: number;
  title: LocalizedCourseText;
  detail: LocalizedCourseText;
};

export const publicCourseRecord = record as {
  updatedThrough: LocalizedCourseText;
  titleTranslationStatus: LocalizedCourseText;
  counts: typeof record.counts;
  domains: Record<CourseRecordDomain, LocalizedCourseText>;
  capabilityHighlights: CapabilityHighlight[];
  semesters: PublicCourseSemester[];
  exemptions: PublicCourseRecord[];
};

export const courseRecordText = (text: LocalizedCourseText, locale: Locale) => text[locale];

export const courseRecordOutcome = (course: PublicCourseRecord, locale: Locale) => course.result[locale];

export const courseRecordDomainLabel = (domain: CourseRecordDomain, locale: Locale) =>
  publicCourseRecord.domains[domain][locale];

export const completedCourseRecords = publicCourseRecord.semesters
  .flatMap((semester) => semester.courses)
  .filter((course) => course.status === "graded" || course.status === "pass");

export const courseRecordSearchKeywords = (locale: Locale) => {
  const courses = [
    ...publicCourseRecord.semesters.flatMap((semester) => semester.courses),
    ...publicCourseRecord.exemptions,
  ];
  return [...new Set(courses.flatMap((course) => [
    course.code,
    course.title[locale],
    publicCourseRecord.domains[course.domain][locale],
  ]))].join(" ");
};
