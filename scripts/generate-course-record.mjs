import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const sourcePath = resolve(
  projectRoot,
  "..",
  "03_學歷成績與學術證明",
  "03-09_臺大GPA成績單與A+課程",
  "廖致翔_完整學業成績彙整_截至114-2.md",
);
const outputPath = resolve(projectRoot, "lib", "course-record.json");

const translations = {
  "服務學習乙": "Service Learning (B)",
  "工程圖學": "Engineering Graphics",
  "測量學一": "Surveying I",
  "土木工程概念設計": "Conceptual Design in Civil Engineering",
  "應用力學1": "Applied Mechanics I",
  "應用力學2": "Applied Mechanics II",
  "工程數學1": "Engineering Mathematics I",
  "工程數學2": "Engineering Mathematics II",
  "工程數學3": "Engineering Mathematics III",
  "工程數學上": "Engineering Mathematics (I)",
  "工程數學下": "Engineering Mathematics (II)",
  "測量實習": "Surveying Practice",
  "日文上": "Japanese, First Semester",
  "微積分1": "Calculus I",
  "微積分2": "Calculus II",
  "微積分3": "Calculus III",
  "微積分4": "Calculus IV",
  "健康體適能": "Health-Related Physical Fitness",
  "普通心理學": "General Psychology",
  "計算機程式": "Computer Programming",
  "土木工程基本實作": "Fundamentals of Civil Engineering Practice",
  "棒球初級": "Beginning Baseball",
  "小故事，大世界": "Small Stories, Big World",
  "運輸工程": "Transportation Engineering",
  "分析導論一": "Introduction to Mathematical Analysis I",
  "工場實習": "Workshop Practice",
  "機械工程概論": "Introduction to Mechanical Engineering",
  "機動學": "Kinematics of Machinery",
  "普通物理學甲上": "General Physics (A), First Semester",
  "普通物理學甲下": "General Physics (A), Second Semester",
  "能源科學故事(二)：化石與再生能源": "Stories of Energy Science II: Fossil and Renewable Energy",
  "普通化學丙": "General Chemistry (C)",
  "流體力學": "Fluid Mechanics",
  "新生講座-活出精彩": "Freshman Seminar: Living Life to the Fullest",
  "動力學": "Dynamics",
  "機械製造": "Manufacturing Processes",
  "大學國文：文學鑑賞與寫作（一）": "College Chinese: Literary Appreciation and Writing I",
  "鋼琴作品與演奏欣賞": "Appreciation of Piano Repertoire and Performance",
  "工程材料": "Engineering Materials",
  "熱力學": "Thermodynamics",
  "熱傳學": "Heat Transfer",
  "自動控制": "Automatic Control",
  "機械工程量測原理": "Principles of Mechanical Engineering Measurement",
  "機械工程實驗（一）": "Mechanical Engineering Laboratory I",
  "籃球初級": "Beginning Basketball",
  "普通物理學實驗一": "General Physics Laboratory I",
  "普通化學實驗": "General Chemistry Laboratory",
  "日文一下": "Japanese I, Second Semester",
  "機械工程實驗（二）": "Mechanical Engineering Laboratory II",
  "車輛動力學與控制": "Vehicle Dynamics and Control",
  "電腦輔助工程製圖": "Computer-Aided Engineering Drawing",
  "桌球初級": "Beginning Table Tennis",
  "普通物理學實驗二": "General Physics Laboratory II",
  "線性代數與應用": "Linear Algebra and Applications",
  "靜力學": "Statics",
  "應用電子學(含實驗)": "Applied Electronics (with Laboratory)",
  "機械設計原理": "Principles of Machine Design",
  "流體力學二": "Fluid Mechanics II",
  "精密量測論文研討": "Precision Measurement Literature Seminar",
  "積層製造": "Additive Manufacturing",
  "學士專題研究": "Undergraduate Thesis Research",
  "機械工程實務": "Practice of Mechanical Engineering",
  "材料力學": "Mechanics of Materials",
  "數值分析": "Numerical Analysis",
  "中等動力學": "Intermediate Dynamics",
  "冷凍空調原理": "Principles of Refrigeration and Air Conditioning",
  "數位控制系統": "Digital Control Systems",
  "Python 計算機程式設計": "Computer Programming in Python",
  "邏輯": "Logic",
  "進階英語一": "Advanced English I",
  "進階英語二": "Advanced English II",
};

