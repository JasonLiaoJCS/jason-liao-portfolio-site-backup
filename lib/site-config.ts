export const siteConfig = {
  name: "Jason Liao",
  formalName: "Chih-Hsiang Liao",
  nameZh: "廖致翔",
  email: "jasonliaohyh9815@gmail.com",
  cvPath: "/documents/Chih-Hsiang_Liao_Public_Academic_CV_2026-08.pdf",
  courseRecordPath: "/documents/Jason_Liao_Public_Course_Record_Through_Spring_2026.pdf",
  defaultUrl: "https://jason-liao-academic-portfolio.jasonliaock26.chatgpt.site",
  title: "Jason Liao — Robotics, Mechanics & Applied Mathematics",
  titleZh: "廖致翔｜機器人、力學與應用數學",
  description:
    "The academic portfolio of Jason Liao: robotics research, engineering systems, applied mathematics, coursework, teaching, and leadership.",
  descriptionZh:
    "廖致翔的學術作品集：機器人研究、工程系統、應用數學、課程成果、教學與領導經驗。",
} as const;

export type Locale = "en" | "zh";

export function localizePath(path: string, locale: Locale): string {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  if (locale === "en") return normalized;
  return normalized === "/" ? "/zh" : `/zh${normalized}`;
}

export function unlocalizePath(path: string): string {
  if (path === "/zh") return "/";
  return path.replace(/^\/zh(?=\/)/, "") || "/";
}

export function absoluteUrl(path = "/"): string {
  const base = process.env.SITE_URL ?? siteConfig.defaultUrl;
  return new URL(path, base).toString();
}
