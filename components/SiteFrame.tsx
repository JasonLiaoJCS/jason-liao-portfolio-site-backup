"use client";

import { ArrowRight, ArrowUp, Search, X } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { Locale } from "@/lib/site-config";
import { localizePath } from "@/lib/site-config";
import { Navigation } from "./Navigation";
import { GuidedExplorer } from "./GuidedExplorer";
import { SiteExperience } from "./SiteExperience";
import { SiteFooter } from "./SiteFooter";

export type SearchEntry = {
  path: string;
  title: string;
  summary: string;
  kind: string;
  tags?: string[];
};

type SearchScope = "all" | "research" | "projects" | "academics" | "writing" | "experience";

const SEARCH_SCOPES: Array<{ id: SearchScope; en: string; zh: string }> = [
  { id: "all", en: "All", zh: "全部" },
  { id: "research", en: "Research", zh: "研究" },
  { id: "projects", en: "Projects", zh: "工程專案" },
  { id: "academics", en: "Academics", zh: "學術與課程" },
  { id: "writing", en: "Writing", zh: "寫作" },
  { id: "experience", en: "Profile & experience", zh: "經歷與生活" },
];

const QUICK_ACCESS_ROUTES = [
  "/research",
  "/projects",
  "/academics",
  "/academics/course-record",
  "/leadership",
  "/writing",
  "/about",
  "/cv",
] as const;

const SCOPE_LANDING_ROUTES: Record<Exclude<SearchScope, "all">, string[]> = {
  research: ["/research"],
  projects: ["/projects"],
  academics: ["/academics", "/academics/course-record", "/academics/honors"],
  writing: ["/writing", "/writing/teaching"],
  experience: ["/about", "/leadership", "/personal", "/updates", "/cv", "/contact", "/archive"],
};

function searchScopeForPath(path: string): Exclude<SearchScope, "all"> {
  const canonical = path.replace(/^\/(?:en|zh)(?=\/|$)/, "") || "/";
  if (canonical === "/research" || canonical.startsWith("/research/")) return "research";
  if (canonical === "/projects" || canonical.startsWith("/projects/")) return "projects";
  if (canonical === "/academics" || canonical.startsWith("/academics/")) return "academics";
  if (canonical === "/writing" || canonical.startsWith("/writing/")) return "writing";
  return "experience";
}

function prioritizeEmptySearch(entries: SearchEntry[], scope: SearchScope): SearchEntry[] {
  const routes = scope === "all" ? QUICK_ACCESS_ROUTES : SCOPE_LANDING_ROUTES[scope];
  const routePriority = new Map(routes.map((route, index) => [route, index]));
  return entries
    .map((entry, index) => ({ entry, index, priority: routePriority.get(entry.path) ?? Number.MAX_SAFE_INTEGER }))
    .sort((left, right) => left.priority - right.priority || left.index - right.index)
    .map(({ entry }) => entry);
}

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

type Props = {
  children: ReactNode;
  locale: Locale;
  path: string;
  searchEntries: SearchEntry[];
};

