// app/admin/loading.tsx
export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-ivory" aria-live="polite" aria-busy="true">
      <section className="border-b border-charcoal/10 bg-warm-black py-10 text-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-3 w-28 animate-pulse rounded bg-amber/30" />
          <div className="mt-4 h-10 w-72 animate-pulse rounded-lg bg-warm-white/10" />
          <div className="mt-3 h-4 max-w-2xl animate-pulse rounded bg-warm-white/10" />
          <div className="mt-8 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-9 w-28 animate-pulse rounded-full bg-warm-white/10" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-charcoal/10 bg-warm-white p-6">
              <div className="h-4 w-28 animate-pulse rounded bg-charcoal/10" />
              <div className="mt-5 h-8 w-16 animate-pulse rounded bg-charcoal/10" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
