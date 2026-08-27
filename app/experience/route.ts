export function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/updates";
  return Response.redirect(url, 301);
}
