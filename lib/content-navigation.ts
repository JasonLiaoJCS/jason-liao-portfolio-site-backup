import type { ContentEntity } from "./content-data";

/**
 * Resolve the most useful visitor-facing parent for a content entity.
 *
 * Many records keep the historical `/experience/*` URL so old links remain
 * stable. Their breadcrumb should still lead to the subject collection where
 * a visitor would naturally continue reading, rather than treating every
 * record as a generic update.
 */
export function parentRouteForEntity(entity: ContentEntity): string | undefined {
  const route = entity.route ?? "";

  if (route === "/experience/ntu-gpa-a-plus-record") return "/academics/course-record";
  if (route.startsWith("/research/")) return "/research";
  if (route.startsWith("/projects/")) return "/projects";
  if (route.startsWith("/academics/")) return "/academics";
  if (route.startsWith("/writing/teaching/")) return "/writing/teaching";
  if (route.startsWith("/writing/")) return "/writing";

  if (entity.kind === "research") return "/research";
  if (entity.kind === "project") return "/projects";
  if (entity.kind === "coursework") return "/academics";
  if (entity.kind === "honor") return "/academics/honors";
  if (entity.kind === "leadership" || entity.kind === "teaching_service") return "/leadership";
  if (entity.kind === "writing") return "/writing";
  if (entity.kind === "personal") return "/personal";

  if (entity.kind === "experience") {
    if (entity.category === "Education") return "/about";

    const relatedParent = [
      "/research",
      "/academics/honors",
      "/leadership",
      "/personal",
      "/about",
    ].find((candidate) => entity.relatedRoutes.some((related) => (
      related === candidate || related.startsWith(`${candidate}/`)
    )));

    return relatedParent ?? "/updates";
  }

  return undefined;
}
