import records from "./event-public-details.json";
import type { Locale } from "./content-data";

export type EventPublicDetailBlock =
  | { type: "heading"; level: 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type EventPublicDetailRecord = {
  eventId: string;
  route: string;
  sourceStatus: "canonical_markdown" | "missing_public_detail_source";
  blocks: Record<Locale, EventPublicDetailBlock[]>;
};

const eventPublicDetails = records as EventPublicDetailRecord[];
const eventPublicDetailIndex = new Map(
  eventPublicDetails.map((record) => [record.route, record] as const),
);

export function getEventPublicDetail(
  route: string,
): EventPublicDetailRecord | undefined {
  return eventPublicDetailIndex.get(route);
}

export const eventPublicDetailExceptions = eventPublicDetails.filter(
  (record) => record.sourceStatus === "missing_public_detail_source",
);

export { eventPublicDetails };