const semesterMeta = {
  "111學年度第1學期": { id: "111-1", en: "Fall 2022", zh: "111 學年度第 1 學期", earnedCredits: 22, gradedCredits: 22, gpa: "3.74 / 4.30" },
  "111學年度第2學期": { id: "111-2", en: "Spring 2023", zh: "111 學年度第 2 學期", earnedCredits: 17, gradedCredits: 17, gpa: "4.16 / 4.30" },
  "112學年度第1學期": { id: "112-1", en: "Fall 2023", zh: "112 學年度第 1 學期", earnedCredits: 17, gradedCredits: 12, gpa: "4.28 / 4.30" },
  "112學年度第2學期": { id: "112-2", en: "Spring 2024", zh: "112 學年度第 2 學期", earnedCredits: 19, gradedCredits: 17, gpa: "4.19 / 4.30" },
  "113學年度第1學期": { id: "113-1", en: "Fall 2024", zh: "113 學年度第 1 學期", earnedCredits: 19, gradedCredits: 19, gpa: "4.15 / 4.30" },
  "113學年度第2學期": { id: "113-2", en: "Spring 2025", zh: "113 學年度第 2 學期", earnedCredits: 22, gradedCredits: 22, gpa: "4.29 / 4.30" },
  "114學年度第1學期": { id: "114-1", en: "Fall 2025", zh: "114 學年度第 1 學期", earnedCredits: 26, gradedCredits: 26, gpa: "4.07 / 4.30" },
  "114學年度第2學期": { id: "114-2", en: "Spring 2026", zh: "114 學年度第 2 學期", earnedCredits: 21, gradedCredits: 21, gpa: "4.27 / 4.30" },
};

const domains = {
  CIE0005: "service", CIE1005: "design", CIE1010: "civil", CIE1012: "civil", CIE1013: "mechanics", CIE1015: "mathematics", CIE2016: "civil",
  JpnL1001: "humanities", MATH4006: "mathematics", MATH4007: "mathematics", PE1003: "team", Psy1007: "humanities",
  CIE1008: "computation", CIE1011: "civil", CIE1014: "mechanics", CIE1016: "mathematics", MATH4008: "mathematics", MATH4009: "mathematics", PE2097: "team", Write5024: "humanities",
  CIE2013: "civil", CIE2021: "mathematics", MATH2213: "mathematics", ME1007: "design", ME1010: "service", ME2006: "mechanics", Phys1006: "science",
  AM5035: "thermal", Chem1009: "science", CIE2009: "thermal", GenEdu2009: "humanities", ME0005: "service", ME1003: "design", ME1006: "mechanics", ME2008: "design", Phys1007: "science",
  CHIN8012: "humanities", LibEdu1020: "humanities", ME2004: "design", ME2005: "thermal", ME3003: "thermal", ME3007: "computation", ME3008: "design", ME3009: "design", PE2084: "team", Phys1040: "science",
  Chem1010: "science", JpnL2018: "humanities", ME2002: "mathematics", ME2003: "mechanics", ME2007: "thermal", ME3010: "design", ME5003: "computation", ME5248: "design", PE2074: "team", Phys1042: "science",
  IE5034: "computation", ME1005: "mechanics", ME2001: "mathematics", ME2102: "computation", ME3004: "design", ME3903: "thermal", ME5067: "research", ME5080: "design", ME5105: "research",
  ME1011: "design", ME5113: "computation", ME5148: "mechanics", ME5196: "thermal", ME5247: "computation", CSIE1929: "computation", LibEdu1021: "humanities",
  AdvEng2011: "humanities", AdvEng2012: "humanities",
};

