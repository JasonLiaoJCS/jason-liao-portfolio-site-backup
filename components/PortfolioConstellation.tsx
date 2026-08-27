"use client";

import { ArrowLeft, ArrowRight, Network, Shuffle } from "lucide-react";
import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/content-data";
import type { ImageAsset } from "./ResponsiveAssetImage";
import { ResponsiveAssetImage } from "./ResponsiveAssetImage";

export type ConstellationGroup = "research" | "systems" | "academics" | "people";

export type ConstellationItem = {
  id: string;
  route: string;
  title: string;
  summary: string;
  category: string;
  date?: string;
  group: ConstellationGroup;
  x: number;
  y: number;
  labelPlacement?: "above" | "below";
  connections: string[];
  image?: ImageAsset & { width: number; height: number };
};

type Props = {
  locale: Locale;
  items: ConstellationItem[];
};

type FilterId = "all" | ConstellationGroup;

const SOURCE_WIDTH = 1000;
const SOURCE_HEIGHT = 620;
const PLOT_HEIGHT = 700;

const filters: Array<{ id: FilterId; en: string; zh: string }> = [
  { id: "all", en: "All entries", zh: "全部節點" },
  { id: "research", en: "Research", zh: "研究" },
  { id: "systems", en: "Systems", zh: "工程系統" },
  { id: "academics", en: "Academics", zh: "學術" },
  { id: "people", en: "People & growth", zh: "合作與成長" },
];

function secureIndex(length: number) {
  if (length <= 1) return 0;
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return Math.floor((values[0] / 0x1_0000_0000) * length);
  }
  return Math.floor(Math.random() * length);
}

function sourceYToPlot(value: number) {
  return value * (PLOT_HEIGHT / SOURCE_HEIGHT);
}

function cssPercent(value: number) {
  return `${value.toFixed(4)}%`;
}

function cssDegrees(value: number) {
  return `rotate(${value.toFixed(4)}deg)`;
}

