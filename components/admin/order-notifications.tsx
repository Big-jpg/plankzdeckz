import { getOrderNotificationStatuses } from "@/server/notifications/orders";
import { RetryOrderNotifications } from "./retry-order-notifications";

export async function OrderNotifications({ orderId }: { orderId: string }) {
  const notifications = await getOrderNotificationStatuses(orderId);
  return (
    <section className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
      <h3 className="font-serif text-2xl font-semibold text-charcoal">Customer emails</h3>
      <p className="mt-2 text-sm text-charcoal/60">
        Accepted means the SMTP server accepted the email. Inbox delivery is not confirmed. Pending
        or failed emails require an administrator retry; there is no scheduled sender.
      </p>
      {notifications.length === 0 ? (
        <p className="mt-4 text-sm text-charcoal/60">No customer emails recorded for this order.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="rounded-lg border border-charcoal/10 p-3 text-sm text-charcoal"
            >
              <span className="font-semibold">{notification.kind.replaceAll("_", " ")}</span>
              {" · "}
              {notification.status}
              {" · "}
              {notification.attempts} attempt(s)
              {notification.last_error_code ? (
                <span className="block text-charcoal/60">
                  {notification.last_error_code.replaceAll("_", " ")}
                </span>
              ) : null}
              {notification.status === "sending" ? (
                <span className="block text-charcoal/60">
                  An interrupted attempt can be retried after its two-minute lease expires.
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {notifications.some((notification) =>
        ["pending", "sending", "failed"].includes(notification.status),
      ) ? (
        <RetryOrderNotifications orderId={orderId} />
      ) : null}
    </section>
  );
}
