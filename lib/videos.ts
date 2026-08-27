import type { Locale } from "./site-config";

export type VideoRecord = {
  id: string;
  route: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  duration: string;
  uploadDate: string;
  poster: VideoPosterSet;
  playlist: "Research & Robotics" | "Engineering Projects" | "Academic Coursework";
  placementSectionId?: string;
  presentation?: "behind-the-build";
};

export type VideoPosterSet = {
  avif: string;
  webp: string;
  fallback: string;
};

function localPoster(id: string): VideoPosterSet {
  const root = `/assets/video-posters/${id}`;
  return {
    avif: `${root}.avif`,
    webp: `${root}.webp`,
    fallback: `${root}.jpg`,
  };
}

export const videos: VideoRecord[] = [
  {
    id: "h6WQbz4WJV8",
    route: "/research/redrhex",
    title: { en: "RedRHex hardware system test", zh: "RedRHex 實機系統測試" },
    summary: {
      en: "A controlled hardware bring-up used to validate the deployment chain, safety states, actuation, and observation interfaces before broader locomotion tests.",
      zh: "以受控實機測試驗證部署鏈、安全狀態、致動與觀測介面，作為完整步態測試前的系統驗收。",
    },
    duration: "0:44",
    uploadDate: "2026-08-10T14:46:10-07:00",
    poster: localPoster("h6WQbz4WJV8"),
    playlist: "Research & Robotics",
  },
  {
    id: "2qIh_a8zVKs",
    route: "/projects/jarvis",
    title: { en: "Jarvis multimodal home hub demo", zh: "Jarvis 多模態家庭中樞展示" },
    summary: {
      en: "A complete demonstration of the 36-hour hackathon prototype, spanning voice interaction, edge intelligence, embedded HMI, BLE control, and the remote dashboard.",
      zh: "完整呈現 36 小時創客松原型的語音互動、邊緣智慧、嵌入式介面、BLE 控制與遠端儀表板。",
    },
    duration: "0:54",
    uploadDate: "2026-08-10T14:48:26-07:00",
    poster: localPoster("2qIh_a8zVKs"),
    playlist: "Engineering Projects",
  },
  {
    id: "WKsGbI2Ig1k",
    route: "/projects/jarvis",
    title: {
      en: "Behind the Build: Jarvis at MakeNTU 2026",
      zh: "MakeNTU 2026 參賽全紀錄｜36 小時打造 Jarvis",
    },
    summary: {
      en: "A behind-the-scenes record of the team’s 36-hour MakeNTU sprint—from overnight integration and live debugging to the final presentation and first-place result in NXP × Avnet’s Smart Living challenge. It complements the concise system demo with the pace, collaboration, and tradeoffs behind Jarvis.",
      zh: "這支幕後影片記錄團隊在 36 小時 MakeNTU 製作期間的深夜整合、現場除錯、最終展示，以及獲得 NXP × Avnet「智慧生活應用」企業命題第一名的過程；除功能展示外，也呈現團隊協作與關鍵工程取捨。",
    },
    duration: "9:27",
    uploadDate: "2026-08-20T10:39:22-07:00",
    poster: localPoster("WKsGbI2Ig1k"),
    playlist: "Engineering Projects",
    placementSectionId: "next",
    presentation: "behind-the-build",
  },
  {
    id: "tpKyjZnfR6A",
    route: "/projects/aero-carrier",
    title: { en: "Aero Carrier Full Mission Demonstration", zh: "Aero Carrier 完整任務展示" },
    summary: {
      en: "The six-person team’s final demonstration combines flight and ground operations: takeoff, ground-carrier deployment, ball pickup, recovery, and delivery.",
      zh: "六人團隊最終任務展示，涵蓋起飛、地面子車部署、取球、回收，以及最後的搬運任務。",
    },
    duration: "6:33",
    uploadDate: "2026-08-10T14:49:10-07:00",
    poster: localPoster("tpKyjZnfR6A"),
    playlist: "Engineering Projects",
  },
  {
    id: "M1HPnoYRjnM",
    route: "/projects/lkas",
    title: { en: "LKAS On-Vehicle Test", zh: "LKAS 車道置中實車測試" },
    summary: {
      en: "A physical test of the lane-detection and PI–SMC control pipeline on a Raspberry Pi 5 platform.",
      zh: "在 Raspberry Pi 5 平台上展示車道辨識與 PI–SMC 控制流程的實車運作。",
    },
    duration: "0:15",
    uploadDate: "2026-08-10T14:49:41-07:00",
    poster: localPoster("M1HPnoYRjnM"),
    playlist: "Engineering Projects",
  },
  {
    id: "6DgCNHo08dg",
    route: "/projects/inventor-system-integration",
    title: { en: "Inventor ball-transport system animation", zh: "Inventor 小球循環機構動畫" },
    summary: {
      en: "The completed 54.7-second system animation demonstrates the integrated motion sequence across four independently designed modules.",
      zh: "54.7 秒完整系統動畫，展示四個獨立設計模組整合後的連續運作流程。",
    },
    duration: "0:55",
    uploadDate: "2026-08-10T14:50:22-07:00",
    poster: localPoster("6DgCNHo08dg"),
    playlist: "Engineering Projects",
  },
  {
    id: "ZprCYWhjIhg",
    route: "/projects/polar-arm",
    title: { en: "Polar-coordinate mechanical arm demonstration", zh: "極座標純機械吊臂展示" },
    summary: {
      en: "A complete demonstration of a purely mechanical ball-transfer system built with gears, laser-cut parts, and 3D-printed components.",
      zh: "完整展示以齒輪、雷切零件與 3D 列印元件構成的純機械運球系統。",
    },
    duration: "3:01",
    uploadDate: "2026-08-10T14:50:49-07:00",
    poster: localPoster("ZprCYWhjIhg"),
    playlist: "Engineering Projects",
  },
  {
    id: "1l3sZUWCc00",
    route: "/research/redrhex",
    title: { en: "RedRHex physical gait test", zh: "RedRHex 實機步態測試" },
    summary: {
      en: "A close view of controlled low-speed gait testing during sim-to-real hardware validation.",
      zh: "以近距離畫面記錄 Sim-to-Real 階段的受控低速實機步態測試。",
    },
    duration: "0:21",
    uploadDate: "2026-08-10T14:51:20-07:00",
    poster: localPoster("1l3sZUWCc00"),
    playlist: "Research & Robotics",
  },
  {
    id: "Xak2rPi5mQc",
    route: "/research/redrhex",
    title: { en: "Parallel reinforcement-learning training", zh: "RedRHex 平行強化學習訓練" },
    summary: {
      en: "Parallel Isaac Lab environments used to iterate on gait learning, reward design, and failure diagnosis.",
      zh: "使用 Isaac Lab 平行環境進行步態學習、獎勵設計與失敗診斷。",
    },
    duration: "0:11",
    uploadDate: "2026-08-10T14:51:50-07:00",
    poster: localPoster("Xak2rPi5mQc"),
    playlist: "Research & Robotics",
  },
  {
    id: "7jjnRDpHP1c",
    route: "/research/redrhex",
    title: { en: "Single-robot gait simulation", zh: "RedRHex 單機步態模擬" },
    summary: {
      en: "A single-environment simulation used to check whether a high-reward policy produces physically meaningful locomotion.",
      zh: "在單一模擬環境中仔細檢查高回饋策略是否真正產生物理上合理的移動。",
    },
    duration: "0:11",
    uploadDate: "2026-08-10T14:52:13-07:00",
    poster: localPoster("7jjnRDpHP1c"),
    playlist: "Research & Robotics",
  },
  {
    id: "WLJ4pJo7x1w",
    route: "/academics/coursework/computer-programming-in-python",
    title: { en: "Library Escape: Python Game Demo", zh: "圖書館逃脫：Python 遊戲展示" },
    summary: {
      en: "A playable coursework prototype combining Python programming, game-state logic, and iterative team development.",
      zh: "結合 Python 程式設計、遊戲狀態邏輯與團隊迭代開發的可實際操作課程作品。",
    },
    duration: "1:09",
    uploadDate: "2026-08-10T14:52:50-07:00",
    poster: localPoster("WLJ4pJo7x1w"),
    playlist: "Academic Coursework",
  },
  {
    id: "ydZzO5OWg7A",
    route: "/academics/coursework/physical-model-design-laboratory",
    title: { en: "Interactive structural model", zh: "土木實作互動結構展示" },
    summary: {
      en: "A physical-model demonstration showing how structural calculations, fabrication choices, and observed behavior relate to one another.",
      zh: "透過實體模型，呈現結構計算、製作過程與實際受力行為之間的關係。",
    },
    duration: "0:56",
    uploadDate: "2026-08-10T14:53:25-07:00",
    poster: localPoster("ydZzO5OWg7A"),
    playlist: "Academic Coursework",
  },
];

export function videosForRoute(route: string): VideoRecord[] {
  return videos.filter((video) => video.route === route);
}
