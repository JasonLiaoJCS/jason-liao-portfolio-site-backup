import QRCode from "qrcode";
import { isTrustedSession } from "@/lib/trusted-auth";
import { buildPrivateContactQrVCard } from "@/lib/private-contact-profile";

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

  const svg = await QRCode.toString(buildPrivateContactQrVCard(), {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 360,
    color: {
      dark: "#0a0e17",
      light: "#fffaf0",
    },
  });

  return new Response(svg, {
    status: 200,
    headers: {
      ...privateHeaders("image/svg+xml; charset=utf-8"),
      "Content-Disposition":
        'inline; filename="Chih-Hsiang-Jason-Liao-contact-qr.svg"',
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
