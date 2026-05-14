// app/products/loading.tsx
export default function ProductsLoading() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20" aria-live="polite">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-warm-white/10" />
          <div className="mt-4 h-4 max-w-2xl animate-pulse rounded bg-warm-white/10" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-warm-white/10" />
        </div>
      </section>

      <section className="border-b border-charcoal/10 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-8 w-28 shrink-0 animate-pulse rounded-full bg-charcoal/10"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16" aria-busy="true">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-charcoal/10 bg-ivory/30"
              >
                <div className="aspect-square animate-pulse bg-ivory" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-24 animate-pulse rounded bg-charcoal/10" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-charcoal/10" />
                  <div className="h-4 w-full animate-pulse rounded bg-charcoal/10" />
                  <div className="h-4 w-20 animate-pulse rounded bg-charcoal/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
