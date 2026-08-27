import facts from "./academic-record.json";

export type AcademicRecordLocale = "en" | "zh";

type Localized = { en: string; zh: string };

export const academicRecordFacts = facts;

export type AcademicHighlight = {
  id: string;
  value: string;
  secondary?: string;
  label: string;
  scope: string;
};

const localized = (value: Localized, locale: AcademicRecordLocale) => value[locale];
const scaleValue = (value: string, locale: AcademicRecordLocale) => locale === "zh" ? value.replaceAll(" / ", "／") : value;

export function academicHighlights(locale: AcademicRecordLocale): AcademicHighlight[] {
  return [
    {
      id: "mechanical-major",
      value: scaleValue(facts.mechanicalMajor.value430, locale),
      secondary: locale === "en"
        ? `${facts.mechanicalMajor.value400} · course-by-course conversion`
        : `逐科重算 ${scaleValue(facts.mechanicalMajor.value400, locale)}`,
      label: locale === "en" ? "Mechanical Engineering Major GPA" : "機械工程主修 GPA",
      scope: locale === "en"
        ? `${facts.mechanicalMajor.records} graded records · ${facts.mechanicalMajor.credits} graded credits`
        : `${facts.mechanicalMajor.records} 筆計分紀錄 · ${facts.mechanicalMajor.credits} 個計分學分`,
    },
    {
      id: "mechanical-required",
      value: scaleValue(facts.mechanicalRequired.value430, locale),
      secondary: locale === "en"
        ? `${facts.mechanicalRequired.value400} · course-by-course conversion`
        : `逐科重算 ${scaleValue(facts.mechanicalRequired.value400, locale)}`,
      label: locale === "en" ? "Required ME Coursework GPA" : "機械系定必修 GPA",
      scope: locale === "en"
        ? `${facts.mechanicalRequired.records} graded records · ${facts.mechanicalRequired.credits} graded credits`
        : `${facts.mechanicalRequired.records} 筆計分紀錄 · ${facts.mechanicalRequired.credits} 個計分學分`,
    },
    {
      id: "a-plus",
      value: locale === "en" ? `${facts.aPlus.credits} / ${facts.gradedCredits}` : `${facts.aPlus.credits}／${facts.gradedCredits}`,
      secondary: locale === "en"
        ? `${facts.aPlus.creditShare} of graded credits`
        : `占計分學分 ${facts.aPlus.creditShare}`,
      label: locale === "en" ? "Graded credits earned at A+" : "A+ 計分學分",
      scope: locale === "en"
        ? `${facts.aPlus.records} of ${facts.gradedRecords} graded course records`
        : `${facts.gradedRecords} 筆計分修課中有 ${facts.aPlus.records} 筆獲 A+`,
    },
    {
      id: "core",
      value: locale === "en" ? `${facts.core.credits} credits` : `${facts.core.credits} 學分`,
      secondary: scaleValue(facts.core.value430, locale),
      label: locale === "en"
        ? "Mathematics, core mechanics & computation · all A+"
        : "數學、核心力學與計算課程 · 全數 A+",
      scope: locale === "en"
        ? `${facts.core.records} graded course records`
        : `${facts.core.records} 筆計分修課紀錄`,
    },
  ];
}

export function overallAcademicContext(locale: AcademicRecordLocale) {
  return {
    label: locale === "en" ? "Overall cumulative GPA" : "整體累計 GPA",
    value: scaleValue(facts.overall.value430, locale),
    secondary: locale === "en"
      ? `${facts.overall.value400} · course-by-course conversion`
      : `逐科重算 ${scaleValue(facts.overall.value400, locale)}`,
    scope: locale === "en"
      ? `${facts.overall.credits} graded credits across eight semesters`
      : `8 學期 · ${facts.overall.credits} 個計分學分`,
  };
}

export const academicAward: Localized = {
  en: "NTU Academic Excellence Award",
  zh: "臺大書卷獎",
};

export const academicAwardContext: Localized = {
  en: "Awarded for academic achievement at National Taiwan University",
  zh: "肯定在臺大持續穩定的學業表現",
};

export const academicRecordDisclosure: Localized = {
  en: "All GPA figures are calculated from course-level grades and actual credits. The 4.00-scale calculations use UC Berkeley Mechanical Engineering's published course-by-course conversion table; the major-GPA course set also follows published definitions for technical coursework and separate majors. These values are self-calculated and are not official NTU transcript fields; the official transcript remains the authoritative academic record.",
  zh: "所有 GPA 均依單科成績與實際學分重新計算。4.00 制數值採 UC Berkeley Mechanical Engineering 公開的逐科對照表；主修 GPA 的課程範圍則參考校方對技術主修課程與雙主修分開計算的公開說明。上述數值為自行換算，正式學業紀錄仍以臺大核發之成績單為準。",
};

export const academicRecordDisclosureCompact: Localized = {
  en: "Calculated from course-level grades and actual credits using the published references linked below. These values are not official NTU transcript fields.",
  zh: "依單科成績與實際學分計算；主修 GPA 採計範圍與 4.00 制換算參考大學公開說明。以上數值並非臺大成績單核發欄位。",
};

export const academicRecordSources = {
  majorDefinition: "https://me.berkeley.edu/graduate/meng-admissions/",
  conversion: "https://me.berkeley.edu/wp-content/uploads/2019/01/International-GPA-Conversion.pdf",
  separateMajors: "https://www.cmc.edu/registrar/calculating-major-gpa",
} as const;

export const academicRecordIntro: Localized = {
  en: "Mechanical Engineering results most directly reflect my preparation in mechanics, robotics, and systems work; the overall GPA provides the broader academic context.",
  zh: "機械工程成績最能反映我在力學、機器人與系統領域的學術準備；整體累計 GPA 則提供完整的修課背景。",
};

export function academicRecordText(value: Localized, locale: AcademicRecordLocale) {
  return localized(value, locale);
}
