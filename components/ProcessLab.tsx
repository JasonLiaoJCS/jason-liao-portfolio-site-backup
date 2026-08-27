"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/site-config";
import { localizePath } from "@/lib/site-config";

type Props = {
  locale: Locale;
};

type ProcessStep = {
  number: string;
  title: { en: string; zh: string };
  cue: { en: string; zh: string };
  question: { en: string; zh: string };
  caseTitle: { en: string; zh: string };
  caseLabel: { en: string; zh: string };
  caseBody: { en: string; zh: string };
  evidence: Array<{ en: string; zh: string }>;
  maturity: { en: string; zh: string };
  route: string;
};

const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: { en: "Define", zh: "定義" },
    cue: { en: "Question & criteria", zh: "問題與判準" },
    question: {
      en: "What would count as the system actually working?",
      zh: "什麼條件才算系統真的運作正確？",
    },
    caseTitle: { en: "RedRHex locomotion", zh: "RedRHex 步態控制" },
    caseLabel: { en: "Research turning point", zh: "研究關鍵轉折" },
    caseBody: {
      en: "A high training return was masking synchronized leg motion, slipping, and body contact. I reframed the question from “does it score well?” to “does it move correctly?”",
      zh: "高獎勵值掩蓋了六腳同步擺動、打滑與機身觸地。我把問題從「分數高不高」重新定義為「是否真的走對」。",
    },
    evidence: [
      { en: "Evaluate physical behavior before relying on a single score", zh: "先檢查物理行為，再判讀單一分數" },
      { en: "Verified baseline kept separate from experimental branches", zh: "明確區分已驗證基準與實驗分支" },
    ],
    maturity: { en: "In progress", zh: "進行中" },
    route: "/research/redrhex",
  },
  {
    number: "02",
    title: { en: "Model", zh: "建模" },
    cue: { en: "Physics & assumptions", zh: "物理與假設" },
    question: {
      en: "Which model is simple enough to use, yet faithful enough to guide a decision?",
      zh: "模型要簡化到能使用，又要保留哪些關鍵物理，才能支持決策？",
    },
    caseTitle: { en: "Vision-based LKAS", zh: "視覺式車道置中系統" },
    caseLabel: { en: "Model-to-vehicle chain", zh: "從模型到實車" },
    caseBody: {
      en: "The prototype connects a bicycle model, OpenCV lane estimation, Raspberry Pi 5, and PI-SMC steering control in one complete pipeline.",
      zh: "原型把 Bicycle Model、OpenCV 車道估測、Raspberry Pi 5 與 PI-SMC 轉向控制接成一套從模型到實車的完整流程。",
    },
    evidence: [
      { en: "Model assumptions remain visible", zh: "保留可檢視的模型假設" },
      { en: "Report each result with its test conditions", zh: "每項結果皆附相應測試條件" },
    ],
    maturity: { en: "Reported", zh: "依報告記載" },
    route: "/projects/lkas",
  },
  {
    number: "03",
    title: { en: "Integrate", zh: "整合" },
    cue: { en: "Interfaces & system", zh: "介面與系統" },
    question: {
      en: "Where do individually correct parts fail when they become one system?",
      zh: "各自正確的模組組成系統後，最可能在哪個介面失效？",
    },
    caseTitle: { en: "Inventor ball-circulation system", zh: "Inventor 小球循環機構" },
    caseLabel: { en: "Full-system integration", zh: "全系統整合" },
    caseBody: {
      en: "In a four-person project, I independently handled the full assembly, drive, module interfaces and elevator, complete animation, presentation, and oral delivery.",
      zh: "四人共同作品中，我獨立負責全系統總組合、驅動、模組介面與電梯、完整動畫、簡報與口頭發表。",
    },
    evidence: [
      { en: "Three teammates’ modules joined into one mechanism", zh: "把三位同伴的模組接成完整機構" },
      { en: "Interfaces treated as a core engineering responsibility", zh: "將介面設計視為核心工程工作" },
    ],
    maturity: { en: "Verified", zh: "已驗證" },
    route: "/projects/inventor-system-integration",
  },
  {
    number: "04",
    title: { en: "Verify", zh: "驗證" },
    cue: { en: "Checks & results", zh: "檢核與結果" },
    question: {
      en: "What would reveal that a plausible-looking answer is wrong?",
      zh: "如何辨認一個看似合理、實際上卻錯誤的答案？",
    },
    caseTitle: { en: "Numerical Analysis", zh: "數值分析" },
    caseLabel: { en: "Validation through cross-checks", zh: "以交叉檢查建立可信度" },
    caseBody: {
      en: "Across two individual projects totaling 158 pages, I connected derivation, implementation, and validation instead of treating a solver output as the conclusion.",
      zh: "兩份共 158 頁的個人專題完整呈現推導、實作與驗證，並未將求解器輸出直接視為結論。",
    },
    evidence: [
      { en: "Errors, residuals, reference solutions, and convergence", zh: "誤差、殘差、參考解與收斂檢查" },
      { en: "FFT agreement to 6.38×10⁻¹⁶", zh: "FFT 與直接計算相差 6.38×10⁻¹⁶" },
    ],
    maturity: { en: "Verified", zh: "已驗證" },
    route: "/academics/numerical-analysis",
  },
  {
    number: "05",
    title: { en: "Document", zh: "紀錄" },
    cue: { en: "Decision history", zh: "決策紀錄" },
    question: {
      en: "Does the record explain both what changed and why?",
      zh: "紀錄是否足以說明每項修改及其理由？",
    },
    caseTitle: { en: "Aero Carrier", zh: "Aero Carrier 四旋翼搬運系統" },
    caseLabel: { en: "Decision history", zh: "決策歷程" },
    caseBody: {
      en: "A 16-version decision history, documented technical meetings, test evidence, and a 140-page team report preserved the path from constraints to a working prototype.",
      zh: "16 版設計決策、技術會議紀錄、測試結果與 140 頁團隊報告，記錄原型從限制條件走到完成驗收的過程。",
    },
    evidence: [
      { en: "Tradeoffs recorded with their test context", zh: "取捨與對應測試情境一併留下" },
      { en: "Final evaluation: 100 / 100", zh: "期末驗收：100／100" },
    ],
    maturity: { en: "Verified", zh: "已驗證" },
    route: "/projects/aero-carrier",
  },
  {
    number: "06",
    title: { en: "Handoff", zh: "交接" },
    cue: { en: "Continuity & next steps", zh: "後續與交接" },
    question: {
      en: "What must the next person know to continue without guessing?",
      zh: "下一位接手者需要知道什麼，才能不靠猜測繼續推進？",
    },
    caseTitle: { en: "RedRHex research pipeline", zh: "RedRHex 研究流程" },
    caseLabel: { en: "Research status and next steps", zh: "研究進度與範圍" },
    caseBody: {
      en: "The record separates the verified 56D baseline, initial hardware testing, and the experimental 280D actor / 327D teacher branch, giving subsequent work a clear starting point.",
      zh: "研究紀錄清楚區分已驗證的 56D 基準模型、受控真機啟動測試，以及實驗中的 280D actor／327D teacher 分支，讓後續工作有明確起點。",
    },
    evidence: [
      { en: "Separate results, targets, and limitations", zh: "清楚區分結果、目標與限制" },
      { en: "A clear path from model assets to hardware testing", zh: "從模型檔案到真機測試的流程清楚可循" },
    ],
    maturity: { en: "In progress", zh: "進行中" },
    route: "/research/redrhex",
  },
];

