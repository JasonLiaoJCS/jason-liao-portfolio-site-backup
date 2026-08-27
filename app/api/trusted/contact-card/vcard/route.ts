import { isTrustedSession } from "@/lib/trusted-auth";
import { buildPrivateContactVCard } from "@/lib/private-contact-profile";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request): Promise<Response> {
  const authorized = await isTrustedSession(request.headers.get("cookie"));
  if (!authorized) {
    return new Response("Authentication required.", {
      status: 401,
      headers: privateHeaders("text/plain; charset=utf-8"),
    });
  }

  return new Response(buildPrivateContactVCard(), {
    status: 200,
    headers: {
      ...privateHeaders("text/vcard; charset=utf-8"),
      "Content-Disposition":
        'attachment; filename="Chih-Hsiang-Jason-Liao.vcf"',
    },
  });
}

function privateHeaders(contentType: string): Record<string, string> {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Type": contentType,
    "Cross-Origin-Resource-Policy": "same-origin",
    "Vary": "Cookie",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  };
}
