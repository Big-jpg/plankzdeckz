// app/login/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Lumenform Studio account to view orders and manage your profile.",
};

export default function LoginPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-warm-black py-16 text-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sign In</h1>
          <p className="mt-3 text-base text-warm-white/70">
            Access your order history and account settings.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-warm-white py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <Suspense
            fallback={
              <div className="rounded-xl border border-charcoal/10 bg-ivory p-8 text-center">
                <p className="text-sm text-charcoal/50">Loading…</p>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
