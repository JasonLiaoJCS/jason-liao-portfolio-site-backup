type ContactLanguage = {
  en: string;
  zh: string;
};

type ContactNetwork = {
  id: "github" | "facebook" | "instagram" | "linkedin" | "website";
  label: string;
  url: string;
};

export type PrivateContactProfile = {
  name: string;
  nameZh: string;
  role: string;
  roleZh: string;
  organization: string;
  organizationZh: string;
  introduction: string;
  introductionZh: string;
  phone: {
    display: string;
    href: string;
  };
  email: string;
  location: string;
  timezone: string;
  languages: ContactLanguage[];
  networks: ContactNetwork[];
};

// This module is intentionally imported only by authenticated server routes.
// Do not import it into client components, page props, search data, metadata,
// or structured data.
export const privateContactProfile: PrivateContactProfile = {
  name: "Chih-Hsiang (Jason) Liao",
  nameZh: "廖致翔",
  role: "Undergraduate Researcher & Mechanical Engineering Student",
  roleZh: "國立臺灣大學機械工程學系學生暨大學部研究者",
  organization: "National Taiwan University",
  organizationZh: "國立臺灣大學",
  introduction:
    "NTU Mechanical Engineering student and undergraduate researcher working on robotics, control, reinforcement learning, and mechatronic systems.",
  introductionZh:
    "國立臺灣大學機械工程學系學生，目前從事機器人、控制、強化學習與機電整合系統研究。",
  phone: {
    display: "+886 903 202 825",
    href: "tel:+886903202825",
  },
  email: "jasonliaohyh9815@gmail.com",
  location: "Taipei, Taiwan",
  timezone: "Asia/Taipei (UTC+8)",
  languages: [
    { en: "Traditional Chinese (Native)", zh: "繁體中文（母語）" },
    { en: "English (Fluent)", zh: "英文（流利）" },
    { en: "Japanese (Basic)", zh: "日文（基礎）" },
  ],
  networks: [
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/JasonLiaoJCS",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/chih-hsiang-jason-liao",
    },
    {
      id: "instagram",
      label: "Instagram",
      url: "https://www.instagram.com/jason.liao_ck326/",
    },
    {
      id: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com/share/18Jxkq87b4/?mibextid=wwXIfr",
    },
    {
      id: "website",
      label: "Personal website",
      url: "https://jasonliao-pages.pages.dev",
    },
  ],
};

export function buildPrivateContactVCard(
  profile = privateContactProfile,
): string {
  const rows = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard("Liao")};${escapeVCard("Chih-Hsiang (Jason)")};;;`,
    `FN:${escapeVCard(profile.name)}`,
    `X-ALT-FN:${escapeVCard(profile.nameZh)}`,
    `ORG:${escapeVCard(profile.organization)}`,
    `TITLE:${escapeVCard(profile.role)}`,
    `TEL;TYPE=CELL,VOICE:${profile.phone.href.replace(/^tel:/u, "")}`,
    `EMAIL;TYPE=INTERNET,WORK:${escapeVCard(profile.email)}`,
    `ADR;TYPE=WORK:;;;${escapeVCard("Taipei")};;;${escapeVCard("Taiwan")}`,
    `URL;TYPE=WORK:${profile.networks.find((network) => network.id === "website")?.url ?? ""}`,
    ...profile.networks
      .filter((network) => network.id !== "website")
      .map(
        (network) =>
          `X-SOCIALPROFILE;TYPE=${network.id}:${escapeVCard(network.url)}`,
      ),
    "LANG;TYPE=PREF:zh-Hant",
    "LANG:en",
    "LANG:ja",
    `NOTE:${escapeVCard(profile.introduction)}`,
    "REV:20260825T000000Z",
    "END:VCARD",
  ];

  return serializeVCard(rows);
}

export function buildPrivateContactQrVCard(
  profile = privateContactProfile,
): string {
  const website = profile.networks.find((network) => network.id === "website")?.url;
  const rows = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard("Liao")};${escapeVCard("Chih-Hsiang (Jason)")};;;`,
    `FN:${escapeVCard(profile.name)}`,
    `ORG:${escapeVCard(profile.organization)}`,
    `TITLE:${escapeVCard(profile.role)}`,
    `TEL;TYPE=CELL,VOICE:${profile.phone.href.replace(/^tel:/u, "")}`,
    `EMAIL;TYPE=INTERNET,WORK:${escapeVCard(profile.email)}`,
    ...(website ? [`URL;TYPE=WORK:${website}`] : []),
    "END:VCARD",
  ];

  return serializeVCard(rows);
}

function serializeVCard(rows: string[]): string {
  return `${rows.flatMap(foldVCardLine).join("\r\n")}\r\n`;
}

function foldVCardLine(line: string): string[] {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let current = "";

  for (const character of line) {
    const continuationPrefix = lines.length > 0 ? " " : "";
    const candidate = `${continuationPrefix}${current}${character}`;
    if (current && encoder.encode(candidate).byteLength > 75) {
      lines.push(`${continuationPrefix}${current}`);
      current = character;
    } else {
      current += character;
    }
  }

  lines.push(`${lines.length > 0 ? " " : ""}${current}`);
  return lines;
}

function escapeVCard(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}
