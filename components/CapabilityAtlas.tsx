"use client";

import {
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Layers3,
  ScanSearch,
  Sigma,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { Locale } from "@/lib/site-config";
import { localizePath } from "@/lib/site-config";
import { BrandLogo } from "./BrandLogo";

type Capability = {
  id: string;
  code: string;
  icon: typeof FlaskConical;
  title: { en: string; zh: string };
  summary: { en: string; zh: string };
  signal: { en: string; zh: string };
  evidence: Array<{
    path: string;
    title: { en: string; zh: string };
    note: { en: string; zh: string };
  }>;
};

const CAPABILITIES: Capability[] = [
  {
    id: "research",
    code: "R",
    icon: FlaskConical,
    title: { en: "Research judgment", zh: "研究判斷" },
    summary: {
      en: "I frame testable questions, separate observation from assumption, and change course when evidence contradicts the original premise.",
      zh: "我把問題化為可檢驗的假設，區分觀察與推論，並在證據推翻原先前提時調整研究方向。",
    },
    signal: { en: "Question → test → revised model", zh: "提問 → 檢驗 → 修正模型" },
    evidence: [
      { path: "/research/redrhex", title: { en: "RedRHex locomotion research", zh: "RedRHex 步態控制研究" }, note: { en: "Diagnosing reward–behavior mismatch through simulation and controlled hardware tests.", zh: "以模擬與受控真機測試，診斷獎勵值與實際行為不一致的問題。" } },
      { path: "/research/geometry-covering", title: { en: "Geometric covering optimization", zh: "幾何覆蓋最佳化" }, note: { en: "An early study that retained an unresolved question after numerical evidence challenged the conjecture.", zh: "數值證據推翻原猜想後，仍如實保留未解問題的早期研究。" } },
      { path: "/academics/numerical-analysis", title: { en: "Numerical analysis", zh: "數值分析" }, note: { en: "Error, convergence, conditioning, and the limits of a numerical result.", zh: "從誤差、收斂與條件數，判斷數值結果何時值得信任。" } },
    ],
  },
  {
    id: "theory",
    code: "T",
    icon: Sigma,
    title: { en: "Theoretical foundation", zh: "理論基礎" },
    summary: {
      en: "Mathematics and mechanics guide how I approach engineering problems, supported by coursework in analysis, dynamics, and computation.",
      zh: "數學與力學是我處理工程問題的核心；分析、動力學與計算等課程則構成相應基礎。",
    },
    signal: { en: "Mathematics · mechanics · computation", zh: "數學 · 力學 · 計算" },
    evidence: [
      { path: "/academics/course-record", title: { en: "Complete course and grade record", zh: "完整修課與成績紀錄" }, note: { en: "The record lists every course, credit, grade, GPA scope, and conversion method.", zh: "逐門列出課名、學分、成績、GPA 採計範圍與換算方式。" } },
      { path: "/academics/intermediate-dynamics", title: { en: "Intermediate dynamics", zh: "中等動力學" }, note: { en: "Complete derivations, coordinate choices, and physical interpretation.", zh: "以完整推導、座標選擇與物理解讀呈現力學思考。" } },
      { path: "/academics/engineering-mathematics", title: { en: "Engineering mathematics", zh: "工程數學" }, note: { en: "A formal course foundation connected to a searchable system of more than 1,600 pages of notes.", zh: "正式課程基礎，並連結超過 1,600 頁的可檢索筆記系統。" } },
    ],
  },
  {
    id: "validation",
    code: "V",
    icon: ScanSearch,
    title: { en: "Verification & validation", zh: "驗證與查核" },
    summary: {
      en: "I treat a plausible result as a starting point: define checks, inspect failure modes, document limits, and retain what remains uncertain.",
      zh: "我不把看似合理的結果當成結論；先建立檢核方法、檢視失效模式、記錄限制，並保留仍待確認之處。",
    },
    signal: { en: "Model → test → diagnose → document", zh: "模型 → 測試 → 診斷 → 紀錄" },
    evidence: [
      { path: "/projects/lkas", title: { en: "Vision-based lane keeping", zh: "視覺車道置中系統" }, note: { en: "A control stack validated from a bicycle model through physical-vehicle implementation.", zh: "從單車模型到實車實作，逐步驗證感知與控制系統。" } },
      { path: "/projects/aero-carrier", title: { en: "Aero Carrier", zh: "Aero Carrier 四旋翼搬運系統" }, note: { en: "Constraint-led test planning, quantified debugging, and a final score of 100 / 100.", zh: "依限制條件規劃測試、進行量化除錯，期末獲得 100／100。" } },
      { path: "/research/redrhex", title: { en: "Controlled hardware testing", zh: "受控真機測試" }, note: { en: "Physical behavior is checked against the policy’s apparent simulation performance.", zh: "以實際物理行為，檢查策略在模擬中看似良好的表現。" } },
    ],
  },
  {
    id: "systems",
    code: "S",
    icon: Layers3,
    title: { en: "System integration", zh: "系統整合" },
    summary: {
      en: "I connect models, code, CAD, hardware, interfaces, tests, and technical communication into systems that can be tested, operated, and handed off.",
      zh: "我把模型、程式、CAD、硬體、介面、測試與技術溝通，整合成可測試、可操作，也便於交接的系統。",
    },
    signal: { en: "Interfaces · constraints · working prototypes", zh: "介面 · 限制 · 可運作原型" },
    evidence: [
      { path: "/projects/jarvis", title: { en: "Jarvis multimodal home hub", zh: "Jarvis 多模態家庭中樞" }, note: { en: "Voice, vision, embedded interfaces, BLE, and edge computing integrated in 36 hours.", zh: "36 小時內整合語音、視覺、嵌入式介面、BLE 與邊緣運算。" } },
      { path: "/projects/aero-carrier", title: { en: "Aero Carrier", zh: "Aero Carrier 四旋翼搬運系統" }, note: { en: "A six-person system designed around mass, reliability, integration, and repeatable operation.", zh: "六人團隊圍繞重量、可靠度、整合與可重複操作完成系統。" } },
      { path: "/projects/inventor-system-integration", title: { en: "Inventor system integration", zh: "Inventor 複雜機構整合" }, note: { en: "Full-system assembly, drive, module interfaces, animation, presentation, and delivery.", zh: "負責總組合、驅動、模組介面、動畫、簡報與口頭發表。" } },
    ],
  },
  {
    id: "collaboration",
    code: "C",
    icon: UsersRound,
    title: { en: "Leadership & communication", zh: "領導與溝通" },
    summary: {
      en: "I make responsibilities, decisions, schedules, and technical ideas clear to teammates, learners, and collaborators across institutions.",
      zh: "我會向團隊夥伴、學習者與跨單位協作者清楚說明責任、決策、時程與技術內容。",
    },
    signal: { en: "Ownership · teaching · reliable follow-through", zh: "承擔 · 教學 · 持續跟進" },
    evidence: [
      { path: "/experience/trml-captain-2020-2021", title: { en: "Two years as TRML captain", zh: "連續兩年擔任 TRML 隊長" }, note: { en: "Mathematical strategy, task allocation, pacing, and trust across two competition seasons.", zh: "連續兩季兼顧數學策略、分工、比賽節奏與團隊信任。" } },
      { path: "/experience/qingshui-science-outreach", title: { en: "Science outreach", zh: "下鄉科學營" }, note: { en: "Translating technical ideas into activities responsive to junior-high learners.", zh: "把科學概念轉為清楚、有參與感，並能依學生反應調整的活動。" } },
      { path: "/experience/international-student-document-support", title: { en: "International student document support", zh: "國際學生文件協助" }, note: { en: "Coordination with university and government offices until a lawful solution was found.", zh: "協助釐清文件問題，並持續與校方及政府單位聯繫，直到找到合法可行的解決方案。" } },
    ],
  },
];

export function CapabilityAtlas({ locale }: { locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = CAPABILITIES[activeIndex];
  const ActiveIcon = active.icon;
  const english = locale === "en";

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % CAPABILITIES.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index - 1 + CAPABILITIES.length) % CAPABILITIES.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = CAPABILITIES.length - 1;
    else return;
    event.preventDefault();
    setActiveIndex(next);
    document.getElementById(`capability-tab-${CAPABILITIES[next].id}`)?.focus();
  };

  return (
    <section className={`capability-atlas capability-atlas--${active.id}`} id="home-capability-atlas" aria-labelledby="capability-atlas-title">
      <header className="capability-atlas__header">
        <div>
          <p className="eyebrow">{english ? "Capability map" : "能力與作品地圖"}</p>
          <h2 id="capability-atlas-title">{english ? "Capabilities across research and engineering." : "研究與工程實作中的核心能力。"}</h2>
        </div>
        <p>{english
          ? "Select a capability to view the corresponding research, coursework, and engineering projects."
          : "選擇一項能力，即可查看相應的研究、課程成果與工程專案。"}</p>
      </header>

      <div className="capability-atlas__body">
        <div className="capability-atlas__instrument">
          <div className="capability-atlas__orbit capability-atlas__orbit--outer" aria-hidden="true" />
          <div className="capability-atlas__orbit capability-atlas__orbit--inner" aria-hidden="true" />
          <div className="capability-atlas__sweep" aria-hidden="true" />
          <div className="capability-atlas__indicator-rotor" aria-hidden="true">
            <div className="capability-atlas__indicator"><span /></div>
          </div>
          <div className="capability-atlas__hub" aria-hidden="true">
            <span className="capability-atlas__mark"><BrandLogo decorative /></span>
            <small>{english ? "Research · engineering · practice" : "研究 · 工程 · 實作"}</small>
            <strong>{active.code}·0{activeIndex + 1}</strong>
          </div>
          <div className="capability-atlas__nodes" role="tablist" aria-label={english ? "Capabilities" : "能力面向"}>
            {CAPABILITIES.map((capability, index) => {
              const Icon = capability.icon;
              const selected = index === activeIndex;
              return (
                <div
                  key={capability.id}
                  role="presentation"
                  className={`capability-atlas__node-slot capability-atlas__node-slot--${index + 1}`}
                >
                  <div role="presentation" className="capability-atlas__node-anchor">
                    <button
                      id={`capability-tab-${capability.id}`}
                      type="button"
                      role="tab"
                      className={`capability-atlas__node capability-atlas__node--${index + 1}${selected ? " is-active" : ""}`}
                      aria-selected={selected}
                      aria-controls="capability-atlas-panel"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActiveIndex(index)}
                      onKeyDown={(event) => moveFocus(event, index)}
                    >
                      <span><Icon size={18} aria-hidden="true" /></span>
                      <small>0{index + 1}</small>
                      <strong>{capability.title[locale]}</strong>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <article
          id="capability-atlas-panel"
          className="capability-atlas__panel"
          role="tabpanel"
          aria-labelledby={`capability-tab-${active.id}`}
        >
          <div className="capability-atlas__panel-heading">
            <span><ActiveIcon size={21} aria-hidden="true" /></span>
            <div>
              <small>{active.signal[locale]}</small>
              <h3>{active.title[locale]}</h3>
            </div>
          </div>
          <p>{active.summary[locale]}</p>
          <ol className="capability-atlas__evidence">
            {active.evidence.map((item) => (
              <li key={item.path}>
                <a href={localizePath(item.path, locale)}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span><strong>{item.title[locale]}</strong><small>{item.note[locale]}</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
          <p className="capability-atlas__hint">{english
            ? "Use the arrow keys to move between capabilities. Each item opens the corresponding project or record."
            : "可使用方向鍵切換能力面向；每一項皆連結至相應作品或紀錄。"}</p>
        </article>
      </div>
    </section>
  );
}
