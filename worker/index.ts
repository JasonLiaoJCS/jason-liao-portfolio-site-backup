/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "frame-src https://www.youtube-nocookie.com",
  "upgrade-insecure-requests",
].join("; ");

function secureResponse(response: Response, pathname: string): Response {
  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );

  if (
    pathname === "/trusted" ||
    pathname.startsWith("/trusted/") ||
    pathname === "/zh/trusted" ||
    pathname.startsWith("/zh/trusted/") ||
    pathname.startsWith("/api/trusted/")
  ) {
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    let decodedPathname = url.pathname;
    try { decodedPathname = decodeURI(url.pathname); } catch { /* malformed paths remain unchanged */ }

    if (
      /[A-Z]/.test(decodedPathname)
      && !url.pathname.split("/").at(-1)?.includes(".")
      && !url.pathname.startsWith("/api/")
      && !url.pathname.startsWith("/_")
    ) {
      url.pathname = decodedPathname.replace(/[A-Z]/g, (character) => character.toLowerCase());
      return Response.redirect(url, 301);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const response = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return secureResponse(response, url.pathname);
    }

    const response = await handler.fetch(request, env, ctx);
    return secureResponse(response, url.pathname);
  },
};

export default worker;
