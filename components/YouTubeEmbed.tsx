"use client";

import { ExternalLink, LoaderCircle, Play, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Locale } from "@/lib/site-config";
import type { VideoRecord } from "@/lib/videos";

type Props = {
  video: VideoRecord;
  locale: Locale;
  poster?: string;
  compact?: boolean;
};

type PlayerState = "idle" | "loading" | "playing" | "error";

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function YouTubeEmbed({ video, locale, poster, compact = false }: Props) {
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const posterStyle = poster
    ? { backgroundImage: `url("${poster}")` }
    : {
        "--video-poster-fallback": `url("${video.poster.fallback}")`,
        "--video-poster-set": `image-set(url("${video.poster.avif}") type("image/avif"), url("${video.poster.webp}") type("image/webp"), url("${video.poster.fallback}") type("image/jpeg"))`,
      } as CSSProperties;
  const playLabel =
    locale === "en" ? `Play ${video.title.en}` : `播放〈${video.title.zh}〉`;
  const retryLabel = locale === "en"
    ? `Try loading ${video.title.en} again`
    : `重新載入〈${video.title.zh}〉`;

  useEffect(() => {
    if (playerState === "playing") frameRef.current?.focus();
  }, [playerState]);

  useEffect(() => {
    if (playerState !== "loading") return;
    const timeout = window.setTimeout(() => setPlayerState("error"), 12_000);
    return () => window.clearTimeout(timeout);
  }, [playerState]);

  useEffect(() => {
    if (playerState !== "error") return;
    const focusFrame = window.requestAnimationFrame(() => {
      playButtonRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [playerState]);

  useEffect(() => {
    const closeWhenAnotherStarts = (event: Event) => {
      const nextId = (event as CustomEvent<string>).detail;
      if (nextId !== video.id) setPlayerState("idle");
    };
    window.addEventListener("portfolio-video-play", closeWhenAnotherStarts);
    return () => window.removeEventListener("portfolio-video-play", closeWhenAnotherStarts);
  }, [video.id]);

  function play() {
    window.dispatchEvent(new CustomEvent("portfolio-video-play", { detail: video.id }));
    setPlayerState("loading");
  }

  function close() {
    setPlayerState("idle");
    window.requestAnimationFrame(() => playButtonRef.current?.focus({ preventScroll: true }));
  }

  return (
    <figure className={`video-block${compact ? " video-block--compact" : ""}`}>
      <div className="video-frame">
        {playerState === "loading" || playerState === "playing" ? (
          <>
            <iframe
              ref={frameRef}
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0`}
              title={video.title[locale]}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setPlayerState("playing")}
              onError={() => setPlayerState("error")}
            />
            {playerState === "loading" ? (
              <>
                <span className="video-play" aria-hidden="true">
                  <LoaderCircle size={24} />
                </span>
                <span role="status" aria-live="polite" style={visuallyHidden}>
                  {locale === "en" ? "Loading video player…" : "正在載入影片播放器……"}
                </span>
              </>
            ) : null}
            <button
              type="button"
              className="video-close"
              onClick={close}
              aria-label={locale === "en" ? "Close video" : "關閉影片"}
            >
              <X aria-hidden="true" size={18} />
            </button>
          </>
        ) : playerState === "error" ? (
          <button
            ref={playButtonRef}
            type="button"
            className="video-poster video-poster--has-image"
            onClick={play}
            aria-label={retryLabel}
            style={posterStyle}
          >
            <span className="video-poster__veil" aria-hidden="true" />
            <span className="video-play" aria-hidden="true">
              <Play size={24} fill="currentColor" />
            </span>
            <span className="video-poster__label">
              <span>{locale === "en" ? "The player did not start. Try again." : "播放器未能啟動，請再試一次。"}</span>
              <small>{video.duration}</small>
            </span>
          </button>
        ) : (
          <button
            ref={playButtonRef}
            type="button"
            className="video-poster video-poster--has-image"
            onClick={play}
            aria-label={playLabel}
            style={posterStyle}
          >
            <span className="video-poster__veil" aria-hidden="true" />
            <span className="video-play" aria-hidden="true">
              <Play size={24} fill="currentColor" />
            </span>
            <span className="video-poster__label">
              <span>{video.title[locale]}</span>
              <small>{video.duration}</small>
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <p>{video.summary[locale]}</p>
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          {locale === "en" ? "Open on YouTube" : "在 YouTube 開啟"}
          <ExternalLink aria-hidden="true" size={14} />
        </a>
      </figcaption>
      <noscript>
        <a href={`https://www.youtube.com/watch?v=${video.id}`}>
          {locale === "en" ? "Watch this video on YouTube" : "在 YouTube 觀看影片"}
        </a>
      </noscript>
    </figure>
  );
}
