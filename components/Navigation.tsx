"use client";

import { Compass, Download, Menu, Search, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import type { Locale } from "@/lib/site-config";
import { localizePath, siteConfig, unlocalizePath } from "@/lib/site-config";
import { BrandLogo } from "./BrandLogo";
import { SkipLink } from "./SkipLink";

const navItems = [
  ["Research", "研究", "/research"],
  ["Projects", "專案", "/projects"],
  ["Academics", "學術", "/academics"],
  ["Leadership", "領導與服務", "/leadership"],
  ["Writing", "寫作", "/writing"],
  ["About", "關於我", "/about"],
] as const;

const mobileExtraItems = [
  ["Portfolio index", "完整索引", "/archive"],
  ["Contact", "聯絡我", "/contact"],
] as const;

export const OPEN_EXPLORER_EVENT = "jason:open-explorer";
export const SURPRISE_ME_EVENT = "jason:surprise-me";

export type ExplorerFocusOrigin = "keyboard" | "pointer";
export type ExplorerOpenDetail = { focusOrigin: ExplorerFocusOrigin };

const focusOriginFromClick = (event: ReactMouseEvent<HTMLElement>): ExplorerFocusOrigin =>
  event.detail === 0 ? "keyboard" : "pointer";

type Props = { locale: Locale; path: string; onSearch?: () => void };

export function Navigation({ locale, path, onSearch }: Props) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const menuFocusOriginRef = useRef<ExplorerFocusOrigin>("pointer");
  const canonicalPath = unlocalizePath(path);
  const otherLocale: Locale = locale === "en" ? "zh" : "en";
  const languageHref = localizePath(canonicalPath, otherLocale);

  const switchLanguage = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.location.assign(`${languageHref}${window.location.search}${window.location.hash}`);
  };

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus({ preventScroll: true }));
    }
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeMenu(true);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [closeMenu, open]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1301px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu(false);
    };
    const resetTransientMenu = () => closeMenu(false);

    desktopQuery.addEventListener("change", closeAtDesktop);
    window.addEventListener("pagehide", resetTransientMenu);
    window.addEventListener("pageshow", resetTransientMenu);
    return () => {
      desktopQuery.removeEventListener("change", closeAtDesktop);
      window.removeEventListener("pagehide", resetTransientMenu);
      window.removeEventListener("pageshow", resetTransientMenu);
    };
  }, [closeMenu]);

  useEffect(() => {
    if (!open) return;

    const mobileNav = mobileNavRef.current;
    const focusFrame = window.requestAnimationFrame(() => {
      if (menuFocusOriginRef.current !== "keyboard") return;
      const firstControl = mobileNav?.querySelector<HTMLElement>('a[href], button:not([disabled])');
      firstControl?.focus({ preventScroll: true });
    });
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (mobileNavRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      if (event.cancelable) event.preventDefault();
      closeMenu(true);
    };
    const closeWhenFocusLeaves = (event: globalThis.FocusEvent) => {
      const nextTarget = event.relatedTarget;
      if (
        nextTarget instanceof Node
        && !mobileNav?.contains(nextTarget)
        && nextTarget !== menuButtonRef.current
      ) {
        closeMenu(false);
      }
    };
    const trapMobileFocus = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const menuButton = menuButtonRef.current;
      const menuItems = Array.from(
        mobileNav?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );
      if (!menuButton || !menuItems.length) return;

      const first = menuButton;
      const last = menuItems[menuItems.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    mobileNav?.addEventListener("focusout", closeWhenFocusLeaves);
    mobileNav?.addEventListener("keydown", trapMobileFocus);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      mobileNav?.removeEventListener("focusout", closeWhenFocusLeaves);
      mobileNav?.removeEventListener("keydown", trapMobileFocus);
    };
  }, [closeMenu, open]);

  const trapMenuButtonFocus = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!open || event.key !== "Tab") return;
    const menuItems = Array.from(
      mobileNavRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
    );
    if (!menuItems.length) return;
    event.preventDefault();
    (event.shiftKey ? menuItems[menuItems.length - 1] : menuItems[0]).focus();
  };

  const openExplorer = (event: ReactMouseEvent<HTMLButtonElement>) => {
    closeMenu(false);
    window.dispatchEvent(new CustomEvent<ExplorerOpenDetail>(OPEN_EXPLORER_EVENT, {
      detail: { focusOrigin: focusOriginFromClick(event) },
    }));
  };

  const surpriseMe = () => {
    closeMenu(false);
    window.dispatchEvent(new CustomEvent(SURPRISE_ME_EVENT));
  };

  return (
    <header className="site-header">
      <SkipLink locale={locale} />
      <div className="site-header__inner">
        <a className="brand" href={localizePath("/", locale)} aria-label={locale === "en" ? "Jason Liao, home" : "廖致翔，首頁"}>
          <span className="brand__mark" aria-hidden="true">
            <BrandLogo className="brand__mark-logo" decorative eager />
          </span>
          <span className="brand__name">{locale === "en" ? siteConfig.name : siteConfig.nameZh}</span>
        </a>
        <nav className="desktop-nav" aria-label={locale === "en" ? "Main navigation" : "主要導覽"}>
          {navItems.map(([en, zh, href]) => (
            <a key={href} aria-current={canonicalPath === href || canonicalPath.startsWith(`${href}/`) ? "page" : undefined} className={canonicalPath === href || canonicalPath.startsWith(`${href}/`) ? "is-active" : ""} href={localizePath(href, locale)}>
              {locale === "en" ? en : zh}
            </a>
          ))}
        </nav>
        <div className="site-header__utilities">
          <button type="button" className="icon-button desktop-only" data-search-trigger onClick={onSearch} aria-label={locale === "en" ? "Search" : "搜尋"}>
            <Search size={17} aria-hidden="true" />
          </button>
          <a className="language-link" href={languageHref} hrefLang={otherLocale === "en" ? "en" : "zh-Hant"} onClick={switchLanguage}>
            {locale === "en" ? "中文" : "EN"}
          </a>
          <a className="cv-link desktop-only" href={siteConfig.cvPath} download>
            <Download size={15} aria-hidden="true" /> CV
          </a>
          <a className="button button--small desktop-only" href={localizePath("/contact", locale)}>
            {locale === "en" ? "Contact" : "聯絡我"}
          </a>
          <button ref={menuButtonRef} type="button" className="menu-button" onClick={(event) => {
            if (open) closeMenu(false);
            else {
              menuFocusOriginRef.current = focusOriginFromClick(event);
              setOpen(true);
            }
          }} onKeyDown={trapMenuButtonFocus} aria-expanded={open} aria-controls="mobile-navigation" aria-label={locale === "en" ? (open ? "Close menu" : "Open menu") : (open ? "關閉選單" : "開啟選單")}>
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      <div
        ref={mobileNavRef}
        id="mobile-navigation"
        className={`mobile-nav${open ? " is-open" : ""}`}
        tabIndex={-1}
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
        <nav aria-label={locale === "en" ? "Mobile navigation" : "行動版導覽"}>
          <div className="mobile-nav__discovery">
            <button type="button" data-explorer-trigger onClick={openExplorer}>
              <Compass size={18} aria-hidden="true" />
              {locale === "en" ? "Explore" : "探索導覽"}
            </button>
            <button type="button" onClick={surpriseMe}>
              <Sparkles size={18} aria-hidden="true" />
              {locale === "en" ? "Surprise me" : "隨機探索"}
            </button>
          </div>
          {navItems.map(([en, zh, href], index) => (
            <a key={href} aria-current={canonicalPath === href || canonicalPath.startsWith(`${href}/`) ? "page" : undefined} href={localizePath(href, locale)} onClick={() => closeMenu(false)}><span>{String(index + 1).padStart(2, "0")}</span>{locale === "en" ? en : zh}</a>
          ))}
          {mobileExtraItems.map(([en, zh, href], index) => (
            <a key={href} aria-current={canonicalPath === href ? "page" : undefined} href={localizePath(href, locale)} onClick={() => closeMenu(false)}><span>{String(navItems.length + index + 1).padStart(2, "0")}</span>{locale === "en" ? en : zh}</a>
          ))}
          <a href={siteConfig.cvPath} download><span>{String(navItems.length + mobileExtraItems.length + 1).padStart(2, "0")}</span>{locale === "en" ? "Download CV" : "下載 CV"}</a>
          <button type="button" data-search-trigger onClick={() => { closeMenu(false); onSearch?.(); }}><Search size={18} />{locale === "en" ? "Search the portfolio" : "搜尋作品集"}</button>
        </nav>
      </div>
    </header>
  );
}
