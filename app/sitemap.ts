import type { MetadataRoute } from "next";

import { absoluteSiteUrl } from "@/lib/seo";
import { allPublicRoutes } from "@/lib/content-data";

export default function sitemap(): MetadataRoute.Sitemap {
  return allPublicRoutes
    .filter((route) => route !== "/trusted")
    .flatMap((route) => {
      const englishPath = route;
      const chinesePath = route === "/" ? "/zh" : `/zh${route}`;
      const englishUrl = absoluteSiteUrl(englishPath);
      const traditionalChineseUrl = absoluteSiteUrl(chinesePath);
      const languages = { en: englishUrl, "zh-Hant": traditionalChineseUrl, "x-default": englishUrl };
      const priority = route === "/" ? 1 : ["/research", "/projects", "/academics", "/leadership", "/writing", "/about", "/archive"].includes(route) ? 0.9 : 0.7;
      return [
        { url: englishUrl, changeFrequency: "monthly" as const, priority, alternates: { languages } },
        { url: traditionalChineseUrl, changeFrequency: "monthly" as const, priority: priority - 0.05, alternates: { languages } },
      ];
    });
}
