import { headers } from "next/headers";

export const TRUSTED_SESSION_COOKIE = "__Host-jason_trusted_session";
export const TRUSTED_SESSION_TTL_SECONDS = 8 * 60 * 60;

const PASSWORD_ENV = "TRUSTED_ACCESS_PASSWORD";
const SESSION_SECRET_ENV = "TRUSTED_SESSION_SECRET";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_FAILURES = 5;
const MAX_PASSWORD_LENGTH = 1_024;
const MAX_CLOCK_SKEW_SECONDS = 60;

type SessionPayload = {
  v: 1;
  iat: number;
  exp: number;
  nonce: string;
};

type RateLimitEntry = {
  failures: number;
  resetAt: number;
};

export type LoginRateLimit = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export class TrustedAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrustedAuthConfigurationError";
  }
}

const globalRateLimit = globalThis as typeof globalThis & {
  __jasonTrustedLoginRateLimit?: Map<string, RateLimitEntry>;
};

const loginRateLimitStore =
  globalRateLimit.__jasonTrustedLoginRateLimit ??
  (globalRateLimit.__jasonTrustedLoginRateLimit = new Map());

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function verifyTrustedPassword(
  submittedPassword: string,
): Promise<boolean> {
  if (
    typeof submittedPassword !== "string" ||
    submittedPassword.length > MAX_PASSWORD_LENGTH
  ) {
    return false;
  }

  const expectedPassword = requiredPassword();
  const [submittedDigest, expectedDigest] = await Promise.all([
    sha256(encoder.encode(submittedPassword)),
    sha256(encoder.encode(expectedPassword)),
  ]);

  return constantTimeEqual(submittedDigest, expectedDigest);
}

export async function createTrustedSessionToken(
  now = Date.now(),
): Promise<string> {
  const issuedAt = Math.floor(now / 1000);
  const payload: SessionPayload = {
    v: 1,
    iat: issuedAt,
    exp: issuedAt + TRUSTED_SESSION_TTL_SECONDS,
    nonce: randomNonce(),
  };

  const encodedPayload = encodeBase64Url(
    encoder.encode(JSON.stringify(payload)),
  );
  const signature = await sign(encodedPayload);
  return `${encodedPayload}.${encodeBase64Url(signature)}`;
}

export async function verifyTrustedSessionToken(
  token: string | null | undefined,
  now = Date.now(),
): Promise<boolean> {
  return (await verifiedTrustedSessionPayload(token, now)) !== null;
}

async function verifiedTrustedSessionPayload(
  token: string | null | undefined,
  now = Date.now(),
): Promise<SessionPayload | null> {
  if (!token || token.length > 2_048) return null;

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  let suppliedSignature: Uint8Array;
  try {
    suppliedSignature = decodeBase64Url(parts[1]);
  } catch {
    return null;
  }

  const expectedSignature = await sign(parts[0]);
  if (!constantTimeEqual(suppliedSignature, expectedSignature)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(decoder.decode(decodeBase64Url(parts[0]))) as SessionPayload;
  } catch {
    return null;
  }

  const currentTime = Math.floor(now / 1000);
  const valid = (
    payload.v === 1 &&
    Number.isInteger(payload.iat) &&
    Number.isInteger(payload.exp) &&
    typeof payload.nonce === "string" &&
    payload.nonce.length >= 16 &&
    payload.iat <= currentTime + MAX_CLOCK_SKEW_SECONDS &&
    payload.exp > currentTime &&
    payload.exp > payload.iat &&
    payload.exp - payload.iat <= TRUSTED_SESSION_TTL_SECONDS
  );
  return valid ? payload : null;
}

export async function isTrustedSession(
  cookieHeader?: string | null,
): Promise<boolean> {
  return (await trustedSessionExpiration(cookieHeader)) !== null;
}

export async function trustedSessionExpiration(
  cookieHeader?: string | null,
): Promise<number | null> {
  let resolvedCookieHeader = cookieHeader;
  if (resolvedCookieHeader === undefined) {
    const requestHeaders = await headers();
    resolvedCookieHeader = requestHeaders.get("cookie");
  }

  const token = readCookie(resolvedCookieHeader, TRUSTED_SESSION_COOKIE);
  const payload = await verifiedTrustedSessionPayload(token);
  return payload ? payload.exp * 1_000 : null;
}

export function trustedSessionCookie(token: string, now = Date.now()): string {
  const expires = new Date(now + TRUSTED_SESSION_TTL_SECONDS * 1_000);
  return serializeCookie(token, TRUSTED_SESSION_TTL_SECONDS, expires);
}

export function clearTrustedSessionCookie(): string {
  return serializeCookie("", 0, new Date(0));
}

