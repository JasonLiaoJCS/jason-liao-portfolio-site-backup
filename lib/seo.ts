/**
 * Public canonical fallback for builds where the hosting environment does not
 * inject SITE_URL. Keeping this HTTPS and production-owned prevents a missing
 * environment variable from publishing localhost canonicals, sitemap entries,
 * or social metadata.
 */
const PUBLIC_SITE_ORIGIN =
  "https://jason-liao-academic-portfolio.jasonliaock26.chatgpt.site";

export function siteOrigin(): string {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  if (!configuredOrigin) return PUBLIC_SITE_ORIGIN;

  try {
    const url = new URL(configuredOrigin);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return PUBLIC_SITE_ORIGIN;
    }
    return url.origin;
  } catch {
    return PUBLIC_SITE_ORIGIN;
  }
}

export function absoluteSiteUrl(pathname: string): string {
  const normalizedPathname = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;
  return new URL(normalizedPathname, `${siteOrigin()}/`).toString();
}
