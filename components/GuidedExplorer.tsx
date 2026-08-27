"use client";

import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Clock3,
  Compass,
  Copy,
  FlaskConical,
  PenLine,
  Share2,
  Sparkles,
  Trash2,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import type { Locale } from "@/lib/site-config";
import { localizePath } from "@/lib/site-config";
import { canonicalExplorerPath, chooseSurpriseRoute } from "@/lib/surprise-route";
import {
  OPEN_EXPLORER_EVENT,
  SURPRISE_ME_EVENT,
  type ExplorerFocusOrigin,
  type ExplorerOpenDetail,
} from "./Navigation";

type LensId = "research" | "systems" | "academics" | "collaboration" | "writing";
type ExplorerMode = "paths" | "trail";

type ExplorerEntry = {
  path: string;
  title: string;
  summary: string;
  kind: string;
};

const RECENT_ROUTES_KEY = "jason:portfolio-review-trail:v1";
const SAVED_ROUTES_KEY = "jason:portfolio-shortlist:v1";

type ExplorerRoute = {
  route: string;
  titleEn: string;
  titleZh: string;
  noteEn: string;
  noteZh: string;
};

type ExplorerLens = {
  id: LensId;
  titleEn: string;
  titleZh: string;
  promptEn: string;
  promptZh: string;
  icon: typeof FlaskConical;
  routes: ExplorerRoute[];
};