export function hasValidTrustedOrigin(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader || originHeader === "null") return false;

  let suppliedOrigin: string;
  try {
    const parsedOrigin = new URL(originHeader);
    if (parsedOrigin.protocol !== "https:" && parsedOrigin.protocol !== "http:") {
      return false;
    }
    suppliedOrigin = parsedOrigin.origin;
  } catch {
    return false;
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const allowedOrigins = new Set<string>();
  try {
    allowedOrigins.add(new URL(request.url).origin);
  } catch {
    return false;
  }

  const forwardedHost = firstHeaderValue(
    request.headers.get("x-forwarded-host"),
  );
  const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));
  if (host && isSafeHost(host)) {
    const forwardedProtocol = firstHeaderValue(
      request.headers.get("x-forwarded-proto"),
    );
    const protocol =
      forwardedProtocol === "http" || forwardedProtocol === "https"
        ? forwardedProtocol
        : new URL(request.url).protocol.replace(":", "");
    allowedOrigins.add(`${protocol}://${host}`);
  }

  return allowedOrigins.has(suppliedOrigin);
}

export function trustedLoginRateLimit(request: Request): LoginRateLimit {
  cleanupRateLimitStore();
  const entry = loginRateLimitStore.get(rateLimitKey(request));
  if (!entry || entry.resetAt <= Date.now()) {
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_FAILURES,
      retryAfterSeconds: 0,
    };
  }

  const remaining = Math.max(0, RATE_LIMIT_MAX_FAILURES - entry.failures);
  return {
    allowed: entry.failures < RATE_LIMIT_MAX_FAILURES,
    remaining,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((entry.resetAt - Date.now()) / 1_000),
    ),
  };
}

export function recordTrustedLoginFailure(request: Request): LoginRateLimit {
  const key = rateLimitKey(request);
  const now = Date.now();
  const existing = loginRateLimitStore.get(key);
  const entry =
    !existing || existing.resetAt <= now
      ? { failures: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }
      : { ...existing, failures: existing.failures + 1 };

  loginRateLimitStore.set(key, entry);
  return trustedLoginRateLimit(request);
}

export function clearTrustedLoginFailures(request: Request): void {
  loginRateLimitStore.delete(rateLimitKey(request));
}

function requiredPassword(): string {
  const password = process.env[PASSWORD_ENV];
  if (!password) {
    throw new TrustedAuthConfigurationError(
      `${PASSWORD_ENV} must be configured at runtime.`,
    );
  }
  return password;
}

function requiredSessionSecret(): string {
  const secret = process.env[SESSION_SECRET_ENV];
  if (!secret || encoder.encode(secret).byteLength < 32) {
    throw new TrustedAuthConfigurationError(
      `${SESSION_SECRET_ENV} must contain at least 32 UTF-8 bytes.`,
    );
  }
  return secret;
}

async function sha256(value: Uint8Array): Promise<Uint8Array> {
  const input = new Uint8Array(value.byteLength) as Uint8Array<ArrayBuffer>;
  input.set(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", input));
}

async function sign(value: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(requiredSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(value)),
  );
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return difference === 0;
}

function randomNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return encodeBase64Url(bytes);
}

function encodeBase64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function decodeBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) {
    throw new Error("Invalid base64url value.");
  }

  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + padding);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function serializeCookie(
  value: string,
  maxAge: number,
  expires: Date,
): string {
  return [
    `${TRUSTED_SESSION_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    `Expires=${expires.toUTCString()}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

function readCookie(
  cookieHeader: string | null | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  for (const segment of cookieHeader.split(";")) {
    const separator = segment.indexOf("=");
    if (separator < 0) continue;
    if (segment.slice(0, separator).trim() === name) {
      return segment.slice(separator + 1).trim();
    }
  }
  return null;
}

function rateLimitKey(request: Request): string {
  const address =
    firstHeaderValue(request.headers.get("cf-connecting-ip")) ??
    firstHeaderValue(request.headers.get("x-real-ip")) ??
    firstHeaderValue(request.headers.get("x-forwarded-for"));

  if (address) return `ip:${address.toLowerCase().slice(0, 128)}`;
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return `fallback:${userAgent.slice(0, 160)}`;
}

function cleanupRateLimitStore(): void {
  if (loginRateLimitStore.size < 1_000) return;
  const now = Date.now();
  for (const [key, entry] of loginRateLimitStore) {
    if (entry.resetAt <= now) loginRateLimitStore.delete(key);
  }
}

function firstHeaderValue(value: string | null): string | null {
  const firstValue = value?.split(",", 1)[0]?.trim();
  return firstValue || null;
}

function isSafeHost(host: string): boolean {
  return (
    host.length <= 255 &&
    !/[\s\\/@]/u.test(host) &&
    /^[A-Za-z0-9.:[\]-]+$/u.test(host)
  );
}
