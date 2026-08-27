/* eslint-disable @next/next/no-img-element -- authenticated QR image is served by a protected same-origin endpoint */
"use client";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Check,
  Clock3,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Globe2,
  Languages,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import TrustedAccess from "./TrustedAccess";

type Locale = "en" | "zh";
type Placement = "contact" | "footer" | "trusted";
type AccessState = "checking" | "locked" | "unlocked" | "error";

type ContactProfile = {
  name: string;
  nameZh: string;
  role: string;
  roleZh: string;
  organization: string;
  organizationZh: string;
  introduction: string;
  introductionZh: string;
  phone: { display: string; href: string };
  email: string;
  location: string;
  timezone: string;
  languages: Array<{ en: string; zh: string }>;
  networks: Array<{
    id: "github" | "facebook" | "instagram" | "linkedin" | "website";
    label: string;
    url: string;
  }>;
};

type Props = {
  locale: Locale;
  placement?: Placement;
  publicEmail: string;
  redirectTo: string;
  inlineLogin?: boolean;
  loginHref?: string;
};

const COPY = {
  en: {
    eyebrow: "Professional contact card",
    lockedTitle: "A verified profile is available to invited visitors.",
    lockedDescription:
      "Email remains public. Sign in to view the phone number, professional networks, contact QR code, and downloadable vCard.",
    unlock: "Sign in to view the full card",
    hideLogin: "Close sign-in",
    publicEmail: "Public email",
    protectedDetails: "Protected contact details",
    phone: "Phone",
    networks: "Professional networks",
    portable: "QR code & vCard",
    checking: "Checking access…",
    unavailable: "The contact card could not be loaded.",
    retry: "Try again",
    unlocked: "Verified access",
    session: "Protected for this 8-hour session",
    contact: "Direct contact",
    location: "Location",
    timezone: "Time zone",
    languages: "Languages",
    profiles: "Profiles & links",
    call: "Call",
    email: "Email",
    download: "Download vCard",
    qrTitle: "Scan to save contact",
    qrDescription: "The QR code contains the core contact details; the vCard also includes professional profiles.",
    copyPhone: "Copy phone number",
    copied: "Copied",
    openProfile: "Open profile",
  },
  zh: {
    eyebrow: "專業電子名片",
    lockedTitle: "完整聯絡資料僅供受邀訪客查閱。",
    lockedDescription:
      "Email 維持公開；登入後可查看電話、專業社群、聯絡資訊 QR Code，並下載 vCard。",
    unlock: "登入查看完整名片",
    hideLogin: "關閉登入區",
    publicEmail: "公開 Email",
    protectedDetails: "受保護的聯絡資料",
    phone: "電話",
    networks: "專業社群",
    portable: "QR Code 與 vCard",
    checking: "正在確認存取權限……",
    unavailable: "目前無法載入電子名片。",
    retry: "再試一次",
    unlocked: "存取權限已驗證",
    session: "本次 8 小時工作階段內可查閱",
    contact: "直接聯絡",
    location: "所在地",
    timezone: "時區",
    languages: "語言",
    profiles: "社群與網站",
    call: "撥打電話",
    email: "寄送 Email",
    download: "下載 vCard",
    qrTitle: "掃描並儲存聯絡資訊",
    qrDescription: "QR Code 收錄主要聯絡方式；下載 vCard 可一併儲存專業社群。",
    copyPhone: "複製電話號碼",
    copied: "已複製",
    openProfile: "開啟頁面",
  },
} as const;

const NETWORK_ICONS = {
  github: Code2,
  facebook: Users,
  instagram: Camera,
  linkedin: BriefcaseBusiness,
  website: Globe2,
} as const;

