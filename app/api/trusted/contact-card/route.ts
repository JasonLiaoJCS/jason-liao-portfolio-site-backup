import { trustedSessionExpiration } from "@/lib/trusted-auth";
import { privateContactProfile } from "@/lib/private-contact-profile";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Vary": "Cookie",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function GET(request: Request): Promise<Response> {
  const expiresAt = await trustedSessionExpiration(request.headers.get("cookie"));
  if (expiresAt === null) {
    return new Response(JSON.stringify({ authorized: false }), {
      status: 401,
      headers: PRIVATE_HEADERS,
    });
  }

  return new Response(
    JSON.stringify({ authorized: true, expiresAt, profile: privateContactProfile }),
    { status: 200, headers: PRIVATE_HEADERS },
  );
}
