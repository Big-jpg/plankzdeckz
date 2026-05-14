// app/admin/custom-requests/page.tsx
// Admin-Lite custom design request review and status management.

import { CustomRequestStatusControl } from "@/components/admin/status-controls";
import { getCustomDesignRequestsAdmin } from "@/server/db/contracts";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function labelFor(value: string | null): string {
  if (!value) return "Not supplied";
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-xl border border-charcoal/10 bg-ivory/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/45">{label}</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-charcoal">
        {value && value.length > 0 ? value : "Not supplied"}
      </p>
    </div>
  );
}

export default async function AdminCustomRequestsPage() {
  const requests = await getCustomDesignRequestsAdmin(200, 0, null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-charcoal">Custom requests</h2>
          <p className="mt-2 text-sm text-charcoal/60">
            Review fixture details, adapter needs, design notes, contact details, and request
            status.
          </p>
        </div>
        <p className="text-sm text-charcoal/50">Showing {requests.length} requests</p>
      </div>

      <div className="space-y-5">
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-charcoal/10 bg-white p-8 text-center text-sm text-charcoal/60">
            No custom design requests found.
          </div>
        ) : (
          requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">
                    {labelFor(request.status)} · {formatDate(request.created_at)}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-charcoal">
                    {request.name ?? "Unnamed request"}
                  </h3>
                  <p className="mt-1 text-sm text-charcoal/60">{request.email}</p>
                  <p className="mt-1 text-sm text-charcoal/60">
                    {request.phone ?? "No phone supplied"}
                  </p>
                  <p className="mt-2 text-xs text-charcoal/45">{request.id}</p>
                </div>
                <div className="lg:min-w-80">
                  <CustomRequestStatusControl id={request.id} currentStatus={request.status} />
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Fixture type" value={request.fixture_type} />
                <Field label="Adapter type" value={request.adapter_type} />
                <Field label="Budget range" value={request.budget_range} />
                <Field label="User ID" value={request.user_id} />
              </div>
              <div className="mt-3">
                <Field label="Design notes" value={request.design_notes} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
