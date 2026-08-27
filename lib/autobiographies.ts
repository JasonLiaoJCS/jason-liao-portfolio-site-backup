import { autobiographyFromConfusion } from "./autobiography-from-confusion";
import { gewuXiangzhePreface } from "./autobiography-gewu-preface";

export type AutobiographyParagraphKind =
  | "title"
  | "subtitle"
  | "byline"
  | "section"
  | "paragraph"
  | "spacer";

export type AutobiographyParagraph = {
  sourceIndex: number;
  kind: AutobiographyParagraphKind;
  zh: string;
  en: string;
};

export type LiteraryAutobiography = {
  id: string;
  canonicalRoute: string;
  title: { en: string; zh: string };
  summary: { en: string; zh: string };
  card: { en: string; zh: string };
  paragraphs: readonly AutobiographyParagraph[];
};

export const autobiographies: readonly LiteraryAutobiography[] = [
  {
    id: autobiographyFromConfusion.id,
    canonicalRoute: autobiographyFromConfusion.canonicalRoute,
    title: autobiographyFromConfusion.title,
    summary: {
      en: "The education, choices, and convictions that carried me from mathematical intuition, through disorientation, toward a life in mechanics, robotics, and inner coherence.",
      zh: "我一路走來的求學、選擇與人生信念",
    },
    card: {
      en: "A complete personal essay tracing mathematical intuition, a loss of direction in high school, rebuilding at university, and a coherent place in mechanics and robotics.",
      zh: "一篇完整自傳，記述數學直覺、高中時期的迷惘、大學階段的重建，以及最終在機械工程與機器人領域找到自洽位置的過程。",
    },
    paragraphs: autobiographyFromConfusion.paragraphs.map((paragraph) => ({
      ...paragraph,
      kind: paragraph.sourceIndex === 1 ? "title" as const : paragraph.kind,
    })),
  },
  {
    id: gewuXiangzhePreface.id,
    canonicalRoute: gewuXiangzhePreface.canonicalRoute,
    title: gewuXiangzhePreface.title,
    summary: {
      en: "A literary self-preface on the name Gezhi, the discipline of investigating things, and a life held between reason, ardor, friendship, and the open sky.",
      zh: "以「格致」為字、以「格物翔者」為號，寫下求知、立志、待人與行世之間的一生自許。",
    },
    card: {
      en: "A compact, lyrical self-preface that unfolds the meanings of Gezhi and Gewu Xiangzhe: reason as the bones, ardor as the heart.",
      zh: "一篇短而凝練的文學自序，展開「格致」與「格物翔者」的意義：理性為骨，熱血為心。",
    },
    paragraphs: gewuXiangzhePreface.paragraphs,
  },
] as const;

const normalizeRoute = (path: string): string => {
  const clean = (path.split(/[?#]/, 1)[0] || "/").replace(/\/+$/, "") || "/";
  return clean.startsWith("/zh/") ? clean.slice(3) : clean;
};

export const getAutobiographyByRoute = (
  path: string,
): LiteraryAutobiography | undefined => {
  const canonical = normalizeRoute(path);
  return autobiographies.find((article) => article.canonicalRoute === canonical);
};

export const getOtherAutobiography = (
  id: string,
): LiteraryAutobiography | undefined => autobiographies.find((article) => article.id !== id);
