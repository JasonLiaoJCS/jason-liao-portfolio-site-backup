import type { MetadataRoute } from "next";

import { absoluteSiteUrl, siteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/trusted",
          "/trusted/",
          "/zh/trusted",
          "/zh/trusted/",
          "/api/trusted/",
        ],
      },
    ],
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: siteOrigin(),
  };
}
