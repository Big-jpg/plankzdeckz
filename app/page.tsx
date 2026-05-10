// app/page.tsx
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-charcoal dark:text-ivory">
        Lumenform Studio
      </h1>
      <p className="mt-4 max-w-lg text-center text-lg text-charcoal/70 dark:text-ivory/70">
        Custom lampshades designed for the lights you already own.
      </p>
      <p className="mt-2 text-sm text-charcoal/50 dark:text-ivory/50">
        Phase 0 — Repository bootstrap complete. Storefront coming soon.
      </p>
    </main>
  );
}