const LENSES: ExplorerLens[] = [
  {
    id: "research",
    titleEn: "Research",
    titleZh: "研究方向",
    promptEn: "Explore how I frame research questions, test competing explanations, and interpret results.",
    promptZh: "查看研究問題、實驗設計、診斷方法與目前結論。",
    icon: FlaskConical,
    routes: [
      {
        route: "/research/redrhex",
        titleEn: "RedRHex locomotion research",
        titleZh: "RedRHex 步態控制研究",
        noteEn: "Current work in simulation, locomotion diagnosis, and controlled hardware testing.",
        noteZh: "目前進行中的研究，涵蓋模擬、步態診斷與受控真機測試。",
      },
      {
        route: "/research/geometry-covering",
        titleEn: "Geometric covering optimization",
        titleZh: "幾何覆蓋最佳化",
        noteEn: "An earlier study in which numerical evidence challenged the original conjecture.",
        noteZh: "數值結果推翻原猜想後，如實保留未解問題的早期研究。",
      },
      {
        route: "/academics/numerical-analysis",
        titleEn: "Numerical analysis",
        titleZh: "數值分析",
        noteEn: "Coursework in error analysis, convergence, conditioning, and numerical reliability.",
        noteZh: "從誤差、收斂與條件數，建立可信計算結果所需的基礎。",
      },
    ],
  },
  {
    id: "systems",
    titleEn: "Engineering systems",
    titleZh: "工程系統",
    promptEn: "Explore projects involving constraints, interfaces, integration, debugging, and working prototypes.",
    promptZh: "查看專案如何處理限制、介面、系統整合、除錯與原型實作。",
    icon: Wrench,
    routes: [
      {
        route: "/projects/aero-carrier",
        titleEn: "Aero Carrier",
        titleZh: "Aero Carrier 四旋翼搬運系統",
        noteEn: "A six-person engineering project completed under strict constraints, with quantified debugging and a final score of 100 / 100.",
        noteZh: "六人團隊在嚴格限制下，以量化除錯完成系統整合，最終獲得 100／100。",
      },
      {
        route: "/projects/jarvis",
        titleEn: "Jarvis multimodal home hub",
        titleZh: "Jarvis 多模態家庭中樞",
        noteEn: "A 36-hour integration across voice, vision, embedded interfaces, BLE, and edge computing.",
        noteZh: "36 小時內完成語音、視覺、嵌入式介面、BLE 與邊緣運算整合。",
      },
      {
        route: "/projects/lkas",
        titleEn: "Vision-based lane keeping",
        titleZh: "視覺車道置中系統",
        noteEn: "A compact control stack connecting a bicycle model, OpenCV perception, and PI-SMC steering.",
        noteZh: "把單車模型、OpenCV 感知與 PI-SMC 轉向控制接成一套完整系統。",
      },
    ],
  },
  {
    id: "academics",
    titleEn: "Academic preparation",
    titleZh: "學術深度",
    promptEn: "Explore the mathematics and mechanics that support my engineering and robotics work.",
    promptZh: "從數學、力學與知識整理，看見工程實作背後的學術根基。",
    icon: BookOpen,
    routes: [
      {
        route: "/academics/numerical-analysis",
        titleEn: "Numerical analysis",
        titleZh: "數值分析",
        noteEn: "Error bounds, iterative methods, and the discipline of asking when a numerical answer is reliable.",
        noteZh: "從誤差界限與迭代法，追問一個數值答案在什麼條件下值得信任。",
      },
      {
        route: "/academics/intermediate-dynamics",
        titleEn: "Intermediate dynamics",
        titleZh: "中等動力學",
        noteEn: "A 52-page study of rigid-body dynamics, with complete derivations and physical interpretation.",
        noteZh: "52 頁剛體動力學專題，包含完整推導、座標選擇與物理解讀。",
      },
      {
        route: "/academics/engineering-mathematics",
        titleEn: "Engineering mathematics",
        titleZh: "工程數學",
        noteEn: "Nine A+ courses supported by a searchable system of more than 1,600 pages of notes.",
        noteZh: "九門 A+ 課程，以及超過 1,600 頁的可檢索筆記系統。",
      },
    ],
  },
  {
    id: "collaboration",
    titleEn: "Collaboration",
    titleZh: "合作與執行",
    promptEn: "See how I coordinate teams, teach, share responsibility, and follow through.",
    promptZh: "了解我如何協調團隊、參與教學、共同承擔責任並持續跟進。",
    icon: UsersRound,
    routes: [
      {
        route: "/projects/aero-carrier",
        titleEn: "Six-person engineering project",
        titleZh: "六人團隊的系統執行",
        noteEn: "Architecture, interfaces, test planning, and failure triage inside a tightly constrained team project.",
        noteZh: "在高度受限的團隊專案中，完成架構、介面、測試規劃與故障拆解。",
      },
      {
        route: "/experience/trml-captain-2020-2021",
        titleEn: "Two years as TRML captain",
        titleZh: "連續兩年擔任 TRML 隊長",
        noteEn: "Two consecutive seasons of team competition combining mathematical strategy, task allocation, pacing, and trust.",
        noteZh: "連續兩年帶隊參賽，兼顧數學策略、分工、比賽節奏與團隊信任。",
      },
      {
        route: "/experience/international-student-document-support",
        titleEn: "International student document support",
        titleZh: "國際學生文件協助",
        noteEn: "Coordination with university and government offices until a lawful solution was found.",
        noteZh: "持續協調校方與政府單位，直到找到合法可行的解決方案。",
      },
    ],
  },
  {
    id: "writing",
    titleEn: "Writing",
    titleZh: "寫作",
    promptEn: "Read the narratives, technical records, and teaching materials that show how I develop and communicate ideas.",
    promptZh: "從自傳、技術紀錄與教學材料，了解我如何形成觀點並清楚傳達想法。",
    icon: PenLine,
    routes: [
      {
        route: "/writing/autobiography/from-confusion-to-inner-coherence",
        titleEn: "From Losing My Way to Finding Inner Coherence",
        titleZh: "從迷惘到自洽",
        noteEn: "A complete account of mathematical intuition, rebuilding, engineering, robotics, and personal direction.",
        noteZh: "完整記錄數學直覺、重新出發、工程、機器人與個人方向的長篇自傳。",
      },
      {
        route: "/writing/engineering-mathematics-notes",
        titleEn: "Engineering mathematics notes",
        titleZh: "工程數學筆記系統",
        noteEn: "A searchable knowledge system of more than 1,600 pages, developed for continued study, derivation, and teaching.",
        noteZh: "超過 1,600 頁的可檢索知識系統，持續用於複習、推導與教學。",
      },
      {
        route: "/writing/teaching",
        titleEn: "Teaching & mathematical communication",
        titleZh: "教學與數學溝通",
        noteEn: "Teaching materials, outreach work, and mathematical exposition.",
        noteZh: "教學材料、科學推廣與數學論述。",
      },
    ],
  },
];

