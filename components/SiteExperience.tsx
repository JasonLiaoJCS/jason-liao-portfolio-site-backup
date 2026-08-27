"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = [
  ".hero__intro",
  ".hero__support",
  ".hero__visual",
  ".home-proof-heading",
  ".academic-record-proof",
  ".section-header",
  ".strength-card",
  ".portfolio-map__identity",
  ".portfolio-map__paths > a",
  ".feature-media",
  ".feature-copy",
  ".case-card",
  ".home-academic-card",
  ".home-human-note",
  ".archive-row",
  ".landing-collection-group__heading",
  ".gallery-item",
  ".document-card",
  ".evidence-card",
].join(",");

const SURFACE_SELECTOR = [
  ".strength-card",
  ".case-card",
  ".archive-card",
  ".evidence-card",
  ".document-card",
].join(",");

const DEPTH_SELECTOR = [
  "a.case-card",
  "a.home-academic-card",
  "a.archive-record-card",
  "a.longform-next__card",
].join(",");

const MAGNETIC_SELECTOR = [
  ".button",
  ".academic-record-context__link",
  ".portfolio-trajectory__index",
  ".archive-hero__primary-link",
].join(",");

const DIRECTIONAL_SELECTOR = [
  ".portfolio-map__paths > a",
  ".archive-row",
  ".portfolio-trajectory__entry > a",
  ".contact-quick-row",
  ".process-lab__cta",
].join(",");

const MOTION_EXCLUSION_SELECTOR = [
  ".site-header",
  ".mobile-nav",
  ".guided-explorer-dock",
  ".guided-explorer-dialog",
  ".search-dialog",
  ".capability-atlas",
  ".portfolio-constellation__experience",
  ".portfolio-cinema__stage",
  ".project-compare__desk",
  ".media-lightbox",
  "dialog",
  "form",
].join(",");

const clampMotion = (value: number, minimum: number, maximum: number) => (
  Math.min(maximum, Math.max(minimum, value))
);

type Props = { path: string };

