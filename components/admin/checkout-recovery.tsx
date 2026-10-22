import { queryRows } from "@/server/db/client";
import { PaymentReconcileControl } from "./payment-reconcile-control";
export async function CheckoutRecovery() {
  const rows = await queryRows<{
    id: string;
    status: string;
    stripe_session_id: string | null;
    last_error: string | null;
  }>(
    `SELECT id,status,stripe_session_id,last_error FROM checkout_attempts
     WHERE status IN ('creating','open','needs_review') AND (last_error IS NOT NULL OR created_at<now()-interval '36 minutes')
     ORDER BY created_at LIMIT 50`,
  );
  if (!rows.length) return null;
  return (
    <section className="space-y-3 rounded-xl border border-charcoal/20 p-5">
      <h3 className="text-lg font-semibold">Checkout reservations to review</h3>
      <p className="text-sm">
        Stock stays reserved until Stripe confirms payment or expiry. Check these before preparing
        market stock.
      </p>
      {rows.map((row) => (
        <div key={row.id} className="space-y-2 border-t border-charcoal/10 pt-3">
          <p className="break-all text-sm">
            {row.stripe_session_id ?? row.id} · {row.status}
          </p>
          {row.last_error && <p className="text-sm text-red-700">{row.last_error}</p>}
          <PaymentReconcileControl attemptId={row.id} />
        </div>
      ))}
    </section>
  );
}