type Props = {
  locale: Locale;
  path: string;
  surpriseRoutes: readonly string[];
  entries: readonly ExplorerEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function storedRoutes(key: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? value.filter((route): route is string => typeof route === "string").map(canonicalExplorerPath)
      : [];
  } catch {
    return [];
  }
}

function lensForPath(path: string): LensId {
  const canonicalPath = canonicalExplorerPath(path);
  if (canonicalPath.startsWith("/projects")) return "systems";
  if (canonicalPath.startsWith("/academics")) return "academics";
  if (canonicalPath.startsWith("/writing") || canonicalPath.startsWith("/about") || canonicalPath.startsWith("/personal")) return "writing";
  if (canonicalPath.startsWith("/leadership") || canonicalPath.includes("trml") || canonicalPath.includes("student")) return "collaboration";
  return "research";
}

export function GuidedExplorer({ locale, path, surpriseRoutes, entries, open, onOpenChange }: Props) {
  const [selectedLens, setSelectedLens] = useState<LensId>(() => lensForPath(path));
  const [mode, setMode] = useState<ExplorerMode>("paths");
  const [recentRoutes, setRecentRoutes] = useState<string[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<string[]>([]);
  const [shareStatus, setShareStatus] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const surpriseRef = useRef<HTMLButtonElement>(null);
  const savedHeadingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const openFocusOriginRef = useRef<ExplorerFocusOrigin>("keyboard");
  const titleId = "guided-explorer-title";
  const descriptionId = "guided-explorer-description";
  const dialogId = "guided-explorer-dialog";
  const english = locale === "en";
  const currentPath = canonicalExplorerPath(path);
  const entryByPath = useMemo(() => new Map(entries.map((entry) => [canonicalExplorerPath(entry.path), entry])), [entries]);
  const validRoutes = useMemo(() => new Set(entryByPath.keys()), [entryByPath]);
  const currentEntry = entryByPath.get(currentPath);
  const currentSavedIndex = savedRoutes.indexOf(currentPath);
  const nextSavedRoute = savedRoutes.length
    ? savedRoutes[currentSavedIndex >= 0 ? (currentSavedIndex + 1) % savedRoutes.length : 0]
    : undefined;

  const activeLens = LENSES.find((lens) => lens.id === selectedLens) ?? LENSES[0];
  const navigateSurprise = useCallback(() => {
    const nextRoute = chooseSurpriseRoute(surpriseRoutes, path);
    onOpenChange(false);
    window.location.assign(localizePath(nextRoute, locale));
  }, [locale, onOpenChange, path, surpriseRoutes]);

  const requestOpen = useCallback((focusOrigin: ExplorerFocusOrigin) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current;
    openFocusOriginRef.current = focusOrigin;
    setSelectedLens(lensForPath(path));
    setMode("paths");
    onOpenChange(true);
  }, [onOpenChange, path]);

  const persistSavedRoutes = useCallback((routes: string[]) => {
    const next = [...new Set(routes.map(canonicalExplorerPath))]
      .filter((route) => validRoutes.has(route))
      .slice(0, 12);
    setSavedRoutes(next);
    try { window.localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(next)); } catch { /* local preferences are optional */ }
  }, [validRoutes]);

  const toggleSavedRoute = useCallback((route: string) => {
    const canonical = canonicalExplorerPath(route);
    persistSavedRoutes(savedRoutes.includes(canonical)
      ? savedRoutes.filter((item) => item !== canonical)
      : [canonical, ...savedRoutes]);
  }, [persistSavedRoutes, savedRoutes]);

  const announceSavedChange = useCallback((message: string) => {
    setShareStatus("");
    window.setTimeout(() => setShareStatus(message), 0);
  }, []);

  const clearSavedRoutes = useCallback(() => {
    persistSavedRoutes([]);
    announceSavedChange(english ? "Saved pages cleared." : "已清除所有儲存頁面。");
    window.setTimeout(() => savedHeadingRef.current?.focus({ preventScroll: true }), 0);
  }, [announceSavedChange, english, persistSavedRoutes]);

  const removeSavedRoute = useCallback((route: string, index: number) => {
    const nextRoutes = savedRoutes.filter((item) => item !== canonicalExplorerPath(route));
    persistSavedRoutes(nextRoutes);
    announceSavedChange(english ? "Removed from saved pages." : "已從儲存頁面移除。");
    window.setTimeout(() => {
      const removeButtons = panelRef.current?.querySelectorAll<HTMLElement>("[data-saved-remove]");
      const nextButton = removeButtons?.[Math.min(index, Math.max(0, nextRoutes.length - 1))];
      (nextButton ?? savedHeadingRef.current)?.focus({ preventScroll: true });
    }, 0);
  }, [announceSavedChange, english, persistSavedRoutes, savedRoutes]);

  const shareCurrentPage = useCallback(async () => {
    const data = { title: currentEntry?.title ?? document.title, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setShareStatus(english ? "Sharing options opened." : "已開啟分享選項。");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.url);
        setShareStatus(english ? "Link copied." : "連結已複製。");
      } else {
        setShareStatus(english ? "Copy the address from your browser." : "請從瀏覽器網址列複製連結。");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus(english ? "The link could not be copied." : "目前無法複製連結。");
    }
  }, [currentEntry?.title, english]);

  const copyShortlist = useCallback(async () => {
    if (!savedRoutes.length) return;
    const heading = english ? "Jason Liao · Saved portfolio pages" : "廖致翔｜已儲存作品頁面";
    const items = savedRoutes.flatMap((route, index) => {
      const entry = entryByPath.get(route);
      if (!entry) return [];
      const url = `${window.location.origin}${localizePath(route, locale)}`;
      return [`${index + 1}. ${entry.title}\n${entry.kind} · ${entry.summary}\n${url}`];
    });
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText([heading, ...items].join("\n\n"));
      setShareStatus(english ? "Page list copied with summaries and links." : "頁面清單、摘要與連結已複製。");
    } catch {
      setShareStatus(english ? "The page list could not be copied in this browser." : "目前的瀏覽器無法複製頁面清單。");
    }
  }, [english, entryByPath, locale, savedRoutes]);

  const navigateNextSaved = useCallback(() => {
    if (!nextSavedRoute) return;
    onOpenChange(false);
    window.location.assign(localizePath(nextSavedRoute, locale));
  }, [locale, nextSavedRoute, onOpenChange]);

  const requestClose = useCallback(() => {
    onOpenChange(false);
    window.setTimeout(() => {
      const returnTarget = returnFocusRef.current;
      const canReceiveFocus = (element: HTMLElement | null) => Boolean(
        element?.isConnected
        && element.tabIndex >= 0
        && !element.matches(":disabled")
        && element.getClientRects().length > 0
        && !element.closest("[inert]")
        && getComputedStyle(element).visibility !== "hidden"
        && getComputedStyle(element).display !== "none"
      );
      const focusIfPossible = (element: HTMLElement | null) => {
        if (!canReceiveFocus(element)) return false;
        element?.focus({ preventScroll: true });
        return document.activeElement === element;
      };
      const mobileMenuButton = document.querySelector<HTMLElement>(".menu-button");
      const explorerTrigger = Array.from(document.querySelectorAll<HTMLElement>("[data-explorer-trigger]"))
        .find((element) => canReceiveFocus(element));
      if (!focusIfPossible(returnTarget)
        && !focusIfPossible(explorerTrigger ?? null)
        && !focusIfPossible(mobileMenuButton)) focusIfPossible(triggerRef.current);
      returnFocusRef.current = null;
    }, 0);
  }, [onOpenChange]);

  useEffect(() => {
    const saved = storedRoutes(SAVED_ROUTES_KEY).filter((route) => validRoutes.has(route)).slice(0, 12);
    const previous = storedRoutes(RECENT_ROUTES_KEY).filter((route) => validRoutes.has(route));
    const recent = validRoutes.has(currentPath)
      ? [currentPath, ...previous.filter((route) => route !== currentPath)].slice(0, 6)
      : previous.slice(0, 6);
    const frame = window.requestAnimationFrame(() => {
      setSavedRoutes(saved);
      setRecentRoutes(recent);
      try { window.localStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(recent)); } catch { /* local preferences are optional */ }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentPath, validRoutes]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    const initialFocus = openFocusOriginRef.current === "keyboard" ? surpriseRef.current : dialog;
    initialFocus?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const openExplorer = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail as Partial<ExplorerOpenDetail> | undefined : undefined;
      requestOpen(detail?.focusOrigin === "pointer" ? "pointer" : "keyboard");
    };
    const surpriseMe = () => navigateSurprise();
    const keyboardShortcut = (event: globalThis.KeyboardEvent) => {
      if (event.isComposing || event.repeat) return;
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      const openDialog = document.querySelector<HTMLDialogElement>("dialog[open]");
      const mobileMenuOpen = Boolean(document.querySelector(".mobile-nav.is-open"));
      if (mobileMenuOpen || (openDialog && openDialog !== dialogRef.current)) return;
      if (event.key.toLowerCase() === "e") {
        event.preventDefault();
        requestOpen("keyboard");
      } else if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        navigateSurprise();
      }
    };
    window.addEventListener(OPEN_EXPLORER_EVENT, openExplorer);
    window.addEventListener(SURPRISE_ME_EVENT, surpriseMe);
    window.addEventListener("keydown", keyboardShortcut);
    return () => {
      window.removeEventListener(OPEN_EXPLORER_EVENT, openExplorer);
      window.removeEventListener(SURPRISE_ME_EVENT, surpriseMe);
      window.removeEventListener("keydown", keyboardShortcut);
    };
  }, [navigateSurprise, requestOpen]);

  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (document.activeElement === dialogRef.current) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const moveMode = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const modes: ExplorerMode[] = ["paths", "trail"];
    let next = index;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % modes.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index - 1 + modes.length) % modes.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = modes.length - 1;
    else return;
    event.preventDefault();
    setMode(modes[next]);
    document.getElementById(`explorer-${modes[next]}-tab`)?.focus();
  };

  return (
    <>
      <div className="guided-explorer-dock" aria-label={english ? "Portfolio navigation" : "作品集導覽"}>
        <button
          ref={triggerRef}
          type="button"
          className={`guided-explorer-trigger${open ? " is-open" : ""}`}
          data-explorer-trigger
          onClick={(event: ReactMouseEvent<HTMLButtonElement>) => requestOpen(event.detail === 0 ? "keyboard" : "pointer")}
          aria-label={english ? "Open guided explorer" : "開啟探索導覽"}
          title={english ? "Explore" : "探索導覽"}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          aria-keyshortcuts="Alt+E"
        >
          <Compass size={16} aria-hidden="true" />
          <span>{english ? "Explore" : "探索"}</span>
          {savedRoutes.length ? <i className="guided-explorer-trigger__count" aria-hidden="true">{savedRoutes.length}</i> : null}
        </button>
        <button
          type="button"
          className="guided-explorer-surprise-trigger"
          data-surprise-trigger
          onClick={navigateSurprise}
          aria-label={english ? "Surprise me with a random page" : "隨機前往一個頁面"}
          title={english ? "Surprise me" : "隨機探索"}
          aria-keyshortcuts="Alt+S"
        >
          <Sparkles size={15} aria-hidden="true" />
          <span>{english ? "Surprise me" : "隨機探索"}</span>
        </button>
      </div>

      {open ? (
        <dialog
          ref={dialogRef}
          id={dialogId}
          className="guided-explorer-dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          onCancel={(event) => {
            event.preventDefault();
            requestClose();
          }}
          onKeyDown={trapFocus}
        >
          <button
            type="button"
            className="guided-explorer-dialog__backdrop"
            aria-label={english ? "Close guided explorer" : "關閉探索導覽"}
            onClick={requestClose}
          />
          <div ref={panelRef} className="guided-explorer-dialog__panel">
            <div className="guided-explorer-dialog__toolbar">
              <button ref={surpriseRef} type="button" className="guided-explorer-quick-surprise" onClick={navigateSurprise}>
                <Sparkles size={18} aria-hidden="true" />
                <span>
                  <strong>{english ? "Surprise me" : "隨機探索"}</strong>
                  <small>
                    {english
                      ? "Open one page at random from across the site"
                      : "從全站內容中隨機開啟一頁"}
                  </small>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="guided-explorer-dialog__close" onClick={requestClose} aria-label={english ? "Close guided explorer" : "關閉探索導覽"}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="guided-explorer-dialog__scroll">
              <header className="guided-explorer-dialog__header">
                <div>
                  <p className="eyebrow"><Sparkles size={14} aria-hidden="true" />{english ? "Explore the portfolio" : "探索作品集"}</p>
                  <h2 id={titleId}>{english ? "Where would you like to begin?" : "你想從哪個主題開始？"}</h2>
                  <p id={descriptionId}>{english ? "Choose a topic guide, or save pages to revisit on this device." : "可依主題瀏覽代表頁面，也可將頁面儲存在此裝置，方便稍後重訪。"}</p>
                </div>
              </header>

              <div className="guided-explorer-modes" role="tablist" aria-label={english ? "Explorer views" : "探索模式"}>
                <button id="explorer-paths-tab" type="button" role="tab" aria-selected={mode === "paths"} aria-controls={mode === "paths" ? "explorer-paths-panel" : undefined} tabIndex={mode === "paths" ? 0 : -1} className={mode === "paths" ? "is-selected" : ""} onClick={() => setMode("paths")} onKeyDown={(event) => moveMode(event, 0)}>
                  <Compass size={16} aria-hidden="true" />{english ? "Topic guides" : "主題導覽"}
                </button>
                <button id="explorer-trail-tab" type="button" role="tab" aria-selected={mode === "trail"} aria-controls={mode === "trail" ? "explorer-trail-panel" : undefined} tabIndex={mode === "trail" ? 0 : -1} className={mode === "trail" ? "is-selected" : ""} onClick={() => setMode("trail")} onKeyDown={(event) => moveMode(event, 1)}>
                  <Bookmark size={16} aria-hidden="true" />{english ? "Saved pages" : "已儲存頁面"}
                  {savedRoutes.length ? <span>{savedRoutes.length}</span> : null}
                </button>
              </div>

              {mode === "paths" ? (
                <div id="explorer-paths-panel" role="tabpanel" aria-labelledby="explorer-paths-tab">
                  <div className="guided-explorer-lenses" role="group" aria-label={english ? "Exploration lenses" : "探索角度"}>
                    {LENSES.map((lens) => {
                      const Icon = lens.icon;
                      const selected = lens.id === selectedLens;
                      return (
                        <button
                          key={lens.id}
                          type="button"
                          className={`guided-explorer-lens${selected ? " is-selected" : ""}`}
                          aria-pressed={selected}
                          onClick={() => setSelectedLens(lens.id)}
                        >
                          <Icon size={18} aria-hidden="true" />
                          <span>{english ? lens.titleEn : lens.titleZh}</span>
                        </button>
                      );
                    })}
                  </div>

                  <section className="guided-explorer-route" aria-live="polite" aria-label={english ? activeLens.titleEn : activeLens.titleZh}>
                    <div className="guided-explorer-route__intro">
                      <p className="eyebrow">{english ? "Selected pages" : "代表頁面"}</p>
                      <h3>{english ? activeLens.titleEn : activeLens.titleZh}</h3>
                      <p>{english ? activeLens.promptEn : activeLens.promptZh}</p>
                    </div>
                    <ol className="guided-explorer-stops">
                      {activeLens.routes.map((item, index) => (
                        <li key={item.route}>
                          <a href={localizePath(item.route, locale)} onClick={() => onOpenChange(false)}>
                            <span className="guided-explorer-stop__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                            <span className="guided-explorer-stop__copy">
                              <strong>{english ? item.titleEn : item.titleZh}</strong>
                              <small>{english ? item.noteEn : item.noteZh}</small>
                            </span>
                            <ArrowRight size={18} aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              ) : (
                <section id="explorer-trail-panel" className="review-trail" role="tabpanel" aria-labelledby="explorer-trail-tab">
                  <div className="review-trail__intro">
                    <div>
                      <p className="eyebrow"><Bookmark size={14} aria-hidden="true" />{english ? "Saved on this device" : "儲存在此裝置"}</p>
                      <h3>{english ? "Keep the pages you want to revisit in one place." : "集中儲存想再次查看的頁面。"}</h3>
                      <p>{english ? "Save pages, move through them in order, or copy a list with summaries and direct links." : "可儲存頁面、依序繼續瀏覽，或複製附摘要與直接連結的頁面清單。"}</p>
                    </div>
                    <div className="review-trail__actions">
                      <button type="button" className={savedRoutes.includes(currentPath) ? "is-saved" : ""} onClick={() => toggleSavedRoute(currentPath)} disabled={!currentEntry}>
                        <Bookmark size={17} aria-hidden="true" fill={savedRoutes.includes(currentPath) ? "currentColor" : "none"} />
                        {savedRoutes.includes(currentPath) ? (english ? "Saved" : "已儲存") : (english ? "Save this page" : "儲存此頁")}
                      </button>
                      <button type="button" onClick={shareCurrentPage}><Share2 size={17} aria-hidden="true" />{english ? "Share page" : "分享此頁"}</button>
                      <button type="button" onClick={copyShortlist} disabled={!savedRoutes.length}><Copy size={17} aria-hidden="true" />{english ? "Copy page list" : "複製頁面清單"}</button>
                      <button type="button" onClick={navigateNextSaved} disabled={!nextSavedRoute}><ArrowRight size={17} aria-hidden="true" />{english ? "Next saved page" : "下一個已儲存頁面"}</button>
                    </div>
                    <p className="review-trail__status" role="status" aria-live="polite">{shareStatus}</p>
                  </div>

                  <div className="review-trail__columns">
                    <section className="review-trail__group" aria-labelledby="saved-review-title">
                      <div className="review-trail__group-heading">
                        <div><Bookmark size={15} aria-hidden="true" /><h4 ref={savedHeadingRef} id="saved-review-title" tabIndex={-1}>{english ? "Saved pages" : "已儲存頁面"}</h4></div>
                        {savedRoutes.length ? <div className="review-trail__group-tools"><span>{currentSavedIndex >= 0 ? `${currentSavedIndex + 1} / ${savedRoutes.length}` : `${savedRoutes.length}`}</span><button type="button" onClick={clearSavedRoutes} aria-label={english ? "Clear saved pages" : "清除已儲存頁面"}><Trash2 size={15} aria-hidden="true" /></button></div> : null}
                      </div>
                      {savedRoutes.length ? (
                        <ol className="review-trail__list">
                          {savedRoutes.map((route, index) => {
                            const entry = entryByPath.get(route);
                            if (!entry) return null;
                            return <li key={route}><a href={localizePath(route, locale)} onClick={() => onOpenChange(false)}><span><small>{entry.kind}</small><strong>{entry.title}</strong></span><ArrowRight size={16} aria-hidden="true" /></a><button type="button" data-saved-remove onClick={() => removeSavedRoute(route, index)} aria-label={english ? `Remove ${entry.title} from saved pages` : `從已儲存頁面移除「${entry.title}」`}><X size={14} aria-hidden="true" /></button></li>;
                          })}
                        </ol>
                      ) : <p className="review-trail__empty">{english ? "No pages saved yet. Use “Save this page” whenever you want to return later." : "目前尚未儲存頁面；想稍後再看時，可使用「儲存此頁」。"}</p>}
                    </section>

                    <section className="review-trail__group" aria-labelledby="recent-review-title">
                      <div className="review-trail__group-heading"><div><Clock3 size={15} aria-hidden="true" /><h4 id="recent-review-title">{english ? "Recently viewed" : "最近瀏覽"}</h4></div></div>
                      <ol className="review-trail__list">
                        {recentRoutes.map((route) => {
                          const entry = entryByPath.get(route);
                          if (!entry) return null;
                          const saved = savedRoutes.includes(route);
                          return <li key={route}><a href={localizePath(route, locale)} onClick={() => onOpenChange(false)} aria-current={route === currentPath ? "page" : undefined}><span><small>{entry.kind}</small><strong>{entry.title}</strong></span><ArrowRight size={16} aria-hidden="true" /></a><button type="button" className={saved ? "is-saved" : ""} onClick={() => toggleSavedRoute(route)} aria-label={saved ? (english ? `Remove ${entry.title} from saved pages` : `從已儲存頁面移除「${entry.title}」`) : (english ? `Save ${entry.title}` : `儲存「${entry.title}」`)}><Bookmark size={14} aria-hidden="true" fill={saved ? "currentColor" : "none"} /></button></li>;
                        })}
                      </ol>
                    </section>
                  </div>
                </section>
              )}
            </div>

          </div>
        </dialog>
      ) : null}
    </>
  );
}
