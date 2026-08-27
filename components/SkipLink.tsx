"use client";

import type { Locale } from "@/lib/site-config";

export function SkipLink({ locale }: { locale: Locale }) {
  return (
    <a className="skip-link" href="#main-content">
      {locale === "en" ? "Skip to content" : "跳至主要內容"}
    </a>
  );
}
