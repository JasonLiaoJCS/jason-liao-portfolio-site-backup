import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("responsive images reserve their real ratio and keep explicit loading priority", async () => {
  const source = await read("components/ResponsiveAssetImage.tsx");

  assert.match(source, /style=\{\{ aspectRatio: `\$\{width\} \/ \$\{height\}` \}\}/);
  assert.match(source, /width=\{width\}/);
  assert.match(source, /height=\{height\}/);
  assert.match(source, /loading=\{eager \? "eager" : "lazy"\}/);
  assert.match(source, /fetchPriority=\{eager \? "high" : "auto"\}/);
  assert.doesNotMatch(source, /sizes=/);
  assert.doesNotMatch(source, /\b\d+w(?:,|\s)/);
});

test("media surfaces preserve complete documents and fixed video geometry", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.responsive-picture \{[\s\S]*?display: block;[\s\S]*?max-width: 100%;[\s\S]*?\}/);
  assert.match(css, /\.document-card__cover img \{[^}]*object-fit: contain;/);
  assert.match(css, /\.video-frame \{[^}]*aspect-ratio: 16 \/ 9;[^}]*contain: layout paint;/);
  assert.match(css, /\.video-frame iframe \{[^}]*position: absolute;[^}]*inset: 0;/);
  assert.match(css, /\.video-poster \{[^}]*position: absolute;[^}]*inset: 0;/);
});

test("responsive rules keep six method steps readable without breakpoint drift", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.hero__method-line \{[^}]*grid-template-columns: repeat\(6, minmax\(0,1fr\)\);/);
  assert.match(css, /\.hero__method-line::after \{[\s\S]*?animation: method-guide 12s var\(--ease-premium\) infinite;/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*?\.hero__method-line \{ grid-template-columns: repeat\(2,minmax\(0,1fr\)\); \}/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*?\.hero__method-line::after \{ display: none; \}/);
  assert.match(css, /\.hero__method-line > span:nth-child\(-n\+4\) \{ border-bottom:/);
  assert.equal((css.match(/@media \(max-width: 1050px\)/g) ?? []).length, 1);
  assert.equal((css.match(/@media \(max-width: 720px\)/g) ?? []).length, 1);
  assert.equal((css.match(/@media \(max-width: 560px\)/g) ?? []).length, 1);
});

test("trusted review actions stay top-aligned when logout reserves status space", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.trusted-hero-actions \{[^}]*align-items: flex-start;[^}]*margin-top: 30px;/);
  assert.match(css, /\.trusted-logout-control__status \{[^}]*min-height: 18px;/);
});

test("multi-row step controls retire one-dimensional progress lines", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.process-lab__tabs::after \{[^}]*height: var\(--process-progress,16\.666%\);/);
  assert.match(css, /@media \(max-width: 840px\)[\s\S]*?\.process-lab__tabs \{[^}]*grid-template-columns: repeat\(3,minmax\(0,1fr\)\);[^}]*\}[\s\S]*?\.process-lab__tabs::after \{ display: none; \}/);
  assert.match(css, /\.process-lab__tab\.is-active::before \{ opacity: 1; \}/);
  assert.doesNotMatch(css, /@media \(max-width: 840px\)[\s\S]*?\.process-lab__tabs::after \{[^}]*width: var\(--process-progress/);
});

test("bilingual type and reduced-motion states retain readable geometry", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /html\[lang="zh-Hant"\][^{]*\{[\s\S]*?line-break: strict;[\s\S]*?overflow-wrap: anywhere;/);
  assert.doesNotMatch(css, /home-human-note__copy \.eyebrow \{[^}]*font-size: 7px;/);
  assert.doesNotMatch(css, /hero__portrait-caption span:last-child \{[^}]*font-size: 8px;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.video-poster:hover \.video-play, \.video-poster:focus-visible \.video-play \{ transform: translate\(-50%, -50%\) !important; \}/);
});

