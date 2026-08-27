"use client";

import { ArrowRight, Check, RotateCcw, Scale } from "lucide-react";
import { type CSSProperties, type KeyboardEvent, useRef, useState } from "react";
import type { Locale } from "@/lib/content-data";

type EvidenceDimension = "question" | "role" | "turningPoint" | "validation" | "next";

export type ProjectComparisonItem = {
  id: string;
  route: string;
  title: string;
  date?: string;
  summary: string;
  maturity: string;
  evidence: Record<EvidenceDimension, string>;
};

type Props = {
  locale: Locale;
  items: ProjectComparisonItem[];
};

const dimensions: Array<{ id: EvidenceDimension; en: string; zh: string }> = [
  { id: "question", en: "Question & constraints", zh: "問題與限制" },
  { id: "role", en: "My role", zh: "我的角色" },
  { id: "turningPoint", en: "Key decision", zh: "關鍵轉折" },
  { id: "validation", en: "Validation", zh: "驗證結果" },
  { id: "next", en: "Limits & next steps", zh: "限制與後續" },
];

const evidenceAnchors: Record<EvidenceDimension, string> = {
  question: "question-constraints",
  role: "role-system",
  turningPoint: "turning-point",
  validation: "evaluation",
  next: "next",
};

export function ProjectEvidenceCompare({ locale, items }: Props) {
  const suggestedIds = items.slice(0, Math.min(2, items.length)).map((item) => item.id);
  const [selectedIds, setSelectedIds] = useState(() => suggestedIds);
  const [dimension, setDimension] = useState<EvidenceDimension>("question");
  const [announcement, setAnnouncement] = useState("");
  const dimensionTabs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = selectedIds.map((id) => items.find((item) => item.id === id)).filter((item): item is ProjectComparisonItem => Boolean(item));
  const activeDimension = dimensions.find((item) => item.id === dimension) ?? dimensions[0];
  const selectionInstruction = selectedIds.length >= 3
    ? (locale === "en" ? "Three selected. Remove one before switching projects." : "已選 3 項；若要更換，請先移除其中一項。")
    : (locale === "en" ? "Two selected. Add one more, or begin comparing below." : "已選 2 項；可再加入 1 項，或直接開始比較。")

  if (items.length < 2) return null;

  const toggleProject = (id: string) => {
    const isSelected = selectedIds.includes(id);
    if (isSelected && selectedIds.length <= 2) {
      setAnnouncement(locale === "en" ? "Keep at least two projects in the comparison." : "比較中至少需保留 2 個專案。");
      return;
    }
    if (!isSelected && selectedIds.length >= 3) {
      setAnnouncement(locale === "en" ? "Up to three projects can be compared. Remove one before adding another." : "一次最多比較 3 個專案；請先移除一項再加入其他專案。");
      return;
    }
    if (isSelected) {
      setSelectedIds((current) => current.filter((itemId) => itemId !== id));
      setAnnouncement(locale === "en" ? "Project removed from the comparison." : "已從比較中移除專案。");
    } else {
      setSelectedIds((current) => [...current, id]);
      setAnnouncement(locale === "en" ? "Project added to the comparison." : "已將專案加入比較。");
    }
  };
  const resetSelection = () => {
    setSelectedIds(suggestedIds);
    setDimension("question");
    setAnnouncement(locale === "en" ? "Suggested comparison restored." : "已恢復建議比較組合。");
  };
  const selectDimension = (index: number, focus = false) => {
    const next = (index + dimensions.length) % dimensions.length;
    setDimension(dimensions[next].id);
    if (focus) dimensionTabs.current[next]?.focus();
  };
  const onDimensionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = dimensions.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectDimension(next, true);
  };

  return (
    <section className="section section--project-compare" id="project-comparison" aria-labelledby="project-comparison-title">
      <div className="container project-compare">
        <div className="section-header section-header--split project-compare__header">
          <div>
            <p className="eyebrow">{locale === "en" ? "Project comparison" : "專案比較"}</p>
            <h2 id="project-comparison-title">{locale === "en" ? "Compare the engineering decisions behind each project." : "比較不同專案中的工程判斷。"}</h2>
          </div>
          <p>{locale === "en" ? "Select two or three projects and a comparison category to compare their approaches side by side." : "選擇二至三個專案與比較面向，即可並列比較各自的處理方式。"}</p>
        </div>

        <div className="project-compare__desk">
          <ol className="project-compare__guide" aria-label={locale === "en" ? "How to use the comparison" : "比較工具操作步驟"}>
            <li><span>01</span><div><strong>{locale === "en" ? "Choose projects" : "選擇專案"}</strong><small>{locale === "en" ? "Select two or three." : "選擇 2 至 3 項。"}</small></div></li>
            <li><span>02</span><div><strong>{locale === "en" ? "Choose a category" : "選擇面向"}</strong><small>{locale === "en" ? "Focus the comparison." : "聚焦要比較的內容。"}</small></div></li>
            <li><span>03</span><div><strong>{locale === "en" ? "View project details" : "查看專案詳情"}</strong><small>{locale === "en" ? "Open the relevant project section." : "前往專案中的相關段落。"}</small></div></li>
          </ol>

          <div className="project-compare__selection-bar">
            <div>
              <span>{locale === "en" ? "Step 1" : "步驟 1"}</span>
              <strong>{locale === "en" ? "Choose 2–3 projects" : "選擇 2–3 個專案"}</strong>
              <small id="project-comparison-selection-status" role="status" aria-live="polite">{announcement || selectionInstruction}</small>
            </div>
            <div>
              <span>{locale === "en" ? `${selected.length} / 3 selected` : `已選 ${selected.length} / 3`}</span>
              <button type="button" onClick={resetSelection}><RotateCcw size={13} aria-hidden="true" />{locale === "en" ? "Suggested pair" : "建議組合"}</button>
            </div>
          </div>

          <div className="project-compare__chooser" role="group" aria-label={locale === "en" ? "Projects to compare" : "選擇比較專案"} aria-describedby="project-comparison-selection-status">
            {items.map((item) => {
              const order = selectedIds.indexOf(item.id);
              const isSelected = order >= 0;
              return (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleProject(item.id)}
                  key={item.id}
                >
                  <span aria-hidden="true">{isSelected ? <Check size={14} /> : String(items.indexOf(item) + 1).padStart(2, "0")}</span>
                  <strong>{item.title}</strong>
                  <small>
                    {isSelected
                      ? (locale === "en" ? `Included · Column ${order + 1}` : `已加入 · 第 ${order + 1} 欄`)
                      : selectedIds.length >= 3
                        ? (locale === "en" ? "Remove one to switch" : "先移除一項再更換")
                        : (locale === "en" ? "Add to comparison" : "加入比較")}
                  </small>
                </button>
              );
            })}
          </div>

          <div className="project-compare__dimension-prompt">
            <span>{locale === "en" ? "Step 2" : "步驟 2"}</span>
            <strong>{locale === "en" ? "Choose what to compare" : "選擇比較面向"}</strong>
          </div>
          <div className="project-compare__dimensions" role="tablist" aria-label={locale === "en" ? "Comparison dimension" : "比較面向"}>
            {dimensions.map((item, index) => (
              <button
                type="button"
                role="tab"
                id={`comparison-tab-${item.id}`}
                aria-controls="project-comparison-panel"
                aria-selected={dimension === item.id}
                tabIndex={dimension === item.id ? 0 : -1}
                onClick={() => selectDimension(index)}
                onKeyDown={(event) => onDimensionKeyDown(event, index)}
                ref={(element) => { dimensionTabs.current[index] = element; }}
                key={item.id}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>{locale === "en" ? item.en : item.zh}
              </button>
            ))}
          </div>

          <div
            className={`project-compare__stage project-compare__stage--${dimension}`}
            id="project-comparison-panel"
            role="tabpanel"
            aria-labelledby={`comparison-tab-${dimension}`}
          >
            <span className="project-compare__scan" aria-hidden="true" key={`compare-scan-${dimension}-${selectedIds.join("-")}`} />
            <div className="project-compare__stage-heading">
              <span><Scale size={17} aria-hidden="true" />{locale === "en" ? "Step 3 · Side-by-side comparison" : "步驟 3 · 並列比較"}</span>
              <strong>{locale === "en" ? activeDimension.en : activeDimension.zh}</strong>
              <small>{locale === "en" ? `${selected.length} projects` : `${selected.length} 個專案`}</small>
            </div>
            <div className="project-compare__columns" style={{ "--compare-columns": selected.length } as CSSProperties}>
              {selected.map((item, index) => (
                <article className="project-compare__column" key={item.id}>
                  <div className="project-compare__column-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{item.date ?? item.maturity}</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.evidence[dimension]}</p>
                  <a href={`${item.route}#${evidenceAnchors[dimension]}`}>{locale === "en" ? "View project details" : "查看專案詳情"}<ArrowRight size={15} aria-hidden="true" /></a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
