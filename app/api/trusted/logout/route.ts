import {
  clearTrustedSessionCookie,
  hasValidTrustedOrigin,
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

  return json(
    { ok: true },
    200,
    { "Set-Cookie": clearTrustedSessionCookie() },
  );
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
