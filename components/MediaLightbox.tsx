"use client";

import { Maximize2, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { Locale } from "@/lib/site-config";

export type MediaLightboxAsset = {
  publicPath: string;
  alt: string;
  avifPath?: string;
  webpPath?: string;
  fallbackPath?: string;
};

type Props = {
  asset: MediaLightboxAsset;
  width: number;
  height: number;
  locale: Locale;
  title?: string;
  caption?: string;
  className?: string;
  eager?: boolean;
};

const triggerImageStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  objectFit: "contain",
};

const modalImageStyle: CSSProperties = {
  display: "block",
  width: "auto",
  height: "auto",
  maxWidth: "min(92vw, 1440px)",
  maxHeight: "calc(100dvh - 9rem)",
  objectFit: "contain",
};

function NaturalImage({
  asset,
  width,
  height,
  eager,
  modal = false,
}: Pick<Props, "asset" | "width" | "height" | "eager"> & { modal?: boolean }) {
  return (
    <picture
      className="media-lightbox__picture"
      style={{ display: "grid", placeItems: "center", maxWidth: "100%" }}
    >
      {asset.avifPath ? <source srcSet={asset.avifPath} type="image/avif" /> : null}
      {asset.webpPath ? <source srcSet={asset.webpPath} type="image/webp" /> : null}
      <img
        src={asset.fallbackPath ?? asset.publicPath}
        alt={asset.alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        style={modal ? modalImageStyle : triggerImageStyle}
      />
    </picture>
  );
}

export function MediaLightbox({
  asset,
  width,
  height,
  locale,
  title,
  caption,
  className,
  eager = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const assetKey = asset.publicPath
    .split("/")
    .pop()
    ?.replace(/[^a-zA-Z0-9_-]/g, "-") ?? "image";
  const titleId = `media-title-${assetKey}`;
  const captionId = `media-caption-${assetKey}`;
  const english = locale === "en";
  const readableName = title?.trim() || asset.alt.trim();
  const openLabel = readableName
    ? english
      ? `Open full-size image: ${readableName}`
      : `查看原尺寸圖片：${readableName}`
    : english
      ? "Open full-size image"
      : "查看原尺寸圖片";
  const dialogLabel = readableName
    ? english
      ? `Full-size image: ${readableName}`
      : `原尺寸圖片：${readableName}`
    : english
      ? "Full-size image"
      : "原尺寸圖片";

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);

    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) document.body.style.paddingRight = `${scrollbarGap}px`;

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) setOpen(false);
    };
    window.addEventListener("keydown", handleEscape, true);
    dialog.addEventListener("click", handleBackdropClick);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleEscape, true);
      dialog.removeEventListener("click", handleBackdropClick);
      if (dialog.open && typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");

      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;

      const focusTarget = restoreFocusRef.current;
      restoreFocusRef.current = null;
      window.requestAnimationFrame(() => {
        if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
      });
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  function trapDialogFocus(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  return (
    <figure className={["media-lightbox", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        className="media-lightbox__trigger"
        aria-label={openLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <NaturalImage asset={asset} width={width} height={height} eager={eager} />
        <span className="media-lightbox__expand" aria-hidden="true">
          <Maximize2 size={18} />
        </span>
      </button>

      {caption ? <figcaption className="media-lightbox__trigger-caption">{caption}</figcaption> : null}

      <dialog
        ref={dialogRef}
        className="media-lightbox__dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : dialogLabel}
        aria-describedby={caption ? captionId : undefined}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={() => setOpen(false)}
        onKeyDown={trapDialogFocus}
        style={{
          width: "min(96vw, 1500px)",
          maxWidth: "96vw",
          maxHeight: "96dvh",
          padding: 0,
          border: 0,
          background: "transparent",
          color: "inherit",
          overflow: "visible",
        }}
      >
        <div className="media-lightbox__surface">
          <button
            ref={closeButtonRef}
            type="button"
            className="media-lightbox__close"
            aria-label={english ? "Close full-size image" : "關閉原尺寸圖片"}
            onClick={close}
          >
            <X size={20} aria-hidden="true" />
          </button>

          <figure className="media-lightbox__full-figure">
            <NaturalImage asset={asset} width={width} height={height} eager modal />
            {title || caption ? (
              <figcaption className="media-lightbox__caption">
                {title ? <strong id={titleId}>{title}</strong> : null}
                {caption ? <span id={captionId}>{caption}</span> : null}
              </figcaption>
            ) : null}
          </figure>
        </div>
      </dialog>
    </figure>
  );
}
