"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import type { Locale } from "@/lib/site-config";
import { localizePath } from "@/lib/site-config";

export function ErrorView({ locale, reset }: { locale: Locale; reset: () => void }) {
  const english = locale === "en";
  return (
    <main id="main-content" className="not-found" tabIndex={-1}>
      <div>
        <strong aria-hidden="true">500</strong>
        <p className="eyebrow">{english ? "Unable to load this page" : "載入時發生問題"}</p>
        <h1>{english ? "This page could not be loaded." : "此頁暫時無法載入。"}</h1>
        <p>{english ? "Try again, or return to the homepage and continue from another section." : "請重新載入本頁，或回到首頁從其他入口繼續瀏覽。"}</p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <button className="button" type="button" onClick={reset}><RotateCcw size={16} />{english ? "Try again" : "重新載入"}</button>
          <a className="button button--quiet" href={localizePath("/", locale)}><ArrowLeft size={16} />{english ? "Return home" : "回到首頁"}</a>
        </div>
      </div>
    </main>
  );
}