function normalizeSearchText(value: string, locale: Locale): string {
  return value
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/\p{Mark}+/gu, "")
    .toLocaleLowerCase(locale === "en" ? "en" : "zh-TW")
    .replace(/[\p{Punctuation}\p{Symbol}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function scoreSearchEntry(entry: SearchEntry, query: string, locale: Locale): number {
  const title = normalizeSearchText(entry.title, locale);
  const summary = normalizeSearchText(entry.summary, locale);
  const kind = normalizeSearchText(entry.kind, locale);
  const tags = (entry.tags ?? []).map((tag) => normalizeSearchText(tag, locale));
  const tokens = query.split(" ").filter(Boolean);
  const searchable = `${title} ${kind} ${tags.join(" ")} ${summary}`;

  if (!tokens.every((token) => searchable.includes(token))) return -1;

  let score = 0;
  if (title === query) score += 120;
  else if (title.startsWith(query)) score += 72;
  else if (title.includes(query)) score += 48;

  for (const token of tokens) {
    if (title === token) score += 48;
    else if (title.startsWith(token)) score += 32;
    else if (title.includes(token)) score += 24;

    if (tags.some((tag) => tag === token)) score += 22;
    else if (tags.some((tag) => tag.includes(token))) score += 14;

    if (kind.includes(token)) score += 10;
    if (summary.includes(token)) score += 4;
  }

  return score;
}

export function SiteFrame({ children, locale, path, searchEntries }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchScope, setSearchScope] = useState<SearchScope>("all");
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchDialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const surpriseRoutes = useMemo(() => searchEntries.map((entry) => entry.path), [searchEntries]);
  const searchScopeCounts = useMemo(() => Object.fromEntries(SEARCH_SCOPES.map((scope) => [
    scope.id,
    scope.id === "all" ? searchEntries.length : searchEntries.filter((entry) => searchScopeForPath(entry.path) === scope.id).length,
  ])) as Record<SearchScope, number>, [searchEntries]);

  const openSearch = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setExplorerOpen(false);
    setActiveResultIndex(0);
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    window.setTimeout(() => {
      const returnTarget = returnFocusRef.current;
      const canReceiveFocus = (element: HTMLElement | null) => Boolean(
        element?.isConnected
        && element.tabIndex >= 0
        && !element.matches(":disabled")
        && !element.closest("[inert]")
        && element.getClientRects().length > 0
        && getComputedStyle(element).visibility !== "hidden"
        && getComputedStyle(element).display !== "none"
      );
      const visibleTrigger = Array.from(document.querySelectorAll<HTMLElement>("[data-search-trigger]"))
        .find((element) => canReceiveFocus(element));
      if (canReceiveFocus(returnTarget)) returnTarget?.focus({ preventScroll: true });
      else if (visibleTrigger) visibleTrigger.focus({ preventScroll: true });
      else document.querySelector<HTMLElement>(".menu-button")?.focus({ preventScroll: true });
      returnFocusRef.current = null;
    }, 0);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const dialog = searchDialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen && !explorerOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [explorerOpen, searchOpen]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.isComposing || event.repeat) return;
      const openDialog = document.querySelector<HTMLDialogElement>("dialog[open]");
      const mobileMenuOpen = Boolean(document.querySelector(".mobile-nav.is-open"));
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (mobileMenuOpen || (openDialog && openDialog !== searchDialogRef.current)) return;
        event.preventDefault();
        openSearch();
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditableTarget(event.target)) {
        if (mobileMenuOpen || (openDialog && openDialog !== searchDialogRef.current)) return;
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape" && searchOpen) closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSearch, openSearch, searchOpen]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maximum)));
      setShowBackToTop(window.scrollY > Math.max(720, window.innerHeight * 0.8));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [path]);

  const trapSearchFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const searchResult = useMemo(() => {
    const scopedEntries = searchScope === "all"
      ? searchEntries
      : searchEntries.filter((entry) => searchScopeForPath(entry.path) === searchScope);
    const needle = normalizeSearchText(deferredQuery, locale);
    if (!needle) return { items: prioritizeEmptySearch(scopedEntries, searchScope).slice(0, 8), total: scopedEntries.length };
    const ranked = scopedEntries
      .map((entry, order) => ({ entry, order, score: scoreSearchEntry(entry, needle, locale) }))
      .filter((result) => result.score >= 0)
      .sort((left, right) => right.score - left.score || left.order - right.order)
      .map((result) => result.entry);
    return { items: ranked.slice(0, 12), total: ranked.length };
  }, [deferredQuery, locale, searchEntries, searchScope]);
  const results = searchResult.items;
  const visibleActiveIndex = results.length ? Math.min(activeResultIndex, results.length - 1) : 0;

  useEffect(() => {
    if (!searchOpen) return;
    resultsRef.current?.querySelector<HTMLElement>(`#search-result-${visibleActiveIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [searchOpen, searchScope, deferredQuery, visibleActiveIndex]);

  const openSearchResult = (index: number) => {
    const entry = results[index];
    if (!entry) return;
    setSearchOpen(false);
    window.location.assign(localizePath(entry.path, locale));
  };

  const onSearchInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResultIndex((index) => (Math.min(index, results.length - 1) + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResultIndex((index) => (Math.min(index, results.length - 1) - 1 + results.length) % results.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveResultIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveResultIndex(results.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      openSearchResult(visibleActiveIndex);
    }
  };

  const resultStatus = deferredQuery.trim()
    ? locale === "en"
      ? `${searchResult.total} ${searchResult.total === 1 ? "result" : "results"}`
      : `${searchResult.total} 筆結果`
    : locale === "en"
      ? `Quick access · ${searchResult.total} searchable pages`
      : `快速前往 · 共 ${searchResult.total} 個可搜尋頁面`;

  return (
    <>
      <Navigation locale={locale} path={path} onSearch={openSearch} />
      <div className="site-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <SiteExperience path={path} />
      {children}
      <SiteFooter locale={locale} path={path} />
      <GuidedExplorer
        locale={locale}
        path={path}
        surpriseRoutes={surpriseRoutes}
        entries={searchEntries}
        open={explorerOpen}
        onOpenChange={(nextOpen) => {
          if (nextOpen) setSearchOpen(false);
          setExplorerOpen(nextOpen);
        }}
      />
      <button
        type="button"
        className={`back-to-top${showBackToTop ? " is-visible" : ""}`}
        onClick={() => {
          document.getElementById("main-content")?.focus({ preventScroll: true });
          window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }}
        aria-label={locale === "en" ? "Back to top" : "回到頁首"}
        tabIndex={showBackToTop ? 0 : -1}
      >
        <ArrowUp size={18} aria-hidden="true" />
      </button>
      {searchOpen ? (
        <dialog
          ref={searchDialogRef}
          className="search-dialog"
          aria-modal="true"
          aria-label={locale === "en" ? "Search portfolio" : "搜尋作品集"}
          onKeyDown={trapSearchFocus}
          onCancel={(event) => { event.preventDefault(); closeSearch(); }}
        >
          <button
            type="button"
            className="search-dialog__backdrop"
            aria-label={locale === "en" ? "Close search" : "關閉搜尋"}
            onClick={closeSearch}
          />
          <div ref={panelRef} className="search-dialog__panel">
            <div className="search-dialog__bar">
              <Search size={20} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setActiveResultIndex(0); }}
                onKeyDown={onSearchInputKeyDown}
                placeholder={locale === "en" ? "Search research, projects, coursework…" : "搜尋研究、專案、課程成果……"}
                aria-label={locale === "en" ? "Search query" : "搜尋關鍵字"}
                role="combobox"
                aria-expanded="true"
                aria-controls="portfolio-search-results"
                aria-activedescendant={results.length ? `search-result-${visibleActiveIndex}` : undefined}
              />
              <button onClick={closeSearch} aria-label={locale === "en" ? "Close search" : "關閉搜尋"}><X size={19} /></button>
            </div>
            <div className="search-dialog__scopes" role="group" aria-label={locale === "en" ? "Limit search to a section" : "限定搜尋範圍"}>
              {SEARCH_SCOPES.map((scope) => (
                <button
                  key={scope.id}
                  type="button"
                  className={searchScope === scope.id ? "is-active" : ""}
                  aria-pressed={searchScope === scope.id}
                  onClick={() => { setSearchScope(scope.id); setActiveResultIndex(0); inputRef.current?.focus(); }}
                >
                  {scope[locale]}<span aria-hidden="true">{searchScopeCounts[scope.id]}</span>
                </button>
              ))}
            </div>
            <div className="search-dialog__meta">
              <span role="status" aria-live="polite" aria-atomic="true">{resultStatus}</span>
              <span><kbd>Ctrl K</kbd><kbd>/</kbd></span>
            </div>
            <div ref={resultsRef} id="portfolio-search-results" className="search-results" role="listbox" aria-label={locale === "en" ? "Search results" : "搜尋結果"}>
              {results.length ? results.map((entry, index) => (
                <a
                  id={`search-result-${index}`}
                  key={`${entry.kind}-${entry.path}`}
                  className={index === visibleActiveIndex ? "is-active" : ""}
                  href={localizePath(entry.path, locale)}
                  role="option"
                  aria-selected={index === visibleActiveIndex}
                  onPointerMove={() => setActiveResultIndex(index)}
                  onFocus={() => setActiveResultIndex(index)}
                  onClick={() => setSearchOpen(false)}
                >
                  <span className="search-results__kind">{entry.kind}</span>
                  <strong>{entry.title}</strong>
                  <p>{entry.summary}</p>
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              )) : (
                <div className="empty-state">
                  <strong>{locale === "en" ? "No results found." : "找不到符合條件的內容。"}</strong>
                  <p>{locale === "en" ? "Try a broader term, such as robotics, mechanics, teaching, or mathematics." : "可以改用機器人、力學、教學或數學等較廣泛的關鍵字。"}</p>
                </div>
              )}
            </div>
            <div className="search-dialog__footer">
              <a href={localizePath("/archive", locale)} onClick={() => setSearchOpen(false)}>
                {locale === "en" ? `Browse all ${searchEntries.length} pages` : `瀏覽全部 ${searchEntries.length} 個頁面`}<ArrowRight size={14} aria-hidden="true" />
              </a>
              <div aria-hidden="true">
                <span><kbd>↑</kbd><kbd>↓</kbd>{locale === "en" ? "select" : "選擇"}</span>
                <span><kbd>Enter</kbd>{locale === "en" ? "open" : "開啟"}</span>
                <span><kbd>Esc</kbd>{locale === "en" ? "close" : "關閉"}</span>
              </div>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
