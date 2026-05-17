// app/error.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="bg-warm-white py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-charcoal/10 bg-ivory/60 p-8 text-center shadow-sm shadow-charcoal/5 sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber/10 text-amber">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
            Something went wrong
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            This page could not be rendered safely.
          </h1>
          <p className="mt-4 text-sm leading-6 text-charcoal/65">
            The storefront has stopped this view before showing incomplete information. You can
            retry the render or return to the collection.
          </p>

          {error.digest && (
            <p className="mt-4 rounded-lg border border-charcoal/10 bg-warm-white px-3 py-2 text-xs text-charcoal/45">
              Error reference: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-charcoal px-5 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-lg border border-charcoal/15 px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-charcoal/35 hover:bg-charcoal/5"
            >
              Return to collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
