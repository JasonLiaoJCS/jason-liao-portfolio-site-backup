import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const referenceRoot = path.resolve(projectRoot, "..");
const outputPath = path.join(projectRoot, "lib", "coursework-public-details.json");
const courseworkRoot = path.join(
  referenceRoot,
  "03_學歷成績與學術證明",
  "03-11_課程成果與學術作品_Coursework",
);

const sources = [
  ["coursework-001", "/academics/intermediate-dynamics", "01_中等動力學_Intermediate_Dynamics"],
  ["coursework-002", "/academics/numerical-analysis", "02_數值分析_Numerical_Analysis"],
  ["coursework-003", "/academics/coursework/practice-of-mechanical-engineering", "03_機械工程實務_Practice_of_Mechanical_Engineering"],
  ["coursework-004", "/academics/coursework/computer-programming-in-python", "04_Python計算機程式設計_Computer_Programming_in_Python"],
  ["coursework-005", "/academics/coursework/physical-model-design-laboratory", "05_土木工程基本實作_Physical_Model_Design_Laboratory"],
  ["coursework-006", "/academics/coursework/engineering-graphics", "06_工程圖學_Engineering_Graphics"],
  ["coursework-007", "/academics/engineering-mathematics", "07_工程數學_Engineering_Mathematics"],
  ["coursework-008", "/academics/coursework/introduction-to-mathematical-analysis-i", "08_分析導論一_Introduction_to_Mathematical_Analysis_I"],
  ["coursework-009", "/academics/coursework/vehicle-dynamics-and-control", "09_車輛動力學與控制_Vehicle_Dynamics_and_Control"],
  ["coursework-010", "/academics/coursework/fluid-mechanics", "10_流體力學_Fluid_Mechanics"],
  ["coursework-011", "/academics/coursework/computer-aided-engineering-drawing", "11_電腦輔助工程製圖_Computer_Aided_Engineering_Drawing"],
  ["coursework-012", "/academics/linear-algebra-fft", "12_線性代數與應用_Linear_Algebra_and_Its_Applications"],
  ["coursework-013", "/academics/mechanical-laboratory-ii", "13_機械工程實驗二_Mechanical_Engineering_Laboratory_II"],
  ["coursework-014", "/academics/coursework/machine-design-theory", "14_機械設計原理_Machine_Design_Theory"],
  ["coursework-015", "/academics/coursework/additive-manufacturing", "15_積層製造_Additive_Manufacturing"],
];

