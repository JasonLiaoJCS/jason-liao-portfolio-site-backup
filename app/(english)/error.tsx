"use client";

import { ErrorView } from "@/components/ErrorView";

export default function EnglishError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView locale="en" reset={reset} />;
}
