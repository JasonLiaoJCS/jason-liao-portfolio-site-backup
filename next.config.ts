import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  async headers() {
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "form-action 'self' mailto:",
          "frame-ancestors 'none'",
          "object-src 'self'",
          "img-src 'self' data: blob:",
          "media-src 'self' blob:",
          "font-src 'self' data:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline'",
          "connect-src 'self'",
          "frame-src https://www.youtube-nocookie.com",
          "upgrade-insecure-requests",
        ].join("; "),
      },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/trusted/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/zh/trusted/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default nextConfig;
