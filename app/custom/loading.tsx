// app/custom/loading.tsx
export default function CustomDesignLoading() {
  return (
    <section className="bg-warm-white py-16 sm:py-20" aria-live="polite" aria-busy="true">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <div className="h-3 w-40 animate-pulse rounded-full bg-amber/30" />
          <div className="mt-6 h-10 w-3/4 animate-pulse rounded-lg bg-charcoal/10" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-charcoal/10" />
          <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-charcoal/10" />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-charcoal/10 bg-ivory/50 p-5">
                <div className="h-4 w-28 animate-pulse rounded bg-charcoal/10" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-charcoal/10" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-charcoal/10" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-charcoal/10 bg-ivory/50 p-6 sm:p-8">
          <div className="h-6 w-48 animate-pulse rounded bg-charcoal/10" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-lg bg-charcoal/10" />
            ))}
          </div>
          <div className="mt-4 h-28 animate-pulse rounded-lg bg-charcoal/10" />
          <div className="mt-5 h-12 animate-pulse rounded-lg bg-charcoal/15" />
        </div>
      </div>
    </section>
  );
}
