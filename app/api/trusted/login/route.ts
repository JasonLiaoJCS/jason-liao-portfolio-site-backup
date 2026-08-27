import {
  TrustedAuthConfigurationError,
  clearTrustedLoginFailures,
  createTrustedSessionToken,
  hasValidTrustedOrigin,
  recordTrustedLoginFailure,
  trustedLoginRateLimit,
  trustedSessionCookie,
  verifyTrustedPassword,
} from "@/lib/trusted-auth";

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store, private",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function POST(request: Request): Promise<Response> {
  if (!hasValidTrustedOrigin(request)) {
    return json({ ok: false, error: "Request rejected." }, 403);
  }

  const currentLimit = trustedLoginRateLimit(request);
  if (!currentLimit.allowed) {
    return json(
      { ok: false, error: "Too many attempts. Please try again later." },
      429,
      { "Retry-After": String(currentLimit.retryAfterSeconds) },
    );
  }

  const submission = await readSubmission(request);
  if (submission === null) {
    return json({ ok: false, error: "A password is required." }, 400);
  }

  try {
    if (!(await verifyTrustedPassword(submission.password))) {
      const nextLimit = recordTrustedLoginFailure(request);
      const status = nextLimit.allowed ? 401 : 429;
      return json(
        {
          ok: false,
          error:
            status === 429
              ? "Too many attempts. Please try again later."
              : "The password is not valid.",
        },
        status,
        status === 429
          ? { "Retry-After": String(nextLimit.retryAfterSeconds) }
          : undefined,
      );
    }

    clearTrustedLoginFailures(request);
    const token = await createTrustedSessionToken();
    if (submission.isForm) {
      return new Response(null, {
        status: 303,
        headers: {
          "Cache-Control": "no-store, private",
          Location: safeRelativeRedirect(submission.redirectTo),
          "Set-Cookie": trustedSessionCookie(token),
          "X-Content-Type-Options": "nosniff",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
    }
    return json(
      { ok: true },
      200,
      { "Set-Cookie": trustedSessionCookie(token) },
    );
  } catch (error) {
    if (error instanceof TrustedAuthConfigurationError) {
      return json(
        { ok: false, error: "Invitation-only access is temporarily unavailable." },
        503,
      );
    }
    throw error;
  }
}

async function readSubmission(request: Request): Promise<{
  password: string;
  redirectTo: string | null;
  isForm: boolean;
} | null> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > 4_096) return null;

  const body = await request.text();
  if (body.length > 4_096) return null;

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  try {
    if (contentType.includes("application/json")) {
      const parsed = JSON.parse(body) as { password?: unknown };
      return typeof parsed.password === "string"
        ? { password: parsed.password, redirectTo: null, isForm: false }
        : null;
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const values = new URLSearchParams(body);
      const password = values.get("password");
      return password === null
        ? null
        : {
            password,
            redirectTo: values.get("redirectTo"),
            isForm: true,
          };
    }
  } catch {
    return null;
  }

  return null;
}

function safeRelativeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/trusted";
  }

  try {
    const parsed = new URL(value, "https://trusted.invalid");
    if (parsed.origin !== "https://trusted.invalid") return "/trusted";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/trusted";
  }
}

function json(
  body: object,
  status: number,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...RESPONSE_HEADERS, ...extraHeaders },
  });
}
