// components/login-form.tsx
"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, string> = {
  Verification: "The magic link has expired or has already been used. Please request a new one.",
  Configuration: "There is a server configuration issue. Please try again later.",
  AccessDenied: "Access denied. Please try a different email address.",
  Default: "An unexpected error occurred. Please try again.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const isVerify = searchParams.get("verify") === "1";
  const errorParam = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(isVerify);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Derive URL-based error message without setState in effect
  const urlError = useMemo(() => {
    if (!errorParam) return null;
    return ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.Default;
  }, [errorParam]);

  const displayError = submitError || urlError;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const result = await signIn("nodemailer", {
        email: email.trim().toLowerCase(),
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setSubmitError("Failed to send magic link. Please try again.");
        setLoading(false);
      } else {
        setSubmitted(true);
        setLoading(false);
      }
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  // "Check your email" confirmation state
  if (submitted && !displayError) {
    return (
      <div className="rounded-xl border border-charcoal/10 bg-ivory p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-charcoal/5">
          <CheckCircle className="h-7 w-7 text-charcoal" />
        </div>
        <h2 className="text-xl font-semibold text-charcoal">Check your email</h2>
        <p className="mt-3 text-sm text-charcoal/70 leading-relaxed">
          We&apos;ve sent a magic link to{" "}
          {email ? <span className="font-medium text-charcoal">{email}</span> : "your email"}. Click
          the link in the email to sign in.
        </p>
        <p className="mt-4 text-xs text-charcoal/50">
          The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setEmail("");
          }}
          className="mt-6 text-sm font-medium text-charcoal/70 underline underline-offset-4 transition-colors hover:text-charcoal"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-charcoal/10 bg-ivory p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-charcoal/5">
          <Mail className="h-7 w-7 text-charcoal" />
        </div>
        <h2 className="text-xl font-semibold text-charcoal">Sign in with email</h2>
        <p className="mt-2 text-sm text-charcoal/70">
          Enter your email and we&apos;ll send you a magic link to sign in.
        </p>
      </div>

      {displayError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
            "bg-charcoal text-warm-white hover:bg-charcoal/90",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-warm-white/30 border-t-warm-white" />
              Sending link…
            </>
          ) : (
            <>
              Send magic link
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-charcoal/50">
        No password needed. No account creation required.
        <br />
        We&apos;ll create your account automatically on first sign-in.
      </p>
    </div>
  );
}
