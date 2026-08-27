import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const sourceUrl = new URL("../lib/surprise-route.ts", import.meta.url);

async function loadModule() {
  const source = await readFile(sourceUrl, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

test("every public page receives one equal-sized random interval", async () => {
  const { chooseSurpriseRoute, surpriseCandidates } = await loadModule();
  const pool = Array.from({ length: 90 }, (_, index) => `/page-${index + 1}`);
  const current = "/page-18";
  const candidates = surpriseCandidates(pool, current);
  assert.equal(candidates.length, 89);
  assert.ok(!candidates.includes(current));

  const reached = new Set();
  for (let index = 0; index < candidates.length; index += 1) {
    const randomValue = (index + 0.5) / candidates.length;
    const route = chooseSurpriseRoute(pool, current, randomValue);
    assert.equal(route, candidates[index]);
    reached.add(route);
  }
  assert.deepEqual(reached, new Set(candidates));
});

test("localized aliases, query strings, and duplicate routes share one canonical identity", async () => {
  const { canonicalExplorerPath, normalizeSurpriseRoutes, chooseSurpriseRoute } = await loadModule();
  assert.equal(canonicalExplorerPath("/zh/projects/jarvis"), "/projects/jarvis");
  assert.equal(canonicalExplorerPath("/en/projects/jarvis/?view=full#turning-point"), "/projects/jarvis");
  assert.equal(canonicalExplorerPath("/zh"), "/");
  const pool = [
    "/projects/jarvis",
    "/zh/projects/jarvis?view=full",
    "/en/projects/jarvis/",
    "/research/redrhex",
    "/trusted",
  ];
  assert.deepEqual(normalizeSurpriseRoutes(pool), ["/projects/jarvis", "/research/redrhex"]);
  assert.equal(chooseSurpriseRoute(pool, "/zh/projects/jarvis", 0), "/research/redrhex");
});

test("invalid random values are safely clamped without category weighting", async () => {
  const { chooseSurpriseRoute } = await loadModule();
  const pool = ["/research", "/projects", "/academics", "/experience/example"];
  assert.equal(chooseSurpriseRoute(pool, "/current", -1), "/research");
  assert.equal(chooseSurpriseRoute(pool, "/current", Number.NaN), "/research");
  assert.equal(chooseSurpriseRoute(pool, "/current", 9), "/experience/example");
});