export function SiteExperience({ path }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
    const surfaceTargets = Array.from(document.querySelectorAll<HTMLElement>(SURFACE_SELECTOR));
    const depthTargets = new Set(document.querySelectorAll<HTMLElement>(DEPTH_SELECTOR));
    const magneticTargets = new Set(Array.from(document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR))
      .filter((element) => !element.closest(MOTION_EXCLUSION_SELECTOR)));
    const directionalTargets = new Set(Array.from(document.querySelectorAll<HTMLElement>(DIRECTIONAL_SELECTOR))
      .filter((element) => !element.closest(MOTION_EXCLUSION_SELECTOR)));
    const heroVisual = document.querySelector<HTMLElement>(".hero__visual");
    let observer: IntersectionObserver | null = null;
    let pointerFrame = 0;
    let hardResetFrame = 0;
    let hardResetActive = false;
    let activeSurface: HTMLElement | null = null;
    let activeDepth: HTMLElement | null = null;
    let activeMagnetic: HTMLElement | null = null;
    let activeDirectional: HTMLElement | null = null;
    let surfaceRect: DOMRect | null = null;
    let depthRect: DOMRect | null = null;
    let magneticRect: DOMRect | null = null;
    let directionalRect: DOMRect | null = null;
    let heroRect: DOMRect | null = null;

    const groupCounts = new Map<Element, number>();
    revealTargets.forEach((element) => {
      const group = element.closest("section, header.page-hero") ?? document.body;
      const index = groupCounts.get(group) ?? 0;
      groupCounts.set(group, index + 1);
      element.dataset.reveal = "";
      element.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 54}ms`);
    });
    surfaceTargets.forEach((element) => { element.dataset.experienceSurface = ""; });
    depthTargets.forEach((element) => { element.dataset.motionDepth = "idle"; });
    magneticTargets.forEach((element) => { element.dataset.motionMagnetic = "idle"; });
    directionalTargets.forEach((element) => { element.dataset.motionDirectional = "idle"; });

    const markRevealed = (element: Element) => element.setAttribute("data-reveal-state", "visible");
    const revealEverything = () => revealTargets.forEach(markRevealed);

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      revealEverything();
    } else {
      revealTargets.forEach((element) => {
        if (element.getBoundingClientRect().top <= window.innerHeight * 0.96) {
          markRevealed(element);
        }
      });
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          markRevealed(entry.target);
          observer?.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -7%", threshold: 0.04 });
      revealTargets.forEach((element) => {
        if (element.dataset.revealState !== "visible") observer?.observe(element);
      });
    }

    const motionEnabled = () => (
      finePointer.matches
      && !reduceMotion.matches
      && !forcedColors.matches
      && window.innerWidth >= 761
    );

    const resetPointerDepth = () => {
      if (!heroVisual) return;
      for (const property of ["--hero-frame-x", "--hero-frame-y", "--hero-frame-r", "--hero-seal-x", "--hero-seal-y", "--hero-note-x", "--hero-note-y"]) {
        heroVisual.style.removeProperty(property);
      }
    };

    const resetSurface = () => {
      if (activeSurface) {
        activeSurface.style.removeProperty("--surface-x");
        activeSurface.style.removeProperty("--surface-y");
      }
      activeSurface = null;
      surfaceRect = null;
    };

    const resetDepth = () => {
      if (activeDepth) {
        activeDepth.dataset.motionDepth = "idle";
        activeDepth.style.removeProperty("--depth-rotate");
        activeDepth.style.removeProperty("--depth-lift");
        activeDepth.style.removeProperty("--depth-scale");
      }
      activeDepth = null;
      depthRect = null;
    };

    const resetMagnetic = () => {
      if (activeMagnetic) {
        activeMagnetic.dataset.motionMagnetic = "idle";
        activeMagnetic.style.removeProperty("--magnetic-x");
        activeMagnetic.style.removeProperty("--magnetic-y");
      }
      activeMagnetic = null;
      magneticRect = null;
    };

    const resetDirectional = () => {
      if (activeDirectional) {
        activeDirectional.dataset.motionDirectional = "idle";
        activeDirectional.style.removeProperty("--direction-x");
        activeDirectional.style.removeProperty("--direction-y");
      }
      activeDirectional = null;
      directionalRect = null;
    };

    const resetInteractiveMotion = () => {
      if (pointerFrame) {
        window.cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
      }
      root.classList.remove("has-pointer-signal");
      root.style.removeProperty("--pointer-x");
      root.style.removeProperty("--pointer-y");
      resetPointerDepth();
      resetSurface();
      resetDepth();
      resetMagnetic();
      resetDirectional();
      heroRect = null;
    };

    const hardResetInteractiveMotion = () => {
      hardResetActive = true;
      root.classList.add("motion-resetting");
      resetInteractiveMotion();
      if (hardResetFrame) window.cancelAnimationFrame(hardResetFrame);
      hardResetFrame = window.requestAnimationFrame(() => {
        hardResetFrame = 0;
        hardResetActive = false;
        root.classList.remove("motion-resetting");
      });
    };

    const eligibleTarget = (element: HTMLElement | null) => (
      element
      && !element.closest(MOTION_EXCLUSION_SELECTOR)
      && !element.matches(":disabled, [aria-disabled='true']")
        ? element
        : null
    );

    const updatePointer = (event: PointerEvent) => {
      if (!motionEnabled() || event.pointerType !== "mouse" || hardResetActive) {
        if (event.pointerType !== "mouse" && root.classList.contains("has-pointer-signal")) {
          resetInteractiveMotion();
        }
        return;
      }
      const x = event.clientX;
      const y = event.clientY;
      const pointerTarget = event.target instanceof Element ? event.target : null;
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = window.requestAnimationFrame(() => {
        pointerFrame = 0;

        const nextMagnetic = eligibleTarget(pointerTarget?.closest<HTMLElement>(MAGNETIC_SELECTOR) ?? null);
        const nextDepth = nextMagnetic
          ? null
          : eligibleTarget(pointerTarget?.closest<HTMLElement>(DEPTH_SELECTOR) ?? null);
        const nextDirectional = nextMagnetic || nextDepth
          ? null
          : eligibleTarget(pointerTarget?.closest<HTMLElement>(DIRECTIONAL_SELECTOR) ?? null);
        const nextSurface = pointerTarget?.closest<HTMLElement>(SURFACE_SELECTOR) ?? null;

        if (nextSurface !== activeSurface) {
          resetSurface();
          activeSurface = nextSurface;
          surfaceRect = activeSurface?.getBoundingClientRect() ?? null;
        }
        if (nextDepth !== activeDepth) {
          resetDepth();
          activeDepth = nextDepth;
          depthRect = activeDepth?.getBoundingClientRect() ?? null;
          if (activeDepth) {
            depthTargets.add(activeDepth);
            activeDepth.dataset.motionDepth = "active";
          }
        }
        if (nextMagnetic !== activeMagnetic) {
          resetMagnetic();
          activeMagnetic = nextMagnetic;
          magneticRect = activeMagnetic?.getBoundingClientRect() ?? null;
          if (activeMagnetic) {
            magneticTargets.add(activeMagnetic);
            activeMagnetic.dataset.motionMagnetic = "active";
          }
        }
        if (nextDirectional !== activeDirectional) {
          resetDirectional();
          activeDirectional = nextDirectional;
          directionalRect = activeDirectional?.getBoundingClientRect() ?? null;
          if (activeDirectional) {
            directionalTargets.add(activeDirectional);
            activeDirectional.dataset.motionDirectional = "active";
          }
        }

        heroRect ??= heroVisual?.getBoundingClientRect() ?? null;

        root.style.setProperty("--pointer-x", `${x}px`);
        root.style.setProperty("--pointer-y", `${y}px`);
        root.classList.add("has-pointer-signal");

        if (heroVisual && heroRect) {
          const withinHero = x >= heroRect.left && x <= heroRect.right && y >= heroRect.top && y <= heroRect.bottom;
          const normalizedX = withinHero ? ((x - heroRect.left) / Math.max(1, heroRect.width) - .5) * 2 : 0;
          const normalizedY = withinHero ? ((y - heroRect.top) / Math.max(1, heroRect.height) - .5) * 2 : 0;
          heroVisual.style.setProperty("--hero-frame-x", `${normalizedX * 3.5}px`);
          heroVisual.style.setProperty("--hero-frame-y", `${normalizedY * 3}px`);
          heroVisual.style.setProperty("--hero-frame-r", `${normalizedX * .28}deg`);
          heroVisual.style.setProperty("--hero-seal-x", `${normalizedX * -4.2}px`);
          heroVisual.style.setProperty("--hero-seal-y", `${normalizedY * -3.4}px`);
          heroVisual.style.setProperty("--hero-note-x", `${normalizedX * 2.2}px`);
          heroVisual.style.setProperty("--hero-note-y", `${normalizedY * 1.8}px`);
        }

        if (activeSurface && surfaceRect) {
          activeSurface.style.setProperty("--surface-x", `${x - surfaceRect.left}px`);
          activeSurface.style.setProperty("--surface-y", `${y - surfaceRect.top}px`);
        }

        if (activeDepth && depthRect) {
          const normalizedX = clampMotion((x - (depthRect.left + depthRect.width / 2)) / Math.max(1, depthRect.width / 2), -1, 1);
          const normalizedY = clampMotion((y - (depthRect.top + depthRect.height / 2)) / Math.max(1, depthRect.height / 2), -1, 1);
          const maxRotateX = depthRect.width > 720 ? 1.15 : 2.05;
          const maxRotateY = depthRect.width > 720 ? 1.45 : 2.25;
          const rotateX = -normalizedY * maxRotateX;
          const rotateY = normalizedX * maxRotateY;
          const rawRotateAngle = Math.hypot(rotateX, rotateY);
          const rotateAngle = Math.min(rawRotateAngle, 2.25);
          const axisX = rawRotateAngle ? rotateX / rawRotateAngle : 0;
          const axisY = rawRotateAngle ? rotateY / rawRotateAngle : 0;
          activeDepth.style.setProperty("--depth-rotate", `${axisX.toFixed(4)} ${axisY.toFixed(4)} 0 ${rotateAngle.toFixed(3)}deg`);
          activeDepth.style.setProperty("--depth-lift", depthRect.width > 720 ? "-1.5px" : "-2.5px");
          activeDepth.style.setProperty("--depth-scale", depthRect.width > 720 ? "1.002" : "1.004");
        }

        if (activeMagnetic && magneticRect) {
          const offsetX = (x - (magneticRect.left + magneticRect.width / 2)) * .1;
          const offsetY = (y - (magneticRect.top + magneticRect.height / 2)) * .1;
          activeMagnetic.style.setProperty("--magnetic-x", `${clampMotion(offsetX, -4, 4).toFixed(2)}px`);
          activeMagnetic.style.setProperty("--magnetic-y", `${clampMotion(offsetY, -3.2, 3.2).toFixed(2)}px`);
        }

        if (activeDirectional && directionalRect) {
          const normalizedX = clampMotion((x - (directionalRect.left + directionalRect.width / 2)) / Math.max(1, directionalRect.width / 2), -1, 1);
          const normalizedY = clampMotion((y - (directionalRect.top + directionalRect.height / 2)) / Math.max(1, directionalRect.height / 2), -1, 1);
          activeDirectional.style.setProperty("--direction-x", `${(normalizedX * 1.35).toFixed(2)}px`);
          activeDirectional.style.setProperty("--direction-y", `${(normalizedY * .6 - 1.1).toFixed(2)}px`);
        }
      });
    };

    const syncMotionCapability = () => {
      root.classList.toggle("has-fine-pointer", motionEnabled());
    };

    const onMotionPreferenceChange = () => {
      syncMotionCapability();
      if (!motionEnabled()) resetInteractiveMotion();
      if (reduceMotion.matches) {
        observer?.disconnect();
        revealEverything();
      }
    };

    const onViewportChange = () => {
      syncMotionCapability();
      resetInteractiveMotion();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") resetInteractiveMotion();
    };

    const onPageShow = () => {
      if (hardResetFrame) window.cancelAnimationFrame(hardResetFrame);
      hardResetFrame = 0;
      hardResetActive = false;
      root.classList.remove("motion-resetting");
      syncMotionCapability();
      resetInteractiveMotion();
    };

    syncMotionCapability();
    root.classList.add("motion-ready");
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointercancel", resetInteractiveMotion, { passive: true });
    window.addEventListener("blur", resetInteractiveMotion);
    window.addEventListener("scroll", resetInteractiveMotion, { passive: true });
    window.addEventListener("resize", onViewportChange, { passive: true });
    window.addEventListener("pageswap", hardResetInteractiveMotion);
    window.addEventListener("pagehide", hardResetInteractiveMotion);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("pointerdown", hardResetInteractiveMotion, { capture: true, passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.documentElement.addEventListener("pointerleave", resetInteractiveMotion);
    finePointer.addEventListener("change", onMotionPreferenceChange);
    reduceMotion.addEventListener("change", onMotionPreferenceChange);
    forcedColors.addEventListener("change", onMotionPreferenceChange);

    return () => {
      observer?.disconnect();
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointercancel", resetInteractiveMotion);
      window.removeEventListener("blur", resetInteractiveMotion);
      window.removeEventListener("scroll", resetInteractiveMotion);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("pageswap", hardResetInteractiveMotion);
      window.removeEventListener("pagehide", hardResetInteractiveMotion);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("pointerdown", hardResetInteractiveMotion, { capture: true });
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.documentElement.removeEventListener("pointerleave", resetInteractiveMotion);
      finePointer.removeEventListener("change", onMotionPreferenceChange);
      reduceMotion.removeEventListener("change", onMotionPreferenceChange);
      forcedColors.removeEventListener("change", onMotionPreferenceChange);
      if (hardResetFrame) window.cancelAnimationFrame(hardResetFrame);
      hardResetFrame = 0;
      hardResetActive = false;
      resetInteractiveMotion();
      root.classList.remove("motion-ready", "has-fine-pointer", "motion-resetting");
      revealTargets.forEach((element) => {
        delete element.dataset.reveal;
        delete element.dataset.revealState;
        element.style.removeProperty("--reveal-delay");
      });
      surfaceTargets.forEach((element) => {
        delete element.dataset.experienceSurface;
        element.style.removeProperty("--surface-x");
        element.style.removeProperty("--surface-y");
      });
      depthTargets.forEach((element) => {
        delete element.dataset.motionDepth;
        element.style.removeProperty("--depth-rotate");
        element.style.removeProperty("--depth-lift");
        element.style.removeProperty("--depth-scale");
      });
      magneticTargets.forEach((element) => {
        delete element.dataset.motionMagnetic;
        element.style.removeProperty("--magnetic-x");
        element.style.removeProperty("--magnetic-y");
      });
      directionalTargets.forEach((element) => {
        delete element.dataset.motionDirectional;
        element.style.removeProperty("--direction-x");
        element.style.removeProperty("--direction-y");
      });
    };
  }, [path]);

  return (
    <div className="site-experience" aria-hidden="true">
      <span className="site-experience__aura" />
      <span className="site-experience__trace" />
    </div>
  );
}
