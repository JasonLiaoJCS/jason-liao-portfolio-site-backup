"use client";

import { ArrowRight, Clapperboard, Shuffle } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import type { Locale } from "@/lib/site-config";
import { localizePath } from "@/lib/site-config";
import type { VideoRecord } from "@/lib/videos";
import { YouTubeEmbed } from "./YouTubeEmbed";

export type CinemaItem = {
  video: VideoRecord;
  contextTitle: string;
};

type Props = {
  locale: Locale;
  items: CinemaItem[];
};

type PlaylistFilter = "all" | VideoRecord["playlist"];

const filters: Array<{ id: PlaylistFilter; en: string; zh: string }> = [
  { id: "all", en: "All videos", zh: "全部影片" },
  { id: "Research & Robotics", en: "Research & robotics", zh: "研究與機器人" },
  { id: "Engineering Projects", en: "Engineering systems", zh: "工程系統" },
  { id: "Academic Coursework", en: "Coursework", zh: "課程作品" },
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

export function PortfolioCinema({ locale, items }: Props) {
  const [filter, setFilter] = useState<PlaylistFilter>("all");
  const [activeId, setActiveId] = useState(items[0]?.video.id ?? "");
  const filterRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const queueRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const english = locale === "en";
  const visibleItems = filter === "all" ? items : items.filter(({ video }) => video.playlist === filter);
  const active = items.find(({ video }) => video.id === activeId) ?? visibleItems[0] ?? items[0];

  if (!active || items.length < 2) return null;

  const activeQueueIndex = visibleItems.findIndex(({ video }) => video.id === active.video.id);
  const chooseFilter = (next: PlaylistFilter) => {
    const first = next === "all" ? items[0] : items.find(({ video }) => video.playlist === next);
    setFilter(next);
    if (first) setActiveId(first.video.id);
  };
  const chooseAnother = () => {
    const candidates = visibleItems.filter(({ video }) => video.id !== active.video.id);
    const next = candidates[secureIndex(candidates.length)] ?? visibleItems[0];
    if (next) setActiveId(next.video.id);
  };
  const moveFilter = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = filters.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    const normalized = (next + filters.length) % filters.length;
    chooseFilter(filters[normalized].id);
    filterRefs.current[normalized]?.focus();
  };
  const moveQueue = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = visibleItems.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    const normalized = (next + visibleItems.length) % visibleItems.length;
    const selected = visibleItems[normalized];
    if (!selected) return;
    setActiveId(selected.video.id);
    queueRefs.current[normalized]?.focus();
  };

  return (
    <section className="section portfolio-cinema-section" id="portfolio-cinema" aria-labelledby="portfolio-cinema-title">
      <div className="container portfolio-cinema">
        <div className="section-header section-header--split portfolio-cinema__header">
          <div>
            <p className="eyebrow"><Clapperboard size={15} aria-hidden="true" />{english ? "Video portfolio" : "影像作品集"}</p>
            <h2 id="portfolio-cinema-title">{english ? "Watch prototypes, tests, and completed systems in operation." : "以影片呈現原型、測試與系統整合。"}</h2>
          </div>
          <p>{english ? "Select a video to view prototypes, tests, and project development." : "可依類別選擇影片，查看原型展示、測試與專案開發紀錄。"}</p>
        </div>

        <div className="portfolio-cinema__toolbar">
          <div className="portfolio-cinema__filters" role="tablist" aria-label={english ? "Film collections" : "影片分類"}>
            {filters.map((item, index) => (
              <button
                type="button"
                role="tab"
                id={`portfolio-cinema-tab-${String(item.id).replaceAll(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
                aria-controls="portfolio-cinema-panel"
                aria-selected={filter === item.id}
                tabIndex={filter === item.id ? 0 : -1}
                onClick={() => chooseFilter(item.id)}
                onKeyDown={(event) => moveFilter(event, index)}
                ref={(element) => { filterRefs.current[index] = element; }}
                key={item.id}
              >
                {english ? item.en : item.zh}<span>{item.id === "all" ? items.length : items.filter(({ video }) => video.playlist === item.id).length}</span>
              </button>
            ))}
          </div>
          <button type="button" className="portfolio-cinema__shuffle" onClick={chooseAnother}><Shuffle size={15} aria-hidden="true" />{english ? "Choose another video" : "換一部影片"}</button>
        </div>

        <div
          className="portfolio-cinema__stage"
          id="portfolio-cinema-panel"
          role="tabpanel"
          aria-labelledby={`portfolio-cinema-tab-${String(filter).replaceAll(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
        >
          <div className="portfolio-cinema__screen">
            <span className="portfolio-cinema__scan" aria-hidden="true" key={`cinema-scan-${active.video.id}`} />
            <YouTubeEmbed video={active.video} locale={locale} compact key={active.video.id} />
            <div className="portfolio-cinema__now-playing">
              <div><span>{english ? "Now playing" : "目前播放"}</span><strong>{active.contextTitle}</strong></div>
              <a href={localizePath(active.video.route, locale)}>{english ? "View project details" : "查看專案內容"}<ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          </div>

          <aside className="portfolio-cinema__queue" aria-label={english ? "Video list" : "影片清單"}>
            <div className="portfolio-cinema__queue-heading">
              <span>{english ? "Video list" : "精選影片"}</span>
              <small>{String(Math.max(0, activeQueueIndex) + 1).padStart(2, "0")} / {String(visibleItems.length).padStart(2, "0")}</small>
            </div>
            <div className="portfolio-cinema__queue-list">
              {visibleItems.map((item, index) => {
                const selected = item.video.id === active.video.id;
                return (
                  <button
                    type="button"
                    className={selected ? "is-active" : undefined}
                    aria-pressed={selected}
                    onClick={() => setActiveId(item.video.id)}
                    onKeyDown={(event) => moveQueue(event, index)}
                    ref={(element) => { queueRefs.current[index] = element; }}
                    key={item.video.id}
                  >
                    <picture>
                      <source srcSet={item.video.poster.avif} type="image/avif" />
                      <source srcSet={item.video.poster.webp} type="image/webp" />
                      <img src={item.video.poster.fallback} alt="" width="180" height="101" loading="lazy" decoding="async" />
                    </picture>
                    <span><small>{String(index + 1).padStart(2, "0")} · {item.video.duration}</small><strong>{item.video.title[locale]}</strong><em>{item.contextTitle}</em></span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
