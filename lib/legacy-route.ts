export function redirectPermanently(request: Request, pathname: string) {
  const source = new URL(request.url);
  const target = new URL(pathname, source.origin);
  target.search = source.search;
  return Response.redirect(target, 301);
}
