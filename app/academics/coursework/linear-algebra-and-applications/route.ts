import { redirectPermanently } from "@/lib/legacy-route";
export function GET(request: Request) { return redirectPermanently(request, "/academics/linear-algebra-fft"); }