export function PortfolioConstellation({ locale, items }: Props) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const nodes = useRef<Array<HTMLButtonElement | null>>([]);
  const panelTitle = useRef<HTMLHeadingElement | null>(null);
  const moveFocusToPanel = useRef(false);
  const english = locale === "en";
  const filterCounts = new Map<FilterId, number>([
    ["all", items.length],
    ["research", items.filter((item) => item.group === "research").length],
    ["systems", items.filter((item) => item.group === "systems").length],
    ["academics", items.filter((item) => item.group === "academics").length],
    ["people", items.filter((item) => item.group === "people").length],
  ]);
  const availableFilters = filters.filter((item) => item.id === "all" || (filterCounts.get(item.id) ?? 0) > 0);
  const focusedItems = filter === "all" ? items : items.filter((item) => item.group === filter);
  const active = focusedItems.find((item) => item.id === activeId) ?? focusedItems[0] ?? items[0];

  useEffect(() => {
    if (!moveFocusToPanel.current) return;
    moveFocusToPanel.current = false;
    panelTitle.current?.focus({ preventScroll: true });
  }, [activeId]);

  if (!active || items.length < 2) return null;

  const itemById = new Map(items.map((item) => [item.id, item]));
  const seenEdges = new Set<string>();
  const edges = items.flatMap((item) => item.connections.flatMap((connectedId) => {
    const connected = itemById.get(connectedId);
    const edgeKey = [item.id, connectedId].sort().join("--");
    if (!connected || item.id === connectedId || seenEdges.has(edgeKey)) return [];
    seenEdges.add(edgeKey);
    return [{ id: edgeKey, from: item, to: connected }];
  }));
  const activeConnections = active.connections
    .map((id) => itemById.get(id))
    .filter((item): item is ConstellationItem => Boolean(item));
  const contextualIds = new Set(activeConnections.map((item) => item.id));
  const edgeIsActive = (fromId: string, toId: string) => fromId === active.id || toId === active.id;
  const edgeIsVisible = (from: ConstellationItem, to: ConstellationItem) => (
    filter === "all"
    || (from.group === filter && to.group === filter)
    || edgeIsActive(from.id, to.id)
  );
  const visibleEdgeCount = edges.filter((edge) => edgeIsVisible(edge.from, edge.to)).length;
  const activePosition = Math.max(0, focusedItems.findIndex((item) => item.id === active.id));

  const chooseFilter = (next: FilterId) => {
    const nextItems = next === "all" ? items : items.filter((item) => item.group === next);
    if (!nextItems.length) return;
    setFilter(next);
    if (!nextItems.some((item) => item.id === active.id)) setActiveId(nextItems[0].id);
  };
  const chooseAnother = () => {
    const candidates = focusedItems.filter((item) => item.id !== active.id);
    const next = candidates[secureIndex(candidates.length)];
    if (next) setActiveId(next.id);
  };
  const chooseAdjacent = (offset: number) => {
    if (focusedItems.length < 2) return;
    const next = focusedItems[(activePosition + offset + focusedItems.length) % focusedItems.length];
    if (next) setActiveId(next.id);
  };
  const followConnection = (item: ConstellationItem) => {
    moveFocusToPanel.current = true;
    setFilter("all");
    setActiveId(item.id);
  };
  const selectNode = (item: ConstellationItem) => {
    if (filter !== "all" && item.group !== filter) setFilter("all");
    setActiveId(item.id);
  };
  const focusNode = (item: ConstellationItem) => {
    setActiveId(item.id);
    const sourceIndex = items.findIndex((candidate) => candidate.id === item.id);
    nodes.current[sourceIndex]?.focus();
  };
  const onNodeKeyDown = (event: KeyboardEvent<HTMLButtonElement>, item: ConstellationItem) => {
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? focusedItems[0] : focusedItems[focusedItems.length - 1];
      if (next) focusNode(next);
      return;
    }
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = items.findIndex((candidate) => candidate.id === item.id);
    const currentRect = nodes.current[currentIndex]?.getBoundingClientRect();
    if (!currentRect) return;
    const currentX = currentRect.left + currentRect.width / 2;
    const currentY = currentRect.top + currentRect.height / 2;
    const candidates = focusedItems.flatMap((candidate) => {
      if (candidate.id === item.id) return [];
      const candidateIndex = items.findIndex((entry) => entry.id === candidate.id);
      const rect = nodes.current[candidateIndex]?.getBoundingClientRect();
      if (!rect) return [];
      const dx = rect.left + rect.width / 2 - currentX;
      const dy = rect.top + rect.height / 2 - currentY;
      const primary = event.key === "ArrowRight" ? dx
        : event.key === "ArrowLeft" ? -dx
          : event.key === "ArrowDown" ? dy
            : -dy;
      if (primary <= 4) return [];
      const cross = event.key === "ArrowRight" || event.key === "ArrowLeft" ? Math.abs(dy) : Math.abs(dx);
      return [{ item: candidate, score: Math.hypot(dx, dy) + cross * 0.72 }];
    }).sort((a, b) => a.score - b.score);
    if (candidates[0]) focusNode(candidates[0].item);
  };

  return (
    <section className="section portfolio-constellation-section" id="portfolio-constellation" aria-labelledby="portfolio-constellation-title">
      <div className="container portfolio-constellation">
        <div className="section-header section-header--split portfolio-constellation__header">
          <div>
            <p className="eyebrow"><Network size={14} aria-hidden="true" />{english ? "Interactive constellation" : "互動作品星圖"}</p>
            <h2 id="portfolio-constellation-title">{english ? "Connections across research, projects, and experience." : "研究、專案與經歷之間的關聯。"}</h2>
          </div>
          <p>{english ? "Select a field or node to explore related work across the portfolio." : "選擇領域與節點，查看相應的研究、專案、課程與經歷。"}</p>
        </div>

        <div className="portfolio-constellation__filters" role="group" aria-label={english ? "Focus constellation by field" : "依領域聚焦作品星圖"}>
          {availableFilters.map((item) => (
            <button type="button" aria-controls="portfolio-constellation-canvas" aria-pressed={filter === item.id} onClick={() => chooseFilter(item.id)} key={item.id}>
              <span aria-hidden="true" />{english ? item.en : item.zh}<small>{filterCounts.get(item.id)}</small>
            </button>
          ))}
        </div>

        <div className="portfolio-constellation__guide" id="portfolio-constellation-instructions">
          <span><strong>{focusedItems.length}</strong>{english ? " visible nodes" : " 個顯示節點"}<i aria-hidden="true" /><strong>{visibleEdgeCount}</strong>{english ? " related links" : " 條關聯連線"}</span>
          <p>{english ? "Gold lines connect directly related entries; linked entries outside the selected field remain visible for context." : "金色線條表示內容之間的直接關聯；跨領域項目亦會一併顯示。"}</p>
        </div>

        <div className="portfolio-constellation__experience">
          <div
            className="portfolio-constellation__canvas"
            id="portfolio-constellation-canvas"
            role="listbox"
            aria-describedby="portfolio-constellation-instructions"
            aria-label={english ? "Connected portfolio entries" : "相互連結的作品節點"}
          >
            <div className="portfolio-constellation__grid" aria-hidden="true" />
            {edges.map((edge, index) => {
              const visible = edgeIsVisible(edge.from, edge.to);
              const emphasized = visible && edgeIsActive(edge.from.id, edge.to.id);
              const drawFrom = emphasized && edge.to.id === active.id ? edge.to : edge.from;
              const drawTo = drawFrom.id === edge.from.id ? edge.to : edge.from;
              const dx = drawTo.x - drawFrom.x;
              const dy = sourceYToPlot(drawTo.y) - sourceYToPlot(drawFrom.y);
              const length = Math.hypot(dx, dy);
              const angle = Math.atan2(dy, dx) * 180 / Math.PI;
              return (
                <span
                  className={`portfolio-constellation__edge${visible ? " is-visible" : ""}${emphasized ? " is-active" : ""}`}
                  style={{
                    left: cssPercent(drawFrom.x / SOURCE_WIDTH * 100),
                    top: cssPercent(sourceYToPlot(drawFrom.y) / PLOT_HEIGHT * 100),
                    width: cssPercent(length / SOURCE_WIDTH * 100),
                    transform: cssDegrees(angle),
                    "--edge-delay": `${index * 34}ms`,
                  } as CSSProperties}
                  aria-hidden="true"
                  key={`${edge.id}-${emphasized ? active.id : "idle"}`}
                ><i /></span>
              );
            })}
            {items.map((item, index) => {
              const focused = filter === "all" || item.group === filter;
              const contextual = filter !== "all" && !focused && contextualIds.has(item.id);
              const interactive = focused || contextual;
              const selected = item.id === active.id;
              return (
                <button
                  type="button"
                  role="option"
                  id={`constellation-node-${item.id}`}
                  className={`portfolio-constellation__node portfolio-constellation__node--${item.group}${item.y > 450 ? " is-lower" : ""}${item.labelPlacement ? ` label-${item.labelPlacement}` : ""}${item.x >= 780 ? " is-right" : ""}${item.x <= 170 ? " is-left" : ""}${contextual ? " is-context" : ""}${selected ? " is-active" : ""}`}
                  style={{ left: cssPercent(item.x / SOURCE_WIDTH * 100), top: cssPercent(item.y / SOURCE_HEIGHT * 100) }}
                  aria-controls="portfolio-constellation-panel"
                  aria-selected={selected}
                  aria-hidden={!interactive}
                  disabled={!interactive}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectNode(item)}
                  onFocus={() => selectNode(item)}
                  onKeyDown={(event) => onNodeKeyDown(event, item)}
                  ref={(element) => { nodes.current[index] = element; }}
                  key={item.id}
                >
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.title}</strong>
                </button>
              );
            })}
          </div>

          <article className="portfolio-constellation__panel" id="portfolio-constellation-panel" aria-labelledby="portfolio-constellation-active-title">
            <span className="portfolio-constellation__status" role="status" aria-live="polite" aria-atomic="true">
              {english ? `Selected: ${active.title}` : `目前選擇：${active.title}`}
            </span>
            <span className="portfolio-constellation__panel-scan" aria-hidden="true" key={`constellation-scan-${active.id}`} />
            {active.image ? (
              <div className="portfolio-constellation__media">
                <ResponsiveAssetImage asset={active.image} width={active.image.width} height={active.image.height} />
                <span aria-hidden="true">{String(items.findIndex((item) => item.id === active.id) + 1).padStart(2, "0")}</span>
              </div>
            ) : (
              <div className="portfolio-constellation__monogram" aria-hidden="true"><Network size={30} /><span>{String(items.findIndex((item) => item.id === active.id) + 1).padStart(2, "0")}</span></div>
            )}
            <div className="portfolio-constellation__panel-copy">
              <div className="portfolio-constellation__meta"><span>{active.category}</span>{active.date ? <small>{active.date}</small> : null}</div>
              <h3 id="portfolio-constellation-active-title" ref={panelTitle} tabIndex={-1}>{active.title}</h3>
              <p>{active.summary}</p>
              <div className={`portfolio-constellation__related${activeConnections.length ? "" : " is-empty"}`} role="group" aria-labelledby="portfolio-constellation-related-title">
                <small id="portfolio-constellation-related-title">{english ? "Related work" : "相關內容"}</small>
                {activeConnections.length ? (
                  <div>{activeConnections.map((item) => <button type="button" onClick={() => followConnection(item)} key={item.id}>{item.title}</button>)}</div>
                ) : (
                  <p>{english ? "No directly related entries appear in this view." : "這個節點目前沒有其他相連內容。"}</p>
                )}
              </div>
              <div className="portfolio-constellation__actions">
                <a className="button" href={active.route}>{english ? "Open page" : "查看內容"}<ArrowRight size={16} aria-hidden="true" /></a>
                <div className="portfolio-constellation__stepper" role="group" aria-label={english ? "Move through focused nodes" : "切換聚焦節點"}>
                  <button type="button" onClick={() => chooseAdjacent(-1)} disabled={focusedItems.length < 2}><ArrowLeft size={14} aria-hidden="true" /><span>{english ? "Previous" : "上一個"}</span></button>
                  <small aria-hidden="true">{activePosition + 1} / {focusedItems.length}</small>
                  <button type="button" onClick={() => chooseAdjacent(1)} disabled={focusedItems.length < 2}><span>{english ? "Next" : "下一個"}</span><ArrowRight size={14} aria-hidden="true" /></button>
                </div>
                <button type="button" className="button button--quiet" onClick={chooseAnother} disabled={focusedItems.length < 2}><Shuffle size={15} aria-hidden="true" />{english ? "Choose another node" : "隨機選擇節點"}</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