test("the portrait mark preserves its centered crop without a dark seam", async () => {
  const css = await read("app/globals.css");
  const navigation = await read("components/Navigation.tsx");
  const home = await read("components/HomePage.tsx");

  assert.match(navigation, /<BrandLogo className="brand__mark-logo" decorative eager \/>/);
  assert.match(home, /<BrandLogo className="hero__brand-seal-logo" decorative eager \/>/);
  assert.match(css, /\.hero__brand-seal::after \{[\s\S]*?border-radius: inherit;[\s\S]*?background: linear-gradient/);
  assert.doesNotMatch(css, /\.hero__brand-seal::after \{[^}]*border:\s*1px/);
  assert.match(css, /\.brand__mark \.brand__mark-logo img \{[\s\S]*?clip-path: inset\(0 0 33\.594% 0\);/);
  assert.match(css, /\.hero__brand-seal \{[\s\S]*?top: 30px;[\s\S]*?left: -12px;[\s\S]*?width: 96px;[\s\S]*?height: 96px;[\s\S]*?border-radius: 27px;/);
  assert.match(css, /\.hero__brand-seal \.hero__brand-seal-logo \{[^}]*background: rgb\(26 23 26\);/);
  assert.match(css, /\.hero__brand-seal \.hero__brand-seal-logo img \{[\s\S]*?top: -23\.729%;[\s\S]*?left: -42\.373%;[\s\S]*?width: 173\.559%;[\s\S]*?clip-path: inset\(0 0 33\.594% 0\);/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*?\.hero__brand-seal \{ top: 24px; left: -2px; width: 78px; height: 78px; border-radius: 23px; \}/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*?\.hero__brand-seal \{ top: 24px; left: -2px; width: 70px; height: 70px; border-radius: 20px; \}/);
});

test("grid media never escapes into adjacent text or hidden archive content", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.home-human-note__media picture \{[^}]*min-width: 0;[^}]*max-width: 100%;[^}]*overflow: hidden;/);
  assert.match(css, /\.home-academic-card__visual picture \{[^}]*min-width: 0;[^}]*max-width: 100%;[^}]*overflow: hidden;/);
  assert.match(css, /\.archive-record-card__media picture \{[^}]*min-width: 0;[^}]*max-width: 100%;[^}]*overflow: hidden;/);
  assert.match(css, /\.archive-record-card__media > img \{[^}]*position: absolute;[^}]*inset: 0;[^}]*min-height: 0;[^}]*max-height: 100%;/);
  assert.match(css, /\.case-card__media \{[^}]*--media-inset:/);
  assert.match(css, /\.case-card__media > \.responsive-picture \{[^}]*aspect-ratio: auto !important;/);
  assert.match(css, /\.case-card__media > \.responsive-picture,[\s\S]*?\.case-card__media > img \{[^}]*inset: 0;[^}]*width: 100%;[^}]*height: 100%;[^}]*padding: var\(--media-inset\);[^}]*box-sizing: border-box;/);
  assert.match(css, /\.archive-stage:not\(\[open\]\) > \.archive-stage__body \{ display: none; \}/);
  assert.doesNotMatch(css, /grid-auto-flow:\s*dense/);
});

test("narrow layouts stack before headings become unreadable", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.archive-identity \{[^}]*grid-template-columns: minmax\(0,1fr\);/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.site-footer__sitemap \{[^}]*grid-template-columns: repeat\(2,minmax\(0,1fr\)\);/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.site-footer__identity \{[^}]*grid-column: 1 \/ -1;/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*?\.case-card--index \{ grid-template-columns: minmax\(0,1fr\);/);
  assert.match(css, /@media \(max-width: 380px\)[\s\S]*?\.process-lab__tabs \{ grid-template-columns: minmax\(0,1fr\); \}/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.course-record-page \.course-record-download-card \{ grid-template-columns: minmax\(0,1fr\); \}/);
});