const englishEditorialReplacements = {
  "coursework-001": [["The A+ result and complete derivations together show that my foundation in mechanics extends beyond formula substitution. I can convert a complex physical system into a computable model, identify what changes when an assumption changes, and design numerical experiments that continue the inquiry when analytical methods reach their limits.", "The project required me to translate a coupled physical system into a computable model, trace the effect of each assumption, and use numerical experiments where closed-form analysis was insufficient. The final submission received an A+, and the complete derivations record each step of the analysis."]],
  "coursework-003": [
    ["reliability, repeatability, and recoverability must enter the decision together", "reliability, repeatability, and recoverability must be considered together"],
    ["This decision reflects my engineering view: speed is not the only KPI;", "The decision reflected the team’s engineering priorities: speed was not the only criterion;"],
  ],
  "coursework-004": [
    ["an approximately 50/50 win-rate balance", "an approximately even 50/50 win rate"],
    ["This work demonstrates an engineering approach to software: decompose complex behavior into observable states and explicit interfaces, build diagnostic tools, and then use behavior, curves, and match outcomes to verify whether a change works. It also introduced me early to reward hacking, data logging, and experimental reproducibility, providing important preparation for my later RedRHex reinforcement-learning research.", "The project required the team to decompose complex behavior into observable states and explicit interfaces, build diagnostic tools, and evaluate changes through behavior, training curves, and match outcomes. It also provided early experience with reward hacking, data logging, and reproducible experiments that later informed my RedRHex research."],
  ],
  "coursework-005": [
    ["My assigned role was `calculating`.", "I was responsible for the theoretical calculations."],
    ["improve, and to see within a clear division of labor that theory", "improve. It also showed me, through a clear division of labor, that theory"],
  ],
  "coursework-006": [["so that appearance, assembly, and output requirements could all hold at once", "so that the appearance, assembly, and output requirements could all be satisfied simultaneously"]],
  "coursework-007": [
    ["The grades are not the only evidence that matters. I complete derivations omitted in class, reconnect assumptions and methods across chapters, and continue organizing examples, visual explanations, and physical meaning. My Engineering Mathematics notes have consequently grown beyond 1,600 pages. I also use review sessions and peer discussion to test my understanding: only when I can explain a method clearly and answer follow-up questions has it become knowledge I can actually use.", "Beyond the course results, I completed omitted derivations, connected assumptions and methods across chapters, and organized examples, visual explanations, and physical interpretations in more than 1,600 pages of notes. Review sessions and peer discussion provided an additional check: if I could not explain a method clearly or answer follow-up questions, I treated it as not yet fully understood."],
    ["This foundation later entered the convergence and finite-element work in Numerical Analysis, the state-space and stability work in LKAS, the dynamics and control of RedRHex, and my fluids and structures courses. The website does not need to display every assignment from all nine courses. An academic summary, representative notes, and three concrete applications are enough to demonstrate depth and continuity clearly.", "I later applied this foundation to convergence and finite-element work in Numerical Analysis, state-space and stability analysis in LKAS, dynamics and control in RedRHex, and later fluids and structures coursework. Representative notes and project applications show how this mathematical foundation carried into subsequent research and engineering work."],
  ],
  "coursework-008": [["This training matters in research. When I work on controller stability, numerical convergence, or reinforcement-learning evaluation, I more naturally ask: What is the success criterion? Under which conditions does the conclusion apply? Where might a counterexample appear? I do not present Introduction to Mathematical Analysis as a large project, but it genuinely changed how I read theory, write derivations, and inspect arguments.", "The course changed how I read theory, write derivations, and inspect arguments, particularly in later work on controller stability, numerical convergence, and reinforcement-learning evaluation. I now begin by asking what success means, under which conditions a conclusion applies, and where a counterexample might appear."]],
  "coursework-009": [
    ["This project shows how I approach a complex problem: establish an interpretable model and success metrics, then compare control strategies. When pure SMC appeared likely to retain steady-state error, the response was not arbitrary tuning but a theoretically motivated structural change—adding PI—followed by testing against low-cost hardware, camera noise, and real-time delay.", "I began with an interpretable model and explicit success metrics, then compared control strategies. Anticipated steady-state error under pure SMC motivated a theoretically grounded change to PI-SMC, which the team then tested under the constraints of low-cost hardware, camera noise, and real-time delay."],
    ["under an initial lateral velocity of 2 m/s", "with an initial lateral velocity of 2 m/s"],
    ["Because the latter three figures currently lack public raw logs and a complete test table, the website labels them as `reported results` rather than presenting them as headline benchmarks.", "Because the latter three figures are not accompanied here by raw logs and a complete test table, they are reported from the course documentation and have not been independently verified."],
  ],
  "coursework-010": [
    ["I do not select only material that makes it easy to preserve a strong grade", "I do not select courses solely to protect a strong academic record"],
    ["Earning A+ in both foundational Fluid Mechanics courses demonstrates consistent command of the core theory. Continuing into Fluid Mechanics II reflects another principle behind my course choices: I do not select courses solely to protect a strong academic record; I continue into the knowledge I genuinely want to understand. This training also informed the Aero Carrier team’s reasoning about rotor downwash, ground effect, and flight stability, allowing classroom concepts to enter a physical system.", "I earned A+ in both foundational Fluid Mechanics courses and continued into Fluid Mechanics II to deepen the subject rather than stop at the introductory sequence. The coursework also informed Aero Carrier’s analysis of rotor downwash, ground effect, and flight stability."],
  ],
  "coursework-011": [
    ["Inventor Studio could not calculate it", "Inventor Studio could not compute the animation"],
    ["This is representative system debugging", "This exemplifies systems debugging"],
  ],
  "coursework-014": [["allowing the analysis and reliability to face a physical test", "providing a physical test of both the analysis and the mechanism's reliability"]],
  "coursework-012": [["This project reflects how I learn across fields: first understand the abstract structure, then ask how it reduces computational cost, how it is implemented, and under which conditions another method would be preferable. That is how linear algebra becomes a genuine foundation for numerical analysis, control, signal processing, and robotics research.", "The project connected abstract structure, computational cost, implementation, and method selection across numerical analysis, control, signal processing, and robotics."]],
  "coursework-013": [["We did not package the incomplete test as a successful validation. Instead, we preserved the theoretical model, stated the limitation, and defined the equipment required for the next experiment.", "The test did not cover the terminal-speed regime, so we retained the theoretical model, stated the limitation, and identified the equipment required for the next experiment."]],
};