const relatedRoutes = {
  CIE1011: "/academics/coursework/physical-model-design-laboratory",
  CIE1015: "/academics/engineering-mathematics", CIE1016: "/academics/engineering-mathematics", CIE2021: "/academics/engineering-mathematics",
  MATH4006: "/academics/engineering-mathematics", MATH4007: "/academics/engineering-mathematics", MATH4008: "/academics/engineering-mathematics", MATH4009: "/academics/engineering-mathematics",
  MATH2213: "/academics/coursework/introduction-to-mathematical-analysis-i",
  ME1003: "/academics/coursework/engineering-graphics", ME2001: "/academics/engineering-mathematics", ME2002: "/academics/engineering-mathematics",
  CIE2009: "/academics/coursework/fluid-mechanics", ME2007: "/academics/coursework/fluid-mechanics", ME3903: "/academics/coursework/fluid-mechanics",
  ME3010: "/academics/mechanical-laboratory-ii", ME5003: "/academics/coursework/vehicle-dynamics-and-control",
  ME5248: "/academics/coursework/computer-aided-engineering-drawing", IE5034: "/academics/linear-algebra-fft",
  ME3004: "/academics/coursework/machine-design-theory", ME5080: "/academics/coursework/additive-manufacturing",
  ME1011: "/academics/coursework/practice-of-mechanical-engineering", ME5113: "/academics/numerical-analysis",
  ME5148: "/academics/intermediate-dynamics", CSIE1929: "/academics/coursework/computer-programming-in-python",
  ME5105: "/research/redrhex",
};

const noteTranslations = {
  "採通過／不通過制": "Pass/fail grading",
  "後於113-2重新修習並獲A+": "Completed with A+ in Spring 2025",
  "後於114-1重新修習並獲A": "Completed with A in Fall 2025",
  "後於114-2重新修習並獲A+": "Completed with A+ in Spring 2026",
  "重新修習完成": "Completed after an earlier withdrawal",
  "通識領域A6": "General Education area A6",
  "通識領域A4": "General Education area A4",
};

const resultTranslation = { "通過": "Pass", "停修": "Withdrawn", "免修": "Exempt" };
const statusFor = (result) => result === "通過" ? "pass" : result === "停修" ? "withdrawn" : result === "免修" ? "exempt" : "graded";
const parseCells = (line) => line.slice(1, -1).split("|").map((cell) => cell.trim());

const markdown = await readFile(sourcePath, "utf8");
const lines = markdown.split(/\r?\n/);
const start = lines.findIndex((line) => line === "### 抵免／免修紀錄");
const end = lines.findIndex((line) => line === "## 6. 全部A+課程清單（46門）");
if (start < 0 || end < 0) throw new Error("Course-record source headings were not found.");

const semesters = [];
const exemptions = [];
let current = "exemptions";
for (const line of lines.slice(start + 1, end)) {
  if (line.startsWith("### ")) {
    const heading = line.slice(4).trim();
    if (!semesterMeta[heading]) throw new Error(`Unexpected semester heading: ${heading}`);
    current = heading;
    semesters.push({ ...semesterMeta[heading], courses: [] });
    continue;
  }
  if (!line.startsWith("|") || /^\|\s*(課號|---)/.test(line)) continue;
  const cells = parseCells(line);
  const [code, titleZh, creditsRaw, result, note = ""] = cells;
  if (!translations[titleZh]) throw new Error(`Missing English title for ${code} ${titleZh}`);
  if (!domains[code]) throw new Error(`Missing domain for ${code}`);
  const record = {
    code,
    title: { zh: titleZh, en: translations[titleZh] },
    credits: Number(creditsRaw),
    result: { zh: result, en: resultTranslation[result] ?? result.replace("-", "−") },
    status: statusFor(result),
    domain: domains[code],
    ...(note && !note.includes("系統畫面標示") ? { note: { zh: note, en: noteTranslations[note] ?? note } } : {}),
    ...(relatedRoutes[code] ? { relatedRoute: relatedRoutes[code] } : {}),
  };
  if (current === "exemptions") exemptions.push(record);
  else semesters.at(-1).courses.push(record);
}