test("the course-record outline scrolls away on a solid premium surface", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.course-record-page \.course-record-outline \{[\s\S]*?position: relative;[\s\S]*?top: auto;[\s\S]*?background: #101520;/);
  assert.doesNotMatch(css, /\.course-record-outline \{[^}]*position:\s*sticky;/);
  assert.match(css, /#record-highlights, #capability-map, #semester-record, #record-method/);
});

test("decorative outlines remain continuous and evenly weighted", async () => {
  const css = await read("app/globals.css");
  const explorer = await read("components/GuidedExplorer.tsx");

  assert.match(css, /\.guided-explorer-dialog \{[^}]*max-height: none;[^}]*overflow: hidden;/);
  assert.match(css, /\.guided-explorer-dialog__panel \{[^}]*overflow: hidden;[^}]*grid-template-rows: auto minmax\(0,1fr\);/);
  assert.match(css, /\.guided-explorer-dialog__scroll \{[^}]*overflow: auto;[^}]*scrollbar-gutter: stable;/);
  assert.match(explorer, /className="guided-explorer-dialog__scroll"/);
  assert.match(css, /\.hero__portrait-stage::after \{ content: none; \}/);
  assert.match(css, /\.landing-outline__inner \{[^}]*width: min\(calc\(100% - 48px\), var\(--max\)\);/);
  assert.match(css, /\.case-card--index\.case-card--without-media \{[^}]*grid-template-columns: minmax\(0,1fr\);/);
  assert.match(css, /\.course-record-hero__folio \{[^}]*background: linear-gradient\(145deg, #1b2230, #111722\);/);
  assert.match(css, /\.home-leadership-intro__heading h2 \{ font-size: clamp\(34px,10\.5vw,44px\); \}/);
  assert.doesNotMatch(css, /\.course-record-award \{[^}]*box-shadow:[^}]*inset 3px 0/);
  assert.doesNotMatch(css, /\.course-record-strength-card--primary \{[^}]*box-shadow:[^}]*inset 0 2px/);
});

