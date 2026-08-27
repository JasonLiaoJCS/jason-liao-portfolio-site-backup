import { ArrowLeft, Search } from "lucide-react";
import type { Locale } from "@/lib/site-config";
import { localizePath } from "@/lib/site-config";

export function NotFoundView({ locale }: { locale: Locale }) {
  const english = locale === "en";
  return (
    <main id="main-content" className="not-found" tabIndex={-1}>
      <div>
        <strong aria-hidden="true">404</strong>
        <p className="eyebrow">{english ? "Page not found" : "找不到這個頁面"}</p>
        <h1>{english ? "The page may have moved or no longer exists." : "你要查看的頁面可能已移動或不存在。"}</h1>
        <p>{english ? "Return to the homepage, browse the portfolio index, or search for the research, project, course, or story you need." : "你可以回到首頁、開啟完整索引，或使用搜尋尋找研究、專案、課程與故事。"}</p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <a className="button" href={localizePath("/", locale)}><ArrowLeft size={16} />{english ? "Return home" : "回到首頁"}</a>
          <a className="button button--quiet" href={localizePath("/archive", locale)}><Search size={16} />{english ? "Open complete index" : "開啟完整索引"}</a>
        </div>
      </div>
    </main>
  );
}
