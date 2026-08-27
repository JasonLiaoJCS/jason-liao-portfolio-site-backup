import type { Locale, Maturity } from "./content-data";

const maturityLabels: Record<Maturity, { en: string; zh: string }> = {
  verified: { en: "Verified result", zh: "結果已驗證" },
  reported: { en: "Reported in course documentation", zh: "依課程報告記載" },
  implemented_smoke_tested: {
    en: "Prototype implemented and initially tested",
    zh: "已實作並完成初步測試",
  },
  in_progress: { en: "Ongoing", zh: "持續進行中" },
  target: { en: "Planned", zh: "規劃中" },
  not_applicable: { en: "Personal record", zh: "個人紀錄" },
};

export function maturityLabel(value: Maturity, locale: Locale): string {
  return maturityLabels[value][locale];
}
