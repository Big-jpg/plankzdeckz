// components/custom-design-request-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

type SubmitState = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<Record<keyof FormState, string>>;

type FormState = {
  name: string;
  email: string;
  phone: string;
  intended_use: string;
  board_style: string;
  board_shape: string;
  board_length: string;
  board_width: string;
  timber_preference: string;
  resin_inlay_preference: string;
  notes: string;
  upload_instruction_acknowledged: boolean;
};

type ApiResponse = {
  ok: boolean;
  requestId?: string;
  error?: string;
  fieldErrors?: FieldErrors;
};

const INITIAL_FORM_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  intended_use: "",
  board_style: "",
  board_shape: "",
  board_length: "",
  board_width: "",
  timber_preference: "",
  resin_inlay_preference: "",
  notes: "",
  upload_instruction_acknowledged: false,
};

function inputClass(hasError: boolean): string {
  return cn(
    "mt-1 w-full rounded-xl border bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:ring-1",
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-charcoal/20 focus:border-charcoal focus:ring-charcoal",
  );
}

function fieldError(errors: FieldErrors, field: keyof FormState): string | null {
  return errors[field] ?? null;
}

export function CustomDesignRequestForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]): void {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitState("submitting");
    setFieldErrors({});
    setFormMessage(null);
    setRequestId(null);

    try {
      const response = await fetch("/api/custom-design-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.ok) {
        setSubmitState("error");
        setFieldErrors(payload.fieldErrors ?? {});
        setFormMessage(payload.error ?? "Unable to submit the custom deck request.");
        return;
      }

      setSubmitState("success");
      setRequestId(payload.requestId ?? null);
      setForm(INITIAL_FORM_STATE);
      setFormMessage(
        "Your custom deck request has been recorded. PLANKZ DECKZ will review the ride style, dimensions, timber direction, and finish before replying.",
      );
    } catch {
      setSubmitState("error");
      setFormMessage("Unable to submit the request. Please try again or use the contact page.");
    }
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="custom-name">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="custom-name"
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
            className={inputClass(Boolean(fieldError(fieldErrors, "name")))}
          />
          {fieldError(fieldErrors, "name") && (
            <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "name")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="custom-phone">
            Phone <span className="text-red-600">*</span>
          </label>
          <input
            id="custom-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="Best contact number"
            autoComplete="tel"
            required
            className={inputClass(Boolean(fieldError(fieldErrors, "phone")))}
          />
          {fieldError(fieldErrors, "phone") && (
            <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "phone")}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal" htmlFor="custom-email">
          Email <span className="text-red-600">*</span>
        </label>
        <input
          id="custom-email"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          className={inputClass(Boolean(fieldError(fieldErrors, "email")))}
        />
        {fieldError(fieldErrors, "email") && (
          <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "email")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="custom-intended-use">
            Intended use <span className="text-red-600">*</span>
          </label>
          <input
            id="custom-intended-use"
            type="text"
            value={form.intended_use}
            onChange={(event) => updateField("intended_use", event.target.value)}
            placeholder="Ride deck, wall display, gift, surfskate setup..."
            required
            className={inputClass(Boolean(fieldError(fieldErrors, "intended_use")))}
          />
          {fieldError(fieldErrors, "intended_use") && (
            <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "intended_use")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="custom-board-style">
            Board style <span className="text-red-600">*</span>
          </label>
          <select
            id="custom-board-style"
            value={form.board_style}
            onChange={(event) => updateField("board_style", event.target.value)}
            required
            className={inputClass(Boolean(fieldError(fieldErrors, "board_style")))}
          >
            <option value="">Select...</option>
            <option value="cruiser">Cruiser</option>
            <option value="longboard">Longboard</option>
            <option value="surfskate">Surfskate</option>
            <option value="custom">Custom / not sure</option>
          </select>
          {fieldError(fieldErrors, "board_style") && (
            <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "board_style")}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal" htmlFor="custom-board-shape">
          Board shape <span className="text-red-600">*</span>
        </label>
        <input
          id="custom-board-shape"
          type="text"
          value={form.board_shape}
          onChange={(event) => updateField("board_shape", event.target.value)}
          placeholder="Fish tail, pintail, old-school pool shape, wall-hanger, experimental..."
          required
          className={inputClass(Boolean(fieldError(fieldErrors, "board_shape")))}
        />
        {fieldError(fieldErrors, "board_shape") && (
          <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "board_shape")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="custom-board-length">
            Board length in cm
          </label>
          <input
            id="custom-board-length"
            type="number"
            min="0"
            step="0.1"
            value={form.board_length}
            onChange={(event) => updateField("board_length", event.target.value)}
            placeholder="e.g. 82.0"
            className={inputClass(Boolean(fieldError(fieldErrors, "board_length")))}
          />
          {fieldError(fieldErrors, "board_length") && (
            <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "board_length")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="custom-board-width">
            Board width in cm
          </label>
          <input
            id="custom-board-width"
            type="number"
            min="0"
            step="0.1"
            value={form.board_width}
            onChange={(event) => updateField("board_width", event.target.value)}
            placeholder="e.g. 24.5"
            className={inputClass(Boolean(fieldError(fieldErrors, "board_width")))}
          />
          {fieldError(fieldErrors, "board_width") && (
            <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "board_width")}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="custom-timber">
            Timber preference
          </label>
          <input
            id="custom-timber"
            type="text"
            value={form.timber_preference}
            onChange={(event) => updateField("timber_preference", event.target.value)}
            placeholder="Jarrah, oak, reclaimed mixed timber, warm timber finish..."
            className={inputClass(Boolean(fieldError(fieldErrors, "timber_preference")))}
          />
          {fieldError(fieldErrors, "timber_preference") && (
            <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "timber_preference")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="custom-resin">
            Resin inlay preference
          </label>
          <input
            id="custom-resin"
            type="text"
            value={form.resin_inlay_preference}
            onChange={(event) => updateField("resin_inlay_preference", event.target.value)}
            placeholder="Teal centre band, coral rail accent, no resin..."
            className={inputClass(Boolean(fieldError(fieldErrors, "resin_inlay_preference")))}
          />
          {fieldError(fieldErrors, "resin_inlay_preference") && (
            <p className="mt-1 text-xs text-red-600">
              {fieldError(fieldErrors, "resin_inlay_preference")}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal" htmlFor="custom-notes">
          Notes
        </label>
        <textarea
          id="custom-notes"
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Tell us about rider size, stance, trucks, grip preference, local pickup timing, reclaimed timber story, and any visual references."
          rows={5}
          className={inputClass(Boolean(fieldError(fieldErrors, "notes")))}
        />
        {fieldError(fieldErrors, "notes") && (
          <p className="mt-1 text-xs text-red-600">{fieldError(fieldErrors, "notes")}</p>
        )}
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-warm-white p-4">
        <p className="text-sm font-semibold text-charcoal">Reference image placeholder</p>
        <p className="mt-1 text-sm leading-relaxed text-charcoal/65">
          Direct uploads are not enabled yet. Please email clear reference photos, sketches, or timber
          inspiration after submitting this request so the build can be checked before production.
        </p>
        <label className="mt-3 flex items-start gap-2 text-sm text-charcoal/70">
          <input
            type="checkbox"
            checked={form.upload_instruction_acknowledged}
            onChange={(event) => updateField("upload_instruction_acknowledged", event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-charcoal/30 text-charcoal focus:ring-charcoal"
          />
          <span>I understand that reference photos should be emailed separately.</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitState === "submitting"}
        className={cn(
          "w-full rounded-full px-6 py-3 text-sm font-semibold text-warm-white transition-colors",
          submitState === "submitting" ? "cursor-wait bg-charcoal/60" : "bg-charcoal hover:bg-charcoal/90",
        )}
      >
        {submitState === "submitting" ? "Submitting request..." : "Submit custom deck request"}
      </button>

      {formMessage && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm leading-relaxed",
            submitState === "success"
              ? "border-green-700/20 bg-green-50 text-green-900"
              : "border-red-700/20 bg-red-50 text-red-900",
          )}
        >
          <p>{formMessage}</p>
          {requestId && <p className="mt-1 text-xs opacity-75">Request ID: {requestId}</p>}
        </div>
      )}
    </form>
  );
}