const traditionalChineseEditorialReplacements = {
  "coursework-001": [[
    "這門課的 A+ 與完整推導，共同證明我的力學底盤不只停在公式套用。我能把複雜物理系統整理成可計算模型，知道每個假設改變了什麼，也能在解析方法走到極限時，設計數值實驗繼續追問問題。",
    "這門課取得 A+；完整推導則記錄我如何將複雜物理系統整理成可計算模型、釐清各項假設的影響，並在解析方法不足時以數值實驗繼續檢驗問題。",
  ]],
  "coursework-002": [[
    "這兩份成果最能呈現我的解題習慣：不把「程式跑出數字」視為完成。我會先定義誤差與成功標準，安排解析解、數值解或最細網格作為對照，再用圖、表、殘差與 convergence rate 交叉檢查。當結果不符合預期時，我會回到節點分布、條件數、邊界條件、離散化與有限精度逐層排查，而不是只調參數讓圖看起來合理。",
    "在兩份專題中，我不把「程式跑出數字」視為完成：先定義誤差與成功標準，以解析解、參考數值解或最細網格作為對照，再用圖表、殘差與收斂階交叉檢查。結果不符預期時，則回到節點分布、條件數、邊界條件、離散化與有限精度逐層排查。",
  ]],
  "coursework-003": [[
    "這項選擇很能代表我的工程觀：速度不是唯一 KPI；可靠性、可重複性與可恢復性必須一起進入決策。",
    "這項決策反映團隊的工程取捨：速度並非唯一指標，可靠性、可重複性與故障後恢復能力同樣重要。",
  ]],
  "coursework-004": [[
    "這份成果展現的是一種很工程化的程式思維：把複雜行為拆成可觀察狀態與明確介面，建立診斷工具，再用行為、曲線與對戰結果確認修改是否有效。它也讓我更早接觸到 reward hacking、資料記錄與實驗可重現性，成為後續 RedRHex 強化學習研究的重要前導經驗。",
    "這項專題採取系統化的程式設計方法：將複雜行為拆為可觀察狀態與明確介面，建立診斷工具，再以行為、訓練曲線與對戰結果評估修改。專題也讓我提早接觸 reward hacking、資料記錄與實驗可重現性，並成為後續 RedRHex 強化學習研究的前導經驗。",
  ]],
  "coursework-005": [[
    "成果中的實驗與模擬並非完全重合，這反而提供了重要的工程判斷空間：影像取點、軌道幾何、摩擦、轉動慣量與初始條件都可能造成落差。對我而言，這門課最有價值的部分，是學會把「模型」當作可被實體反駁與修正的工具，也在明確分工中體會到理論、程式與實驗必須彼此說得通。",
    "實驗與模擬並未完全重合；影像取點、軌道幾何、摩擦、轉動慣量與初始條件都可能是誤差來源。這門課讓我學會把模型視為可由實驗檢驗與修正的工具，也在明確分工中確認理論、程式與實驗必須彼此一致。",
  ]],
  "coursework-006": [[
    "這個作品的挑戰不只是「看起來像一台車」。每個零件仍需遵守厚度、凸點、底部圓柱與整數倍尺寸規則，組合後也要維持合理的接合與整體比例。我透過 Inventor 的零件、組合與約束流程反覆調整，讓造型、裝配與輸出需求同時成立，最後完成工程圖與可呈現組裝順序的動畫。",
    "這項作品除了呈現完整車體造型，也必須符合零件厚度、凸點、底部圓柱與整數倍尺寸等規則。透過 Inventor 的零件、組合與約束流程反覆調整後，我完成工程圖，以及可呈現組裝順序的動畫。",
  ], [
    "這份 A+ 成果看似是基礎課程，卻建立了後續機械設計、複雜組立、機器人 CAD 資產與系統整合所需的共同語言：尺寸要精確、介面要明確，圖面必須讓別人看得懂並接得起來。",
    "這門取得 A+ 的基礎課程，建立了後續機械設計、複雜組立、機器人 CAD 模型與系統整合所需的共同語言：尺寸必須精確、介面必須明確，圖面也須讓他人能理解並接續使用。",
  ]],
  "coursework-007": [[
    "工程數學對我而言不是一串等考完就忘記的公式，而是理解力學、控制、流體、數值方法與機器人的共同語言。我同時修讀土木與機械體系的工程數學課程，刻意從不同教師、符號與應用脈絡重新理解相同觀念；九門微積分與工程數學主幹共 20 學分全數取得 A+。",
    "工程數學是理解力學、控制、流體、數值方法與機器人的共同語言。我同時修讀土木與機械體系的工程數學課程，從不同教師、符號與應用脈絡重新理解相同觀念；九門微積分與工程數學核心課程共 20 學分全數取得 A+。",
  ], [
    "真正能代表我的，不只有成績。我會把課堂略過的推導補完，把不同章節的假設與方法重新接起來，也持續整理例題、圖像與物理意義；工程數學筆記因此累積超過 1,600 頁。我也常以複習會或同儕討論檢查自己的理解：能把一個方法說清楚、回答追問，才代表它真的成為可使用的知識。",
    "除了成績，我也補全課堂略過的推導，重新連結不同章節的假設與方法，並持續整理例題、圖像與物理意義；工程數學筆記因此累積超過 1,600 頁。我也透過複習會與同儕討論檢查自己的理解，確認能清楚說明方法並回答追問。",
  ], [
    "這套底盤後來直接進入數值分析的收斂與有限元素、LKAS 的狀態空間與穩定性、RedRHex 的動力學與控制，以及流體與結構課程。網站不需要陳列九門課的所有作業；只要用成績摘要、代表筆記與三個實際應用，便能清楚證明我對數學的深度與持續性。",
    "這套數學基礎後來應用於數值分析的收斂與有限元素、LKAS 的狀態空間與穩定性、RedRHex 的動力學與控制，以及流體與結構課程；代表筆記與實際案例呈現這些知識如何延續至後續研究與工程實作。",
  ]],
  "coursework-008": [[
    "分析導論沒有被包裝成大型專案，但它確實改變了我閱讀理論、寫推導與檢查論證的方式。",
    "分析導論的價值不在大型作品，而在於它改變了我閱讀理論、撰寫推導與檢查論證的方式。",
  ]],
  "coursework-009": [[
    "這項成果最能代表我如何解決複雜問題：先建立可解釋模型與成功指標，再比較控制策略；發現純 SMC 可能留下穩態偏差後，不是任意調參，而是引入 PI 形成有理論目的的結構改良，最後再讓數學結果接受低成本硬體、相機噪聲與即時延遲的檢驗。",
    "我先建立可解釋的模型與成功指標，再比較控制策略。純 SMC 可能留下穩態偏差，因此團隊以理論為依據加入 PI，形成 PI-SMC，並在低成本硬體、相機噪聲與即時延遲等條件下測試。",
  ], [
    "現有推導不宣稱已完成嚴格的全域漸近穩定證明。",
    "目前推導尚未涵蓋嚴格的全域漸近穩定性證明。",
  ], [
    "後三項目前缺少公開 raw log／完整測試表，因此網站標示為 `reported results`，不以主視覺 benchmark 呈現。",
    "後三項尚缺原始紀錄與完整測試表，因此目前僅依課程報告列示，未作獨立驗證。",
  ]],
  "coursework-013": [[
    "我們沒有把不完整測試包裝成成功驗證，而是保留理論模型、說明限制，並界定下一輪實驗需要的設備。",
    "由於測試尚未完整涵蓋終端速度區段，報告保留理論模型、說明現有量測限制，並列出下一輪實驗所需設備。",
  ]],
  "coursework-010": [[
    "兩門基礎流體力學皆取得 A+，說明我能穩定掌握核心理論；後續再修流體力學（二），則反映我選課的原則不是只挑容易維持成績的內容，而是願意把真正想理解的知識繼續往下學。這套訓練也回到 Aero Carrier 的旋翼下洗、地面效應與飛行穩定性判斷，讓課堂概念進入實際系統。",
    "兩門基礎流體力學皆取得 A+，並進一步修讀流體力學（二），持續深化守恆律、壓力、黏性與流動機制等主題。這些訓練也應用於 Aero Carrier 的旋翼下洗、地面效應與飛行穩定性分析。",
  ]],
  "coursework-012": [[
    "這份成果很能代表我的跨域學習方式：先掌握抽象結構，再問它如何降低計算成本、如何被實作，以及在哪些條件下需要改用別的方法。這也是線性代數能真正支撐數值分析、控制、訊號處理與機器人研究的原因。",
    "這項專題先掌握 FFT 的抽象結構，再分析其如何降低計算成本、如何實作，以及何時需要改用其他方法；同時也說明線性代數如何支撐數值分析、控制、訊號處理與機器人研究。",
  ]],
};

