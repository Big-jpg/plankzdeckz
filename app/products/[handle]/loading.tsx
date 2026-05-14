// app/products/[handle]/loading.tsx
export default function ProductDetailLoading() {
  return (
    <>
      <div className="border-b border-charcoal/5 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-4 w-28 animate-pulse rounded bg-charcoal/10" />
        </div>
      </div>

      <section className="bg-warm-white py-8 sm:py-12" aria-live="polite" aria-busy="true">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="aspect-square animate-pulse rounded-2xl bg-ivory/70" />

            <div className="flex flex-col">
              <div className="h-3 w-24 animate-pulse rounded bg-charcoal/10" />
              <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-charcoal/10" />
              <div className="mt-3 h-7 w-32 animate-pulse rounded bg-charcoal/10" />
              <div className="mt-8 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-charcoal/10" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-charcoal/10" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-charcoal/10" />
              </div>

              <div className="mt-8 border-t border-charcoal/10 pt-6">
                <div className="h-5 w-32 animate-pulse rounded bg-charcoal/10" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-10 animate-pulse rounded-lg bg-charcoal/10" />
                  ))}
                </div>
              </div>

              <div className="mt-6 h-12 w-full animate-pulse rounded-lg bg-charcoal/15" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