export function ElectronicContactCard({
  locale,
  placement = "contact",
  publicEmail,
  redirectTo,
  inlineLogin = true,
  loginHref,
}: Props) {
  const copy = COPY[locale];
  const cardRef = useRef<HTMLElement>(null);
  const lastVerifiedAtRef = useRef(0);
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [profile, setProfile] = useState<ContactProfile | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/trusted/contact-card", {
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          setProfile(null);
          setExpiresAt(null);
          setAccessState("locked");
          return;
        }
        if (!response.ok) throw new Error("Contact card unavailable");
        const body = (await response.json()) as {
          authorized?: boolean;
          expiresAt?: number;
          profile?: ContactProfile;
        };
        if (!body.authorized || !body.profile || typeof body.expiresAt !== "number" || !Number.isFinite(body.expiresAt) || body.expiresAt <= Date.now()) {
          throw new Error("Invalid response");
        }
        lastVerifiedAtRef.current = Date.now();
        setProfile(body.profile);
        setExpiresAt(body.expiresAt);
        setAccessState("unlocked");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setProfile(null);
        setExpiresAt(null);
        setAccessState("error");
      });

    return () => controller.abort();
  }, [requestVersion]);

  useEffect(() => {
    if (accessState !== "unlocked" || !expiresAt) return;

    const lockImmediately = () => {
      setProfile(null);
      setExpiresAt(null);
      setAccessState("locked");
    };
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      lockImmediately();
      return;
    }

    const timer = window.setTimeout(lockImmediately, remaining);
    const recheck = () => {
      if (Date.now() >= expiresAt) {
        lockImmediately();
      } else if (Date.now() - lastVerifiedAtRef.current > 30_000) {
        setRequestVersion((value) => value + 1);
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") recheck();
    };

    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [accessState, expiresAt]);

  function moveCard(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const element = cardRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    element.style.setProperty("--contact-pointer-x", `${x * 100}%`);
    element.style.setProperty("--contact-pointer-y", `${y * 100}%`);
    element.style.setProperty("--contact-rotate-x", `${(0.5 - y) * 2.2}deg`);
    element.style.setProperty("--contact-rotate-y", `${(x - 0.5) * 2.8}deg`);
  }

  function resetCard() {
    const element = cardRef.current;
    if (!element) return;
    element.style.setProperty("--contact-pointer-x", "82%");
    element.style.setProperty("--contact-pointer-y", "12%");
    element.style.setProperty("--contact-rotate-x", "0deg");
    element.style.setProperty("--contact-rotate-y", "0deg");
  }

  function retryContactCard() {
    setAccessState("checking");
    setRequestVersion((value) => value + 1);
  }

  async function copyPhone() {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.phone.display);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_800);
    } catch {
      const input = document.createElement("textarea");
      input.value = profile.phone.display;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const succeeded = document.execCommand("copy");
      input.remove();
      if (succeeded) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1_800);
      }
    }
  }

  const sharedProps = {
    ref: cardRef,
    onPointerMove: moveCard,
    onPointerLeave: resetCard,
    className: `contact-pass contact-pass--${placement} contact-pass--${accessState}`,
    style: {
      "--contact-pointer-x": "82%",
      "--contact-pointer-y": "12%",
      "--contact-rotate-x": "0deg",
      "--contact-rotate-y": "0deg",
    } as CSSProperties,
  };

  if (accessState === "checking") {
    return (
      <article {...sharedProps} aria-busy="true" aria-live="polite">
        <ContactPassEffects />
        <div className="contact-pass__checking">
          <span className="contact-pass__monogram" aria-hidden="true">JL</span>
          <LoaderCircle className="contact-pass__loader" size={22} aria-hidden="true" />
          <span>{copy.checking}</span>
        </div>
      </article>
    );
  }

  if (accessState === "error") {
    return (
      <article {...sharedProps} aria-live="polite">
        <ContactPassEffects />
        <div className="contact-pass__error">
          <span className="contact-pass__monogram" aria-hidden="true">JL</span>
          <strong>{copy.unavailable}</strong>
          <button type="button" className="button button--small button--quiet" onClick={retryContactCard}>
            {copy.retry}<ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </article>
    );
  }

  if (accessState === "locked" || !profile) {
    return (
      <article {...sharedProps} aria-labelledby={`contact-card-title-${placement}`}>
        <ContactPassEffects />
        <div className="contact-pass__locked-head">
          <span className="contact-pass__monogram" aria-hidden="true">JL</span>
          <span className="contact-pass__security"><ShieldCheck size={14} />{copy.protectedDetails}</span>
        </div>
        <div className="contact-pass__locked-copy">
          <p className="eyebrow"><Sparkles size={13} />{copy.eyebrow}</p>
          <h2 id={`contact-card-title-${placement}`}>{copy.lockedTitle}</h2>
          <p>{copy.lockedDescription}</p>
        </div>
        <div className="contact-pass__locked-grid" aria-label={copy.protectedDetails}>
          <a className="contact-pass__public-email" href={`mailto:${publicEmail}`}>
            <Mail size={17} aria-hidden="true" />
            <span><small>{copy.publicEmail}</small><strong>{publicEmail}</strong></span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <LockedField icon={<Phone size={17} />} label={copy.phone} />
          <LockedField icon={<Globe2 size={17} />} label={copy.networks} />
          <LockedField icon={<QrCode size={17} />} label={copy.portable} />
        </div>
        <div className="contact-pass__unlock">
          {inlineLogin ? (
            <button
              className="button contact-pass__unlock-button"
              type="button"
              aria-expanded={loginOpen}
              aria-controls={`contact-card-login-${placement}`}
              onClick={() => setLoginOpen((current) => !current)}
            >
              <LockKeyhole size={17} aria-hidden="true" />
              {loginOpen ? copy.hideLogin : copy.unlock}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <a className="button contact-pass__unlock-button" href={loginHref}>
              <LockKeyhole size={17} aria-hidden="true" />
              {copy.unlock}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>
        {inlineLogin && loginOpen ? (
          <div id={`contact-card-login-${placement}`} className="contact-pass__login">
            <TrustedAccess
              locale={locale === "en" ? "en" : "zh-TW"}
              redirectTo={redirectTo}
              className="trusted-login-panel--embedded"
            />
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article {...sharedProps} aria-labelledby={`contact-card-title-${placement}`}>
      <ContactPassEffects />
      <header className="contact-pass__header">
        <span className="contact-pass__monogram" aria-hidden="true">JL</span>
        <div className="contact-pass__identity">
          <p className="eyebrow"><Sparkles size={13} />{copy.eyebrow}</p>
          <h2 id={`contact-card-title-${placement}`}>{profile.name}</h2>
          <p className="contact-pass__name-zh">{profile.nameZh}</p>
        </div>
        <div className="contact-pass__verified">
          <span><BadgeCheck size={15} />{copy.unlocked}</span>
          <small><Clock3 size={13} />{copy.session}</small>
        </div>
      </header>

      <div className="contact-pass__role">
        <strong>{locale === "en" ? profile.role : profile.roleZh}</strong>
        <span>{locale === "en" ? profile.organization : profile.organizationZh}</span>
        <p>{locale === "en" ? profile.introduction : profile.introductionZh}</p>
      </div>

      <div className="contact-pass__body">
        <div className="contact-pass__details">
          <p className="contact-pass__section-label">{copy.contact}</p>
          <div className="contact-pass__contact-grid">
            <a href={profile.phone.href}>
              <Phone size={17} aria-hidden="true" />
              <span><small>{copy.phone}</small><strong>{profile.phone.display}</strong></span>
            </a>
            <button type="button" onClick={copyPhone} aria-label={copy.copyPhone}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? copy.copied : copy.copyPhone}</span>
            </button>
            <a href={`mailto:${profile.email}`}>
              <Mail size={17} aria-hidden="true" />
              <span><small>{copy.email}</small><strong>{profile.email}</strong></span>
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>

          <p className="contact-pass__section-label">{copy.profiles}</p>
          <nav className="contact-pass__networks" aria-label={copy.profiles}>
            {profile.networks.map((network) => {
              const Icon = NETWORK_ICONS[network.id];
              return (
                <a href={network.url} target="_blank" rel="noreferrer" key={network.id} aria-label={`${network.label} — ${copy.openProfile}`}>
                  <Icon size={17} aria-hidden="true" />
                  <span>{network.label}</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              );
            })}
          </nav>

          <dl className="contact-pass__facts">
            <div><dt><MapPin size={14} />{copy.location}</dt><dd>{profile.location}</dd></div>
            <div><dt><Clock3 size={14} />{copy.timezone}</dt><dd>{profile.timezone}</dd></div>
            <div><dt><Languages size={14} />{copy.languages}</dt><dd>{profile.languages.map((language) => language[locale]).join(" · ")}</dd></div>
          </dl>
        </div>

        <aside className="contact-pass__qr" aria-label={copy.qrTitle}>
          <div className="contact-pass__qr-frame">
            <span className="contact-pass__qr-corner contact-pass__qr-corner--one" aria-hidden="true" />
            <span className="contact-pass__qr-corner contact-pass__qr-corner--two" aria-hidden="true" />
            <img
              src="/api/trusted/contact-card/qr"
              width="360"
              height="360"
              alt={copy.qrTitle}
              loading="lazy"
              decoding="async"
            />
          </div>
          <strong><QrCode size={16} />{copy.qrTitle}</strong>
          <p>{copy.qrDescription}</p>
        </aside>
      </div>

      <footer className="contact-pass__actions">
        <a className="button" href={profile.phone.href}><Phone size={16} />{copy.call}</a>
        <a className="button button--quiet" href={`mailto:${profile.email}`}><Mail size={16} />{copy.email}</a>
        <a className="button button--quiet" href="/api/trusted/contact-card/vcard" download><Download size={16} />{copy.download}</a>
      </footer>
    </article>
  );
}

function LockedField({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="contact-pass__locked-field">
      {icon}
      <span><small>{label}</small><strong aria-hidden="true">••••••••••••</strong></span>
      <LockKeyhole size={14} aria-hidden="true" />
    </div>
  );
}

function ContactPassEffects() {
  return (
    <div className="contact-pass__effects" aria-hidden="true">
      <span className="contact-pass__aura" />
      <span className="contact-pass__orbit contact-pass__orbit--one" />
      <span className="contact-pass__orbit contact-pass__orbit--two" />
      <span className="contact-pass__scan" />
      <span className="contact-pass__noise" />
    </div>
  );
}
