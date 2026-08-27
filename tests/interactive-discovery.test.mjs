import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("guided explorer is bilingual, route-grounded, and keyboard-safe", async () => {
  const [explorer, frame, surprise] = await Promise.all([
    read("components/GuidedExplorer.tsx"),
    read("components/SiteFrame.tsx"),
    read("lib/surprise-route.ts"),
  ]);
  assert.match(explorer, /titleEn: "Research"/);
  assert.match(explorer, /titleZh: "研究方向"/);
  assert.match(explorer, /onCancel/);
  assert.match(explorer, /trapFocus/);
  assert.match(explorer, /openFocusOriginRef/);
  assert.match(explorer, /openFocusOriginRef\.current === "keyboard" \? surpriseRef\.current : dialog/);
  assert.match(explorer, /aria-describedby=\{descriptionId\}[\s\S]*tabIndex=\{-1\}/);
  assert.match(explorer, /document\.activeElement === dialogRef\.current/);
  assert.doesNotMatch(explorer, /useId/);
  assert.match(explorer, /guided-explorer-dialog/);
  assert.match(explorer, /localizePath/);
  assert.match(explorer, /chooseSurpriseRoute/);
  assert.match(explorer, /surpriseRoutes/);
  assert.match(explorer, /SURPRISE_ME_EVENT/);
  assert.match(explorer, /Open one page at random from across the site/);
  assert.doesNotMatch(explorer, /sessionStorage|SURPRISE_HISTORY/);
  assert.match(surprise, /crypto\.getRandomValues|secureRandomValue/);
  assert.doesNotMatch(surprise, /SURPRISE_ROUTES/);
  assert.doesNotMatch(explorer, /stableIndex/);
  assert.match(explorer, /\/research\/redrhex/);
  assert.match(explorer, /\/projects\/aero-carrier/);
  assert.match(explorer, /\/academics\/numerical-analysis/);
  assert.match(frame, /<GuidedExplorer/);
  assert.match(frame, /searchEntries\.map\(\(entry\) => entry\.path\)/);
  assert.match(frame, /surpriseRoutes=\{surpriseRoutes\}/);
  assert.match(frame, /canReceiveFocus/);
  assert.match(frame, /element\.tabIndex >= 0/);
  assert.match(frame, /!element\.closest\("\[inert\]"\)/);
  assert.match(frame, /data-search-trigger/);
});