function polishEnglishMarkdown(courseworkId, markdown) {
  return (englishEditorialReplacements[courseworkId] ?? []).reduce(
    (current, [before, after]) => current.replaceAll(before, after),
    markdown,
  );
}

function polishTraditionalChineseMarkdown(courseworkId, markdown) {
  return (traditionalChineseEditorialReplacements[courseworkId] ?? []).reduce(
    (current, [before, after]) => current.replaceAll(before, after),
    markdown,
  );
}

function readSource(relativeDirectory, locale) {
  const fileName = locale === "zh" ? "00_網站文案草稿.md" : "01_Website_Copy_EN.md";
  return fs.readFileSync(path.join(courseworkRoot, relativeDirectory, fileName), "utf8")
    .replace(/\r\n?/g, "\n");
}

function sectionBody(markdown, heading) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) throw new Error(`Missing public section: ${heading}`);
  let end = start + 1;
  while (end < lines.length && !/^##\s+/.test(lines[end])) end += 1;
  const body = lines.slice(start + 1, end).join("\n").trim();
  if (!body) throw new Error(`Empty public section: ${heading}`);
  return body;
}

function cells(line) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function blocksFromMarkdown(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{3,4})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const headers = cells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(cells(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const orderedList = Boolean(ordered);
      const items = [];
      while (index < lines.length) {
        const candidate = lines[index].trim();
        const item = orderedList
          ? candidate.match(/^\d+[.)]\s+(.+)$/)
          : candidate.match(/^[-*]\s+(.+)$/);
        if (!item) break;
        items.push(item[1].trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered: orderedList, items });
      continue;
    }

    const paragraph = [line.replace(/^>\s?/, "")];
    index += 1;
    while (index < lines.length) {
      const candidate = lines[index].trim();
      if (!candidate) break;
      if (/^#{3,4}\s+/.test(candidate)) break;
      if (/^[-*]\s+/.test(candidate) || /^\d+[.)]\s+/.test(candidate)) break;
      if (candidate.startsWith("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) break;
      paragraph.push(candidate.replace(/^>\s?/, ""));
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function assertVisitorSafe(value, courseworkId) {
  const text = JSON.stringify(value);
  const forbidden = [
    /[A-Za-z]:\\\\/,
    /(?:^|[\\/])Users[\\/]/i,
    /(?:參考資料|學術申請用網站)[\\/]/,
    /canonical_source/i,
    /local_only/i,
    /visibility\s*:/i,
    /Internal Editorial Notes/i,
    /內部建站註記/,
    /Do Not Publish/i,
    /禁止直接公開/,
    /素材治理/,
    /隱私備註/,
    /website does not need/i,
    /網站不需要/,
    /package the incomplete test/i,
    /把不完整測試包裝成/,
  ];
  const hit = forbidden.find((pattern) => pattern.test(text));
  if (hit) throw new Error(`Unsafe visitor-facing content for ${courseworkId}: ${hit}`);
}

const records = sources.map(([courseworkId, route, relativeDirectory]) => {
  const record = {
    courseworkId,
    route,
    sourceStatus: "canonical_markdown",
    blocks: {
      en: blocksFromMarkdown(polishEnglishMarkdown(courseworkId, sectionBody(readSource(relativeDirectory, "en"), "Detailed Copy"))),
      zh: blocksFromMarkdown(polishTraditionalChineseMarkdown(courseworkId, sectionBody(readSource(relativeDirectory, "zh"), "詳情文案"))),
    },
  };
  assertVisitorSafe(record, courseworkId);
  return record;
});

if (records.length !== 15) {
  throw new Error(`Expected 15 coursework detail records, received ${records.length}`);
}
if (new Set(records.map((record) => record.courseworkId)).size !== records.length) {
  throw new Error("Coursework detail IDs must be unique");
}
if (new Set(records.map((record) => record.route)).size !== records.length) {
  throw new Error("Coursework detail routes must be unique");
}
if (records.some((record) => !record.blocks.en.length || !record.blocks.zh.length)) {
  throw new Error("Every coursework detail record must include English and Traditional Chinese blocks");
}

fs.writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
console.log(`Generated ${records.length} coursework detail records at ${path.relative(projectRoot, outputPath)}`);