test("the complete course record remains a prominent responsive action", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.academic-record-context__link \{[\s\S]*?min-height: 58px;[\s\S]*?border-radius: 999px;[\s\S]*?linear-gradient\(135deg, #edcb91, #d9ab61 70%, #ca9445\);/);
  assert.match(css, /@media \(max-width: 1050px\)[\s\S]*?\.academic-record-context__link \{[\s\S]*?width: min\(420px, calc\(100% - 24px\)\);[\s\S]*?justify-self: end;/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*?\.academic-record-context__link \{[\s\S]*?width: auto;[\s\S]*?justify-self: stretch;/);
});

test("progressive motion never hides content when motion, scripting, or print support is limited", async () => {
  const [experience, css] = await Promise.all([
    read("components/SiteExperience.tsx"),
    read("app/globals.css"),
  ]);
  assert.match(experience, /"IntersectionObserver" in window/);
  assert.match(experience, /reduceMotion\.matches/);
  assert.match(experience, /revealEverything\(\)/);
  assert.match(experience, /observer\?\.unobserve\(entry\.target\)/);
  assert.match(experience, /observer\?\.disconnect\(\)/);
  assert.match(experience, /window\.removeEventListener\("pointermove"/);
  assert.match(experience, /data-reveal-state/);
  assert.match(experience, /element\.dataset\.revealState !== "visible"/);
  assert.doesNotMatch(experience, /classList\.add\("is-revealed"\)/);
  assert.match(css, /html\.motion-ready \[data-reveal\]\[data-reveal-state="visible"\]/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?html\.motion-ready \[data-reveal\][\s\S]*?opacity: 1 !important;[\s\S]*?transform: none !important;/);
  assert.match(css, /@media print[\s\S]*?html\.motion-ready \[data-reveal\] \{ opacity: 1 !important; transform: none !important; \}/);
  assert.doesNotMatch(css, /html\.motion-ready\s+(?:body|main|\.site-header)[^{]*\{[^}]*transform:/);
});

test("the evidence atlas becomes a stacked, non-overlapping mobile interface", async () => {
  const css = await read("app/globals.css");
  assert.match(css, /\.capability-atlas__body \{[^}]*grid-template-columns: minmax\(560px,1\.12fr\) minmax\(360px,\.88fr\);/);
  assert.match(css, /@media \(max-width: 1280px\)[\s\S]*?\.capability-atlas__body \{ grid-template-columns: minmax\(0,1fr\); \}/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.capability-atlas__nodes \{[^}]*grid-template-columns: repeat\(2,minmax\(0,1fr\)\);/);
  assert.match(css, /\.capability-atlas__node-slot--5 \{ grid-column: 1 \/ -1; \}/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*?\.review-trail__columns \{ grid-template-columns: minmax\(0,1fr\); \}/);
});

test("the evidence atlas uses one five-part geometry for nodes and pointer", async () => {
  const [atlas, css] = await Promise.all([
    read("components/CapabilityAtlas.tsx"),
    read("app/globals.css"),
  ]);
  assert.match(atlas, /capability-atlas__indicator-rotor/);
  assert.match(atlas, /capability-atlas__node-slot/);
  assert.match(atlas, /capability-atlas__node-anchor/);
  for (const [index, angle] of [[2, 72], [3, 144], [4, 216], [5, 288]]) {
    assert.match(css, new RegExp(`\\.capability-atlas__node-slot--${index} \\{[^}]*--atlas-node-angle: ${angle}deg;`));
  }
  for (const [state, angle] of [["theory", 72], ["validation", 144], ["systems", 216], ["collaboration", 288]]) {
    assert.match(css, new RegExp(`\\.capability-atlas--${state} \\{[^}]*--atlas-angle: ${angle}deg;`));
  }
  assert.match(css, /repeating-conic-gradient\(from -\.75deg,[^;]*72deg\)/);
});

test("premium motion remains decorative, responsive, and content-safe", async () => {
  const [experience, atlas, process, css] = await Promise.all([
    read("components/SiteExperience.tsx"),
    read("components/CapabilityAtlas.tsx"),
    read("components/ProcessLab.tsx"),
    read("app/globals.css"),
  ]);
  const revealSelector = experience.slice(experience.indexOf("const REVEAL_SELECTOR"), experience.indexOf("const SURFACE_SELECTOR"));
  assert.doesNotMatch(revealSelector, /"\.capability-atlas",/);
  assert.match(experience, /groupCounts/);
  assert.match(experience, /--hero-frame-x/);
  assert.match(experience, /reduceMotion\.addEventListener\("change"/);
  assert.match(atlas, /capability-atlas__indicator/);
  assert.doesNotMatch(atlas, /key=\{active\.id\}/);
  assert.match(process, /--process-progress/);
  assert.match(process, /process-lab__panel-sheen/);
  assert.doesNotMatch(process, /key=\{activeIndex\}/);
  assert.match(css, /@view-transition \{ navigation: auto; \}/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.capability-atlas__orbit,\.capability-atlas__sweep,\.capability-atlas__indicator-rotor \{ display: none; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero__method-line::after,\.process-lab__panel-sheen,[^{]*\{ display: none !important; \}/);
});

test("pointer depth is restrained, delegated once, and isolated from fragile interfaces", async () => {
  const [experience, css] = await Promise.all([
    read("components/SiteExperience.tsx"),
    read("app/globals.css"),
  ]);
  const depthSelector = experience.slice(experience.indexOf("const DEPTH_SELECTOR"), experience.indexOf("const MAGNETIC_SELECTOR"));
  const magneticSelector = experience.slice(experience.indexOf("const MAGNETIC_SELECTOR"), experience.indexOf("const DIRECTIONAL_SELECTOR"));
  const exclusionSelector = experience.slice(experience.indexOf("const MOTION_EXCLUSION_SELECTOR"), experience.indexOf("const clampMotion"));

  assert.match(depthSelector, /"a\.case-card"/);
  assert.match(depthSelector, /"a\.home-academic-card"/);
  assert.match(depthSelector, /"a\.archive-record-card"/);
  assert.match(depthSelector, /"a\.longform-next__card"/);
  assert.doesNotMatch(depthSelector, /document-card|capability-atlas|portfolio-constellation|site-header|mobile-nav|dialog|"form"/);
  assert.match(magneticSelector, /"\.button"/);
  assert.match(exclusionSelector, /"\.site-header"/);
  assert.match(exclusionSelector, /"\.guided-explorer-dialog"/);
  assert.match(exclusionSelector, /"\.capability-atlas"/);
  assert.match(exclusionSelector, /"\.portfolio-constellation__experience"/);
  assert.match(exclusionSelector, /"dialog"/);
  assert.match(exclusionSelector, /"form"/);

  assert.equal((experience.match(/addEventListener\("pointermove"/g) ?? []).length, 1);
  assert.equal((experience.match(/removeEventListener\("pointermove"/g) ?? []).length, 1);
  assert.match(experience, /window\.requestAnimationFrame/);
  assert.match(experience, /pointerFrame = 0;/);
  assert.match(experience, /event\.pointerType !== "mouse"/);
  assert.match(experience, /window\.innerWidth >= 761/);
  assert.match(experience, /!forcedColors\.matches/);
  assert.match(experience, /clampMotion\(offsetX, -4, 4\)/);
  assert.match(experience, /clampMotion\(offsetY, -3\.2, 3\.2\)/);
  assert.match(experience, /const rotateAngle = Math\.min\(rawRotateAngle, 2\.25\);/);
  assert.match(experience, /window\.addEventListener\("pointercancel", resetInteractiveMotion/);
  assert.match(experience, /window\.addEventListener\("pagehide", hardResetInteractiveMotion/);
  assert.match(experience, /window\.addEventListener\("pageshow", onPageShow\)/);
  assert.match(experience, /document\.addEventListener\("pointerdown", hardResetInteractiveMotion, \{ capture: true, passive: true \}\)/);
  assert.match(experience, /event\.pointerType !== "mouse" && root\.classList\.contains\("has-pointer-signal"\)/);
  assert.doesNotMatch(experience, /addEventListener\("click"|preventDefault\(|style\.transform|setInterval\(/);

  assert.match(css, /@media \(min-width: 761px\) and \(hover: hover\) and \(pointer: fine\)[\s\S]*?html\.has-fine-pointer \[data-motion-depth="active"\] \{[\s\S]*?rotate: var\(--depth-rotate,0deg\);[\s\S]*?scale: var\(--depth-scale,1\);/);
  assert.match(css, /html\.has-fine-pointer \[data-motion-magnetic="active"\] \{[\s\S]*?translate: var\(--magnetic-x,0px\) var\(--magnetic-y,0px\);/);
  assert.match(css, /html\.has-fine-pointer \[data-motion-directional="active"\] \{[\s\S]*?translate: var\(--direction-x,0px\) var\(--direction-y,0px\);/);
  assert.doesNotMatch(css, /html\.has-fine-pointer \[data-motion-depth\] \{[^}]*transform-style: preserve-3d/);
  assert.match(css, /html\.motion-resetting \[data-motion-depth\],[\s\S]*?transition: none !important;[\s\S]*?translate: none !important;/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\[data-motion-depth\],\[data-motion-magnetic\],\[data-motion-directional\] \{ translate: none !important; rotate: none !important; scale: none !important; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\[data-motion-depth\],\[data-motion-magnetic\],\[data-motion-directional\] \{ translate: none !important; rotate: none !important; scale: none !important; \}/);
  assert.match(css, /@media \(forced-colors: active\)[\s\S]*?\[data-motion-depth\],\[data-motion-magnetic\],\[data-motion-directional\] \{ translate: none !important; rotate: none !important; scale: none !important; \}/);
  assert.match(css, /@media print[\s\S]*?\[data-motion-depth\],\[data-motion-magnetic\],\[data-motion-directional\] \{ translate: none !important; rotate: none !important; scale: none !important; \}/);
});

test("the periodized trajectory and evidence comparison remain stable across narrow layouts and reduced motion", async () => {
  const [trajectory, compare, experience, css] = await Promise.all([
    read("components/PortfolioTrajectory.tsx"),
    read("components/ProjectEvidenceCompare.tsx"),
    read("components/SiteExperience.tsx"),
    read("app/globals.css"),
  ]);
  const revealSelector = experience.slice(experience.indexOf("const REVEAL_SELECTOR"), experience.indexOf("const SURFACE_SELECTOR"));
  assert.doesNotMatch(revealSelector, /portfolio-trajectory|project-compare/);
  assert.doesNotMatch(trajectory, /useState|role="tabpanel"/);
  assert.doesNotMatch(compare, /<div[^>]*project-compare__stage[^>]*key=/);
  assert.match(css, /\.portfolio-trajectory__period \{[^}]*grid-template-columns: var\(--trajectory-date-column\) var\(--trajectory-marker-column\) minmax\(0,1fr\);/);
  assert.match(css, /\.portfolio-trajectory__entries \{[\s\S]*?grid-template-columns: repeat\(2,minmax\(0,1fr\)\);/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.portfolio-trajectory__period \{[^}]*grid-template-columns: var\(--trajectory-marker-column\) minmax\(0,1fr\);[^}]*grid-template-areas: "marker date" "marker content";/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.portfolio-trajectory__entries \{ grid-template-columns: minmax\(0,1fr\); \}/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.portfolio-trajectory__entry a \{ grid-template-columns: 21px minmax\(0,1fr\) auto;/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.project-compare__columns \{ grid-template-columns: minmax\(0,1fr\); \}/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.project-compare__dimensions button:nth-child\(n\+3\) \{ border-top: 1px solid rgba\(255,255,255,\.075\); \}/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.project-compare__chooser \{[^}]*display: flex;[^}]*overflow-x: auto;[^}]*scroll-snap-type: x proximity;/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.project-compare__dimensions \{[^}]*display: flex;[^}]*overflow-x: auto;[^}]*scroll-snap-type: x proximity;/);
  assert.match(css, /#selected-work, #landing-visuals, #page-overview, #all-records, #project-comparison \{ scroll-margin-top: 96px; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.portfolio-trajectory__scan,[^}]*display: none !important;/);
  assert.match(css, /@media print[\s\S]*?\.portfolio-trajectory__period \{ break-inside: avoid; \}/);
  assert.match(css, /\.portfolio-trajectory__scan \{[\s\S]*?pointer-events: none;/);
  assert.match(css, /\.portfolio-trajectory__entry-copy strong \{[\s\S]*?overflow-wrap: anywhere;/);
});

test("constellation and cinema stay contained across motion, mobile, forced colors, and print", async () => {
  const [experience, constellation, css] = await Promise.all([
    read("components/SiteExperience.tsx"),
    read("components/PortfolioConstellation.tsx"),
    read("app/globals.css"),
  ]);
  const revealSelector = experience.slice(experience.indexOf("const REVEAL_SELECTOR"), experience.indexOf("const SURFACE_SELECTOR"));
  assert.doesNotMatch(revealSelector, /portfolio-constellation|portfolio-cinema/);
  assert.match(constellation, /function cssPercent/);
  assert.match(constellation, /toFixed\(4\)/);
  assert.match(css, /\.portfolio-constellation__experience \{[^}]*align-items: start;/);
  assert.match(css, /\.portfolio-constellation__canvas \{[\s\S]*?width: 100%;[\s\S]*?max-width: 100%;[\s\S]*?align-self: start;[\s\S]*?aspect-ratio: 1000 \/ 700;[\s\S]*?overflow: hidden;[\s\S]*?contain: layout paint;/);
  assert.match(css, /\.portfolio-constellation__edge \{[^}]*opacity: 0;/);
  assert.match(css, /\.portfolio-constellation__node\.is-context \{/);
  assert.match(css, /\.portfolio-constellation__related button \{[^}]*min-height: 44px;/);
  assert.match(css, /@media \(max-width: 1180px\)[\s\S]*?\.portfolio-constellation__experience \{ grid-template-columns: minmax\(0,1fr\); \}/);
  assert.match(css, /\.portfolio-cinema__stage \{[^}]*overflow: hidden;[^}]*grid-template-columns: minmax\(0,1\.56fr\) minmax\(300px,\.44fr\);/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.portfolio-constellation__canvas \{[^}]*aspect-ratio: auto;[^}]*grid-template-columns: repeat\(2,minmax\(0,1fr\)\);/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.portfolio-constellation__canvas \{ grid-template-columns: minmax\(0,1fr\); \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.portfolio-constellation__panel-scan,[^}]*\.portfolio-cinema__scan,[^}]*display: none !important;/);
  assert.match(css, /@media \(forced-colors: active\)[\s\S]*?\.portfolio-constellation__canvas,[^}]*\.portfolio-cinema__stage,[^}]*border: 1px solid CanvasText;/);
  assert.match(css, /@media print[\s\S]*?\.portfolio-constellation__canvas,[^}]*\.portfolio-cinema-section[^}]*display: none !important;/);
});
