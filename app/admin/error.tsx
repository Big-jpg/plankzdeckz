// app/admin/error.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-ivory py-12">
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-charcoal/10 bg-warm-white p-8 text-center shadow-sm shadow-charcoal/5 sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber/10 text-amber">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
            Admin page error
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-charcoal">
            The admin view could not be rendered.
          </h1>
          <p className="mt-4 text-sm leading-6 text-charcoal/65">
            Retry the page before making operational changes. If the error repeats, confirm the
            database connection and required production environment variables.
          </p>

          {error.digest && (
            <p className="mt-4 rounded-lg border border-charcoal/10 bg-ivory/60 px-3 py-2 text-xs text-charcoal/45">
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
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-charcoal/15 px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-charcoal/35 hover:bg-charcoal/5"
            >
              Return to storefront
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
