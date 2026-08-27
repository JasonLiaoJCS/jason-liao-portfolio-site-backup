"use client";

import { ErrorView } from "@/components/ErrorView";

export default function ChineseError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView locale="zh" reset={reset} />;
}
