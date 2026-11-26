"use client";

import { primaryButtonClass } from "@/components/styles";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-10">
      <h1 className="font-serif text-3xl">Something went wrong</h1>
      <p className="text-muted">The page could not load. Try again.</p>
      <button type="button" onClick={reset} className={primaryButtonClass}>
        Try again
      </button>
    </div>
  );
}
