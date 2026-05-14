// app/loading.tsx
export default function Loading() {
  return (
    <section className="bg-warm-white py-16 sm:py-24" aria-live="polite" aria-busy="true">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="h-3 w-36 animate-pulse rounded-full bg-amber/30" />
          <div className="mt-6 h-10 w-3/4 animate-pulse rounded-lg bg-charcoal/10 sm:h-12" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-charcoal/10" />
          <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-charcoal/10" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-charcoal/10 bg-ivory/30"
            >
              <div className="aspect-square animate-pulse bg-ivory" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-charcoal/10" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-charcoal/10" />
                <div className="h-4 w-24 animate-pulse rounded bg-charcoal/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
