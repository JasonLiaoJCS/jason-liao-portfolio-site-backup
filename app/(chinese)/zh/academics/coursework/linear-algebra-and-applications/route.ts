import { redirectPermanently } from "@/lib/legacy-route";
export function GET(request: Request) { return redirectPermanently(request, "/zh/academics/linear-algebra-fft"); }
