export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const source = new URL(request.url);
  const target = new URL(`/${slug.join("/")}`, source.origin);
  target.search = source.search;
  return Response.redirect(target, 301);
}
