import records from "./coursework-public-details.json";
import type { Locale } from "./content-data";

export type CourseworkPublicDetailBlock =
  | { type: "heading"; level: 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type CourseworkPublicDetailRecord = {
  courseworkId: string;
  route: string;
  sourceStatus: "canonical_markdown";
  blocks: Record<Locale, CourseworkPublicDetailBlock[]>;
};

const courseworkPublicDetails = records as CourseworkPublicDetailRecord[];
const courseworkPublicDetailIndex = new Map(
  courseworkPublicDetails.map((record) => [record.route, record] as const),
);

export function getCourseworkPublicDetail(
  route: string,
): CourseworkPublicDetailRecord | undefined {
  return courseworkPublicDetailIndex.get(route);
}

export { courseworkPublicDetails };
