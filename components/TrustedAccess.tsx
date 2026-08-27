"use client";

import { ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

type TrustedAccessLocale = "en" | "zh-TW";

type TrustedAccessProps = {
  locale?: TrustedAccessLocale;
  redirectTo?: string;
  className?: string;
};

type TrustedLogoutButtonProps = {
  locale?: TrustedAccessLocale;
  redirectTo?: string;
  className?: string;
};

const COPY = {
  en: {
    eyebrow: "Invitation-only access",
    title: "Access invitation-only materials",
    description:
      "Enter the password provided with your invitation. Public research, projects, and reports remain available without signing in.",
    password: "Access password",
    reveal: "Show password",
    conceal: "Hide password",
    submit: "Continue",
    submitting: "Checking…",
    invalid: "That password was not accepted.",
    limited: "Too many attempts. Please wait before trying again.",
    unavailable: "Invitation-only access is temporarily unavailable.",
    logout: "Sign out",
    loggingOut: "Signing out…",
    logoutError: "Could not end this session. Please try again.",
    privacy:
      "The password is checked securely and is not stored in this browser.",
  },
  "zh-TW": {
    eyebrow: "受邀資料",
    title: "查看受邀資料",
    description:
      "請輸入受邀密碼，查閱依研究、升學或合作需求整理的補充資料。公開研究與完整報告可直接閱讀，無須登入。",
    password: "存取密碼",
    reveal: "顯示密碼",
    conceal: "隱藏密碼",
    submit: "繼續",
    submitting: "驗證中…",
    invalid: "密碼不正確，請重新輸入。",
    limited: "嘗試次數過多，請稍後再試。",
    unavailable: "受邀資料暫時無法使用。",
    logout: "結束瀏覽",
    loggingOut: "登出中…",
    logoutError: "目前無法登出，請再試一次。",
    privacy: "密碼只會在伺服器端驗證，不會儲存在瀏覽器中。",
  },
} as const;

export default function TrustedAccess({
  locale = "en",
  redirectTo = "/trusted",
  className,
}: TrustedAccessProps) {
  const copy = COPY[locale];
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/trusted/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        navigateAfterTrustedLogin(safeRedirect(redirectTo, "/trusted"));
        return;
      }

      setPassword("");
      setStatus("error");
      setErrorMessage(
        response.status === 429
          ? copy.limited
          : response.status === 503
            ? copy.unavailable
            : copy.invalid,
      );
      window.requestAnimationFrame(() => passwordRef.current?.focus());
    } catch {
      setStatus("error");
      setErrorMessage(copy.unavailable);
      window.requestAnimationFrame(() => passwordRef.current?.focus());
    }
  }

  return (
    <section
      className={["trusted-login-panel", className].filter(Boolean).join(" ")}
      data-trusted-access="login"
    >
      <div className="trusted-login-panel__header">
        <span className="trusted-login-panel__icon" aria-hidden="true">
          <KeyRound size={20} />
        </span>
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
      </div>
      <p className="trusted-login-panel__description">{copy.description}</p>

      <form
        className="trusted-login-form"
        onSubmit={handleSubmit}
        method="post"
        action="/api/trusted/login"
        noValidate
        aria-busy={status === "submitting"}
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label htmlFor="trusted-access-password">{copy.password}</label>
        <div className="trusted-login-form__field">
          <input
            ref={passwordRef}
            id="trusted-access-password"
            name="password"
            type={revealed ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (status === "error") {
                setStatus("idle");
                setErrorMessage("");
              }
            }}
            disabled={status === "submitting"}
            required
            aria-invalid={status === "error"}
            aria-describedby="trusted-access-help trusted-access-status"
          />
          <button
            className="trusted-login-form__reveal"
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? copy.conceal : copy.reveal}
            aria-pressed={revealed}
            disabled={status === "submitting"}
          >
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p id="trusted-access-help" className="trusted-login-form__help">
          {copy.privacy}
        </p>
        <button
          className="button trusted-login-form__submit"
          type="submit"
          disabled={status === "submitting" || !password}
        >
          {status === "submitting" ? (
            <LoaderCircle className="trusted-login-form__spinner" size={18} />
          ) : (
            <KeyRound size={17} />
          )}
          <span>{status === "submitting" ? copy.submitting : copy.submit}</span>
          {status !== "submitting" ? <ArrowRight size={17} /> : null}
        </button>
        <p
          id="trusted-access-status"
          className="trusted-login-form__status"
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage || "\u00a0"}
        </p>
      </form>
    </section>
  );
}

export function TrustedLogoutButton({
  locale = "en",
  redirectTo = "/",
  className,
}: TrustedLogoutButtonProps) {
  const copy = COPY[locale];
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogout() {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/trusted/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Logout failed");
      window.location.replace(safeRedirect(redirectTo, "/"));
    } catch {
      setSubmitting(false);
      setErrorMessage(copy.logoutError);
    }
  }

  return (
    <span className="trusted-logout-control">
      <button
        type="button"
        className={className}
        onClick={handleLogout}
        disabled={submitting}
        data-trusted-access="logout"
      >
        {submitting ? copy.loggingOut : copy.logout}
      </button>
      <span className="trusted-logout-control__status" role="alert" aria-live="polite">
        {errorMessage}
      </span>
    </span>
  );
}

function safeRedirect(value: string, fallback: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

function navigateAfterTrustedLogin(target: string): void {
  const destination = new URL(target, window.location.origin);
  const sameDocument =
    destination.pathname === window.location.pathname &&
    destination.search === window.location.search;

  if (sameDocument) {
    window.history.replaceState(
      null,
      "",
      `${destination.pathname}${destination.search}${destination.hash}`,
    );
    window.location.reload();
    return;
  }

  window.location.assign(
    `${destination.pathname}${destination.search}${destination.hash}`,
  );
}
