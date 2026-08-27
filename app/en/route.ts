export function GET(request: Request) {
  const source = new URL(request.url);
  const target = new URL("/", source.origin);
  target.search = source.search;
  return Response.redirect(target, 301);
}