const allCourses = semesters.flatMap((semester) => semester.courses);
const graded = allCourses.filter((course) => course.status === "graded");
const passed = allCourses.filter((course) => course.status === "pass");
const withdrawn = allCourses.filter((course) => course.status === "withdrawn");
const sumCredits = (records) => records.reduce((sum, record) => sum + record.credits, 0);
const counts = {
  totalStatusRecords: allCourses.length + exemptions.length,
  enrolledRecords: allCourses.length,
  gradedRecords: graded.length,
  gradedCredits: sumCredits(graded),
  passRecords: passed.length,
  passCredits: sumCredits(passed),
  withdrawnRecords: withdrawn.length,
  withdrawnCredits: sumCredits(withdrawn),
  exemptRecords: exemptions.length,
  earnedCredits: sumCredits(graded) + sumCredits(passed),
  aPlusRecords: graded.filter((course) => course.result.zh === "A+").length,
  aPlusCredits: sumCredits(graded.filter((course) => course.result.zh === "A+")),
};

const expected = { totalStatusRecords: 78, enrolledRecords: 76, gradedRecords: 67, gradedCredits: 156, passRecords: 5, passCredits: 7, withdrawnRecords: 4, withdrawnCredits: 12, exemptRecords: 2, earnedCredits: 163, aPlusRecords: 46, aPlusCredits: 110 };
for (const [key, value] of Object.entries(expected)) {
  if (counts[key] !== value) throw new Error(`${key}: expected ${value}, received ${counts[key]}`);
}

const output = {
  updatedThrough: { en: "Through Spring 2026", zh: "截至 2026 年春季" },
  titleTranslationStatus: {
    en: "English course titles are descriptive translations for readability; Chinese titles follow the source academic record.",
    zh: "英文課名為便於閱讀的描述性翻譯；中文課名依學業紀錄呈現。",
  },
  counts,
  domains: {
    mathematics: { en: "Mathematics & analytical foundations", zh: "數學與解析基礎" },
    mechanics: { en: "Mechanics & dynamics", zh: "力學與動力學" },
    computation: { en: "Computation, control & electronics", zh: "計算、控制與電子" },
    thermal: { en: "Thermal-fluid sciences & energy", zh: "熱流、能源與傳輸" },
    design: { en: "Design, manufacturing & experiments", zh: "設計、製造與實驗" },
    civil: { en: "Civil engineering foundations", zh: "土木工程基礎" },
    science: { en: "Physical & chemical sciences", zh: "物理與化學基礎" },
    research: { en: "Research training", zh: "研究訓練" },
    humanities: { en: "Languages, humanities & social inquiry", zh: "語言、人文與社會思辨" },
    team: { en: "Team practice & physical education", zh: "團隊實踐與體育" },
    service: { en: "Service & academic orientation", zh: "服務與學習導入" },
  },
  capabilityHighlights: [
    { id: "mathematics", value: "4.30 / 4.30", records: 9, credits: 20, title: { en: "Calculus & engineering mathematics", zh: "微積分與工程數學" }, detail: { en: "Every graded record at A+", zh: "所有計分修課全數 A+" } },
    { id: "mechanics", value: "4.30 / 4.30", records: 7, credits: 18, title: { en: "Core mechanics & dynamics", zh: "核心力學與動力學" }, detail: { en: "Every graded record at A+", zh: "所有計分修課全數 A+" } },
    { id: "computation", value: "4.30 / 4.30", records: 4, credits: 12, title: { en: "Programming, linear algebra & numerical methods", zh: "程式、線性代數與數值方法" }, detail: { en: "Every graded record at A+", zh: "所有計分修課全數 A+" } },
    { id: "control", value: "4.22 / 4.30", records: 4, credits: 12, title: { en: "Controls & mechatronics", zh: "控制與機電整合" }, detail: { en: "Automatic, vehicle, and digital control with applied electronics", zh: "涵蓋自動、車輛、數位控制與應用電子" } },
    { id: "design", value: "4.17 / 4.30", records: 11, credits: 24, title: { en: "Design, manufacturing & laboratory work", zh: "設計、製造與實驗" }, detail: { en: "From CAD and fabrication to measurement and test", zh: "從 CAD、製造到量測與實驗" } },
    { id: "thermal", value: "4.03 / 4.30", records: 6, credits: 18, title: { en: "Thermal-fluids & energy", zh: "熱流與能源" }, detail: { en: "Fluids, thermodynamics, heat transfer, and energy", zh: "涵蓋流體、熱力、熱傳與能源" } },
  ],
  semesters,
  exemptions,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, counts }, null, 2));