export function ProcessLab({ locale }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabsId = "process-lab";
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeStep = processSteps[activeIndex];
  const copy = <T extends { en: string; zh: string }>(value: T) => value[locale];

  const selectStep = (index: number) => {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % processSteps.length;
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (index - 1 + processSteps.length) % processSteps.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = processSteps.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      selectStep(nextIndex);
    }
  };

  return (
    <section className="process-lab" aria-labelledby={`${tabsId}-title`}>
      <header className="process-lab__header">
        <div>
          <p className="eyebrow">{locale === "en" ? "Working method" : "工作方法"}</p>
          <h2 id={`${tabsId}-title`}>
            {locale === "en"
              ? "How I define, test, document, and hand off technical work."
              : "我如何定義問題、完成測試、整理文件並交接技術成果。"}
          </h2>
        </div>
        <p>
          {locale === "en"
            ? "Each step is illustrated with an actual research, engineering, or academic project."
            : "每一步皆以實際研究、工程專案或課程成果說明。"}
        </p>
      </header>

      <div className="process-lab__workspace">
        <div
          className="process-lab__tabs"
          role="tablist"
          aria-label={locale === "en" ? "Six-step working method" : "六步工作方法"}
          style={{ "--process-progress": `${((activeIndex + 1) / processSteps.length) * 100}%` } as CSSProperties}
        >
          {processSteps.map((step, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={step.number}
                ref={(element) => { tabRefs.current[index] = element; }}
                type="button"
                id={`${tabsId}-tab-${index}`}
                className={`process-lab__tab${selected ? " is-active" : ""}`}
                role="tab"
                aria-selected={selected}
                aria-controls={`${tabsId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                <span className="process-lab__tab-number" aria-hidden="true">{step.number}</span>
                <span className="process-lab__tab-copy">
                  <strong>{copy(step.title)}</strong>
                  <small>{copy(step.cue)}</small>
                </span>
                <span className="process-lab__tab-state" aria-hidden="true">{selected ? "●" : "○"}</span>
              </button>
            );
          })}
        </div>

        <div
          className="process-lab__panel"
          id={`${tabsId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-tab-${activeIndex}`}
          tabIndex={0}
        >
          <span key={`process-sheen-${activeIndex}`} className="process-lab__panel-sheen" aria-hidden="true" />
          <div className="process-lab__panel-intro">
            <span className="process-lab__panel-index" aria-hidden="true">{activeStep.number}</span>
            <div>
              <p className="process-lab__panel-kicker">{copy(activeStep.cue)}</p>
              <h3>{copy(activeStep.title)}</h3>
              <p className="process-lab__question">{copy(activeStep.question)}</p>
            </div>
          </div>

          <article className="process-lab__case">
            <div className="process-lab__case-heading">
              <div>
                <span>{copy(activeStep.caseLabel)}</span>
                <h4>{copy(activeStep.caseTitle)}</h4>
              </div>
              <span className="chip chip--gold">{copy(activeStep.maturity)}</span>
            </div>
            <p>{copy(activeStep.caseBody)}</p>
            <ul className="process-lab__evidence">
              {activeStep.evidence.map((item) => (
                <li key={item.en}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <span>{copy(item)}</span>
                </li>
              ))}
            </ul>
            <a className="process-lab__cta" href={localizePath(activeStep.route, locale)}>
              <span>{locale === "en" ? "View related work" : "查看相關成果"}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