test("interactive process lab preserves six real steps and accessible tabs", async () => {
  const [lab, home] = await Promise.all([
    read("components/ProcessLab.tsx"),
    read("components/HomePage.tsx"),
  ]);
  assert.match(lab, /role="tablist"/);
  assert.match(lab, /role="tabpanel"/);
  assert.doesNotMatch(lab, /useId/);
  assert.match(lab, /const tabsId = "process-lab"/);
  assert.match(lab, /ArrowRight/);
  assert.match(lab, /Home/);
  assert.match(lab, /End/);
  for (const step of ["Define", "Model", "Integrate", "Verify", "Document", "Handoff"]) {
    assert.match(lab, new RegExp(`en: "${step}"`));
  }
  for (const route of ["/research/redrhex", "/projects/lkas", "/projects/inventor-system-integration", "/academics/numerical-analysis", "/projects/aero-carrier"]) {
    assert.match(lab, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(home, /<ProcessLab locale=\{locale\}/);
});

test("live section navigator tracks chapters without covering mobile content", async () => {
  const [navigator, page, css] = await Promise.all([
    read("components/SectionNavigator.tsx"),
    read("components/PageView.tsx"),
    read("app/globals.css"),
  ]);
  assert.match(navigator, /IntersectionObserver/);
  assert.match(navigator, /aria-current/);
  assert.doesNotMatch(navigator, /aria-live=/);
  assert.match(navigator, /--toc-progress/);
  assert.match(page, /<SectionNavigator/);
  assert.match(css, /\.toc__links/);
  assert.match(css, /@media \(max-width: 1300px\)[\s\S]*\.guided-explorer-dock \{ display: none; \}/);
  assert.match(css, /@media \(min-width: 1301px\) and \(max-width: 1420px\)[\s\S]*\.guided-explorer-dock \{ left: 4px; width: 44px;/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.back-to-top \{ display: none; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.toc__meter i/);
});

test("detail media keeps full images readable without floating-control collisions", async () => {
  const [page, frame, css] = await Promise.all([
    read("components/PageView.tsx"),
    read("components/SiteFrame.tsx"),
    read("app/globals.css"),
  ]);
  assert.match(page, /const isMixedPair = images\.length === 2/);
  assert.match(page, /gallery-item--mixed-pair-compact/);
  assert.match(page, /gallery-item--centered-orphan/);
  assert.match(page, /Math\.floor\(\(index \* imageSlots\.length\) \/ Math\.max\(1, images\.length\)\)/);
  assert.doesNotMatch(frame, /isDetailPage|landingPaths/);
  assert.match(frame, /<GuidedExplorer[\s\S]*surpriseRoutes=\{surpriseRoutes\}/);
  assert.match(css, /\.case-hero-media--image \.case-hero-media__frame \{ min-height: 0; max-height: none; \}/);
  assert.match(css, /\.gallery-grid--mixed-pair \.gallery-item--mixed-pair-compact \{ width: min\(100%,520px\); margin-inline: auto; \}/);
  assert.match(css, /\.gallery-item--centered-orphan \{ width: min\(100%,920px\); justify-self: center; \}/);
});

test("portfolio search is bilingual-normalized, relevance-ranked, and excludes private access", async () => {
  const [frame, runtime, courseRecord] = await Promise.all([
    read("components/SiteFrame.tsx"),
    read("lib/page-runtime.ts"),
    read("lib/course-record.ts"),
  ]);
  assert.match(frame, /normalize\("NFKC"\)/);
  assert.match(frame, /scoreSearchEntry/);
  assert.match(frame, /title\.startsWith\(query\)/);
  assert.match(frame, /role="status" aria-live="polite"/);
  assert.match(runtime, /entity\.route !== "\/trusted"/);
  assert.match(runtime, /const alternateLocale: Locale/);
  assert.match(runtime, /entity\.title\[alternateLocale\]/);
  assert.match(runtime, /entity\.card\[alternateLocale\]/);
  assert.match(courseRecord, /\.\.\.publicCourseRecord\.exemptions/);
});

test("mobile navigation provides complete focus lifecycle and mobile explorer access", async () => {
  const navigation = await read("components/Navigation.tsx");
  const css = await read("app/globals.css");
  assert.match(navigation, /OPEN_EXPLORER_EVENT = "jason:open-explorer"/);
  assert.match(navigation, /SURPRISE_ME_EVENT = "jason:surprise-me"/);
  assert.match(navigation, /探索導覽/);
  assert.match(navigation, /隨機探索/);
  assert.match(navigation, /mobile-nav__discovery/);
  assert.match(navigation, /data-explorer-trigger/);
  assert.match(navigation, /addEventListener\("pointerdown"/);
  assert.match(navigation, /addEventListener\("focusout"/);
  assert.match(navigation, /trapMenuButtonFocus/);
  assert.match(navigation, /menuFocusOriginRef/);
  assert.match(navigation, /menuFocusOriginRef\.current !== "keyboard"/);
  assert.match(navigation, /firstControl\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(navigation, /event\.detail === 0 \? "keyboard" : "pointer"/);
  assert.match(navigation, /inert=\{open \? undefined : true\}/);
  assert.match(css, /\.mobile-nav \{[^}]*visibility 0s linear \.18s;/);
  assert.match(css, /\.mobile-nav\.is-open \{[^}]*visibility: visible;[^}]*transition-delay: 0s;/);
  assert.match(css, /\.mobile-nav:focus \{ outline: none; \}/);
  assert.match(css, /\.guided-explorer-dialog:focus \{ outline: none; \}/);
});

test("capability map connects five strengths to accessible bilingual work", async () => {
  const [atlas, home] = await Promise.all([
    read("components/CapabilityAtlas.tsx"),
    read("components/HomePage.tsx"),
  ]);
  assert.match(atlas, /Capability map/);
  assert.match(atlas, /能力與作品地圖/);
  assert.doesNotMatch(atlas, /Admissions evidence atlas|申請審閱證據地圖/);
  assert.match(atlas, /role="tablist"/);
  assert.match(atlas, /role="tabpanel"/);
  assert.match(atlas, /aria-selected=\{selected\}/);
  assert.match(atlas, /ArrowRight", "ArrowDown/);
  assert.match(atlas, /event\.key === "Home"/);
  assert.match(atlas, /event\.key === "End"/);
  for (const capability of ["research", "theory", "validation", "systems", "collaboration"]) {
    assert.match(atlas, new RegExp(`id: "${capability}"`));
  }
  for (const route of ["/research/redrhex", "/academics/course-record", "/projects/aero-carrier", "/experience/trml-captain-2020-2021"]) {
    assert.match(atlas, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(home, /<CapabilityAtlas locale=\{locale\} \/>/);
});

test("saved pages are device-local, route-safe, shareable, and available from every explorer", async () => {
  const [explorer, frame] = await Promise.all([
    read("components/GuidedExplorer.tsx"),
    read("components/SiteFrame.tsx"),
  ]);
  assert.match(explorer, /portfolio-review-trail:v1/);
  assert.match(explorer, /portfolio-shortlist:v1/);
  assert.match(explorer, /canonicalExplorerPath/);
  assert.match(explorer, /validRoutes\.has\(route\)/);
  assert.match(explorer, /slice\(0, 12\)/);
  assert.match(explorer, /navigator\.share/);
  assert.match(explorer, /navigator\.clipboard/);
  assert.match(explorer, /Saved on this device/);
  assert.match(explorer, /儲存在此裝置/);
  assert.match(explorer, /id: "writing"/);
  assert.match(explorer, /titleEn: "Writing"/);
  assert.match(explorer, /startsWith\("\/writing"\).*startsWith\("\/about"\).*startsWith\("\/personal"\)/);
  assert.match(explorer, /id="explorer-paths-tab"/);
  assert.match(explorer, /aria-labelledby="explorer-trail-tab"/);
  assert.match(explorer, /const moveMode/);
  assert.match(explorer, /tabIndex=\{mode === "paths" \? 0 : -1\}/);
  assert.match(explorer, /aria-keyshortcuts="Alt\+E"/);
  assert.match(explorer, /aria-keyshortcuts="Alt\+S"/);
  assert.match(frame, /entries=\{searchEntries\}/);
  assert.match(frame, /document\.getElementById\("main-content"\)\?\.focus/);
});

test("modal search locks background scrolling while mobile navigation preserves the sticky root scroller", async () => {
  const [frame, navigation, css] = await Promise.all([
    read("components/SiteFrame.tsx"),
    read("components/Navigation.tsx"),
    read("app/globals.css"),
  ]);
  assert.match(frame, /searchDialogRef/);
  assert.match(frame, /dialog\.showModal\(\)/);
  assert.match(frame, /document\.documentElement\.style\.overflow = "hidden"/);
  assert.match(frame, /onCancel=\{\(event\) => \{ event\.preventDefault\(\); closeSearch\(\); \}\}/);
  assert.doesNotMatch(navigation, /document\.documentElement\.style\.overflow/);
  assert.doesNotMatch(navigation, /document\.body\.style\.overflow/);
  assert.match(navigation, /menuFocusOriginRef\.current !== "keyboard"/);
  assert.match(navigation, /window\.matchMedia\("\(min-width: 1301px\)"\)/);
  assert.match(navigation, /window\.addEventListener\("pagehide", resetTransientMenu\)/);
  assert.match(navigation, /if \(event\.cancelable\) event\.preventDefault\(\);/);
  assert.match(css, /\.site-header \{[^}]*position: sticky;[^}]*top: 0;/);
  assert.match(css, /\.mobile-nav \{[^}]*position: fixed;[^}]*max-height: calc\(100dvh[^}]*overflow-y: auto;[^}]*overscroll-behavior: contain;[^}]*pointer-events: none;/);
  assert.match(css, /\.mobile-nav\.is-open \{[^}]*pointer-events: auto;/);
});

test("search command center supports scopes, direct keyboard selection, and modal isolation", async () => {
  const frame = await read("components/SiteFrame.tsx");
  for (const scope of ["research", "projects", "academics", "writing", "experience"]) {
    assert.match(frame, new RegExp(`id: "${scope}"`));
  }
  assert.match(frame, /role="combobox"/);
  assert.match(frame, /role="listbox"/);
  assert.match(frame, /ArrowDown/);
  assert.match(frame, /ArrowUp/);
  assert.match(frame, /event\.key === "Enter"/);
  assert.match(frame, /event\.key === "\/"/);
  assert.match(frame, /dialog\[open\]/);
  assert.match(frame, /mobile-nav\.is-open/);
  assert.match(frame, /isEditableTarget/);
  assert.match(frame, /searchOpen && !explorerOpen|!searchOpen && !explorerOpen/);
  assert.match(frame, /QUICK_ACCESS_ROUTES/);
  assert.match(frame, /prioritizeEmptySearch/);
  assert.match(frame, /searchScopeCounts/);
  assert.match(frame, /onPointerMove=\{\(\) => setActiveResultIndex\(index\)\}/);
  assert.doesNotMatch(frame, /onMouseEnter=\{\(\) => setActiveResultIndex\(index\)\}/);
  assert.match(frame, /Browse all \$\{searchEntries\.length\} pages/);
  assert.match(frame, /Profile & experience/);
});

test("saved pages export a useful list and continue in order", async () => {
  const explorer = await read("components/GuidedExplorer.tsx");
  assert.match(explorer, /copyShortlist/);
  assert.match(explorer, /Page list copied with summaries and links/);
  assert.match(explorer, /nextSavedRoute/);
  assert.match(explorer, /Next saved page/);
  assert.match(explorer, /下一個已儲存頁面/);
  assert.match(explorer, /data-saved-remove/);
  assert.match(explorer, /savedHeadingRef\.current\?\.focus/);
  assert.match(explorer, /element\.tabIndex >= 0/);
  assert.match(explorer, /aria-controls=\{open \? dialogId : undefined\}/);
  assert.match(explorer, /dialog\[open\]/);
  assert.match(explorer, /mobile-nav\.is-open/);
  assert.match(explorer, /event\.isComposing/);
});

test("course finder adds non-destructive cross-semester discovery", async () => {
  const [finder, page] = await Promise.all([
    read("components/CourseRecordFinder.tsx"),
    read("components/CourseRecordPage.tsx"),
  ]);
  assert.match(finder, /publicCourseRecord\.semesters/);
  assert.match(finder, /publicCourseRecord\.exemptions/);
  assert.match(finder, /Object\.keys\(publicCourseRecord\.domains\)/);
  assert.match(finder, /normalizeCourseSearch/);
  assert.match(finder, /aPlusOnly/);
  assert.match(finder, /evidenceOnly/);
  assert.match(finder, /course\.relatedRoute/);
  assert.match(finder, /aria-live="polite"/);
  assert.match(page, /<CourseRecordFinder locale=\{locale\} \/>/);
  assert.match(page, /<CourseTable locale=\{locale\}/);
});

test("portfolio trajectory presents five periods with multiple real records and a complete-index handoff", async () => {
  const [trajectory, home] = await Promise.all([
    read("components/PortfolioTrajectory.tsx"),
    read("components/HomePage.tsx"),
  ]);
  assert.match(trajectory, /<ol className="portfolio-trajectory__timeline"/);
  assert.match(trajectory, /<time>\{period\.date\}<\/time>/);
  assert.match(trajectory, /periods\.map\(\(period, periodIndex\)/);
  assert.match(trajectory, /period\.entries\.map\(\(entry, entryIndex\)/);
  assert.match(trajectory, /<ul className="portfolio-trajectory__entries">/);
  assert.match(trajectory, /localizePath\("\/archive", locale\)/);
  assert.doesNotMatch(trajectory, /useState|useRef|role="tablist"|role="tabpanel"|setInterval|setTimeout/);
  assert.match(home, /const trajectoryPeriods = \[/);
  for (const period of [
    "mathematical-foundations",
    "inquiry-teaching-leadership",
    "interdisciplinary-foundation",
    "physical-systems",
    "verifiable-results",
  ]) assert.match(home, new RegExp(`id: "${period}"`));
  for (const route of [
    "/experience/mathleague-2016",
    "/experience/jhmc",
    "/experience/tmt8-2018",
    "/experience/national-math-olympiad-grade-9",
    "/experience/chien-kuo-gifted-class",
    "/experience/apmoc-apmo-tmo-selection",
    "/research/geometry-covering",
    "/experience/trml-captain-2020-2021",
    "/writing/teaching/taylor-series-video",
    "/experience/ntu-mechanical-engineering",
    "/experience/ntu-civil-engineering",
    "/experience/ntu-mathematics-minor",
    "/experience/ntu-peer-review-sessions",
    "/projects/lkas",
    "/projects/polar-arm",
    "/projects/inventor-system-integration",
    "/experience/joining-ntu-biorola",
    "/research/redrhex",
    "/projects/aero-carrier",
    "/projects/jarvis",
    "/academics/numerical-analysis",
  ]) assert.match(home, new RegExp(route.replaceAll("/", "\\/")));
  assert.doesNotMatch(trajectory, /Six turning points|六個關鍵節點/);
  assert.match(home, /<PortfolioTrajectory locale=\{locale\} items=\{trajectory\} \/>/);
});

test("project evidence comparison uses a guided two-to-three-project workflow and keyboard-safe lenses", async () => {
  const [compare, page] = await Promise.all([
    read("components/ProjectEvidenceCompare.tsx"),
    read("components/PageView.tsx"),
  ]);
  assert.match(compare, /Choose 2–3 projects/);
  assert.match(compare, /選擇 2–3 個專案/);
  assert.match(compare, /items\.slice\(0, Math\.min\(2, items\.length\)\)/);
  assert.match(compare, /role="group"/);
  assert.match(compare, /role="status"/);
  assert.match(compare, /aria-live="polite"/);
  assert.match(compare, /role="tablist"/);
  assert.match(compare, /role="tabpanel"/);
  assert.match(compare, /aria-pressed=\{isSelected\}/);
  assert.match(compare, /selectedIds\.length <= 2/);
  assert.match(compare, /selectedIds\.length >= 3/);
  assert.match(compare, /resetSelection/);
  assert.doesNotMatch(compare, /disabled=\{/);
  assert.match(compare, /event\.key === "ArrowRight"/);
  assert.match(compare, /event\.key === "Home"/);
  assert.match(compare, /event\.key === "End"/);
  assert.doesNotMatch(compare, /setInterval|setTimeout/);
  for (const section of ["question-constraints", "role-system", "turning-point", "evaluation", "next"]) {
    assert.match(page, new RegExp(`section\\("${section}"\\)`));
  }
  for (const route of ["/projects/aero-carrier", "/projects/jarvis", "/projects/lkas", "/projects/inventor-system-integration", "/projects/polar-arm"]) {
    assert.match(page, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(page, /<ProjectEvidenceCompare locale=\{locale\} items=\{comparisonItems\} \/>/);
});

test("portfolio constellation visualizes only documented relationships with manual controls", async () => {
  const [constellation, archive] = await Promise.all([
    read("components/PortfolioConstellation.tsx"),
    read("components/PortfolioArchivePage.tsx"),
  ]);
  assert.match(constellation, /role="listbox"/);
  assert.match(constellation, /role="option"/);
  assert.match(constellation, /aria-selected=\{selected\}/);
  assert.match(constellation, /event\.key === "ArrowRight"/);
  assert.match(constellation, /event\.key === "Home"/);
  assert.match(constellation, /event\.key === "End"/);
  assert.match(constellation, /globalThis\.crypto\?\.getRandomValues/);
  assert.match(constellation, /const emphasized = visible && edgeIsActive/);
  assert.match(constellation, /const contextual = filter !== "all" && !focused && contextualIds\.has\(item\.id\)/);
  assert.match(constellation, /const availableFilters = filters\.filter/);
  assert.match(constellation, /getBoundingClientRect\(\)/);
  assert.match(constellation, /panelTitle\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(constellation, /item\.labelPlacement \? ` label-\$\{item\.labelPlacement\}`/);
  assert.match(constellation, /activeConnections\.map\(\(item\) => <button/);
  assert.match(constellation, /No directly related entries appear in this view/);
  assert.match(constellation, /disabled=\{focusedItems\.length < 2\}/);
  assert.doesNotMatch(constellation, /setInterval|setTimeout|requestAnimationFrame|<canvas|<svg/);
  assert.match(archive, /entity\.relatedRoutes\.filter\(\(route\) => constellationRoutes\.has\(route\)\)/);
  assert.match(archive, /adjacency\.get\(connected\.id\)\?\.add\(entity\.id\)/);
  assert.match(archive, /qingshui-science-outreach[^\n]+labelPlacement: "above"/);
  assert.match(archive, /ntu-civil-night-vocalist[^\n]+labelPlacement: "above"/);
  assert.match(archive, /chien-kuo-chorus-best-soloist[^\n]+labelPlacement: "below"/);
  for (const route of [
    "/research/redrhex",
    "/projects/jarvis",
    "/academics/numerical-analysis",
    "/experience/qingshui-science-outreach",
    "/experience/ntu-civil-night-vocalist",
    "/experience/ntu-mechanical-baseball-team",
  ]) assert.match(archive, new RegExp(route.replaceAll("/", "\\/")));
  assert.match(archive, /<PortfolioConstellation locale=\{locale\} items=\{constellationItems\} \/>/);
});

test("portfolio cinema keeps all existing films click-to-load and keyboard navigable", async () => {
  const [cinema, home, player] = await Promise.all([
    read("components/PortfolioCinema.tsx"),
    read("components/HomePage.tsx"),
    read("components/YouTubeEmbed.tsx"),
  ]);
  assert.match(cinema, /role="tablist"/);
  assert.match(cinema, /role="tabpanel"/);
  assert.match(cinema, /event\.key === "ArrowRight"/);
  assert.match(cinema, /event\.key === "Home"/);
  assert.match(cinema, /event\.key === "End"/);
  assert.match(cinema, /globalThis\.crypto\?\.getRandomValues/);
  assert.match(cinema, /<YouTubeEmbed video=\{active\.video\}/);
  assert.doesNotMatch(cinema, /setInterval|setTimeout|autoplay/);
  assert.match(home, /videos\.map\(\(video\) =>/);
  assert.match(home, /<PortfolioCinema locale=\{locale\} items=\{cinemaItems\} \/>/);
  assert.match(player, /useState<PlayerState>\("idle"\)/);
  assert.match(player, /youtube-nocookie\.com/);
});

test("electronic contact card is privacy-gated, session-aware, and mobile-safe", async () => {
  const [card, trustedAccess, footer, trusted, page, css] = await Promise.all([
    read("components/ElectronicContactCard.tsx"),
    read("components/TrustedAccess.tsx"),
    read("components/SiteFooter.tsx"),
    read("components/TrustedPage.tsx"),
    read("components/PageView.tsx"),
    read("app/globals.css"),
  ]);

  assert.match(card, /fetch\("\/api\/trusted\/contact-card"/);
  assert.match(card, /credentials: "same-origin"/);
  assert.match(card, /cache: "no-store"/);
  assert.match(card, /expiresAt/);
  assert.match(card, /window\.setTimeout\(lockImmediately, remaining\)/);
  assert.match(card, /visibilitychange/);
  assert.match(card, /window\.addEventListener\("focus", recheck\)/);
  assert.match(card, /\/api\/trusted\/contact-card\/qr/);
  assert.match(card, /\/api\/trusted\/contact-card\/vcard/);
  assert.doesNotMatch(card, /localStorage|sessionStorage|IndexedDB|window\.location\.assign\(profile\.phone\.href\)/);
  assert.doesNotMatch(card, /886903202825|JasonLiaoJCS|jason\.liao_ck326|chih-hsiang-jason-liao|jasonliao-pages/);

  assert.match(footer, /isHome/);
  assert.match(footer, /professional-contact-card/);
  assert.match(page, /placement="contact"/);
  assert.match(trusted, /placement="trusted"/);
  assert.match(css, /\.contact-pass \{/);
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*\.contact-pass__body/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.contact-pass__actions/);
  assert.match(css, /@media \(max-width: 360px\)[\s\S]*\.contact-pass__networks/);
  assert.match(css, /@media \(hover:none\), \(pointer:coarse\)[\s\S]*transform: none !important/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.contact-pass__orbit/);
  assert.match(trustedAccess, /navigateAfterTrustedLogin\(safeRedirect\(redirectTo, "\/trusted"\)\)/);
  assert.match(trustedAccess, /destination\.pathname === window\.location\.pathname/);
  assert.match(trustedAccess, /window\.history\.replaceState/);
  assert.match(trustedAccess, /window\.location\.reload\(\)/);
});
