export function canonicalExplorerPath(path: string) {
  const pathname = path.split(/[?#]/u, 1)[0] ?? "/";
  const withoutLocale = pathname.replace(/^\/(?:zh|en)(?=\/|$)/, "");
  const withoutTrailingSlash = withoutLocale.replace(/\/+$/u, "");
  return withoutTrailingSlash || "/";
}

export function normalizeSurpriseRoutes(routes: readonly string[]) {
  return Array.from(new Set(
    routes
      .map(canonicalExplorerPath)
      .filter((route) => route.startsWith("/") && route !== "/trusted"),
  ));
}

export function surpriseCandidates(routes: readonly string[], currentPath: string) {
  const normalized = normalizeSurpriseRoutes(routes);
  const current = canonicalExplorerPath(currentPath);
  const alternatives = normalized.filter((route) => route !== current);

  // Avoid a no-op navigation when the current page belongs to the public pool.
  // Apart from that one exclusion, every canonical public page remains eligible
  // on every click with exactly the same probability.
  return alternatives.length ? alternatives : normalized;
}

export function secureRandomIndex(size: number) {
  if (!Number.isSafeInteger(size) || size <= 1) return 0;
  const fullRange = 0x1_0000_0000;
  const unbiasedLimit = fullRange - (fullRange % size);
  const value = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(value);
  } while (value[0] >= unbiasedLimit);
  return value[0] % size;
}

export function chooseSurpriseRoute(
  routes: readonly string[],
  currentPath: string,
  randomValue?: number,
) {
  const candidates = surpriseCandidates(routes, currentPath);
  if (!candidates.length) return "/";
  if (randomValue === undefined) return candidates[secureRandomIndex(candidates.length)];

  const normalized = Number.isFinite(randomValue)
    ? Math.min(0.999_999_999_999, Math.max(0, randomValue))
    : 0;
  return candidates[Math.floor(normalized * candidates.length)];
}
