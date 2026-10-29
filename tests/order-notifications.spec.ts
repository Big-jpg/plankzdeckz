import { expect, test } from "@playwright/test";
import {
  buildOrderNotification,
  deliverNotificationBatch,
  NotificationDeliveryError,
  notificationErrorCode,
  type NotificationLease,
  type NotificationOrder,
} from "@/server/notifications/delivery";
import { getOrderEmailConfiguration, sendOrderEmail } from "@/server/notifications/smtp";
import { canTransitionPickup } from "@/server/notifications/pickup-state";

const order: NotificationOrder = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "buyer@example.test",
  total_amount: 27500,
  currency: "aud",
  fulfilment_method: "local_pickup",
  pickup_status: "pending",
  items: [{ title: "Fixture board", variant_title: null, quantity: 1, total_amount: 27500 }],
};
const lease: NotificationLease = {
  id: "22222222-2222-2222-2222-222222222222",
  order_id: order.id,
  kind: "order_confirmed",
  lease_token: "lease-1",
};

test("confirmation uses durable order amounts and a stable message identity across retries", () => {
  const message = buildOrderNotification(lease, order);
  expect(message.to).toBe("buyer@example.test");
  expect(message.text).toContain("$275.00");
  expect(message.text).toContain("Fixture board");
  expect(message.text).toContain("ready for collection");
  expect(buildOrderNotification({ ...lease, lease_token: "lease-2" }, order).messageId).toBe(
    message.messageId,
  );
  expect(() => buildOrderNotification(lease, { ...order, email: null })).toThrow(
    "invalid_recipient",
  );
  expect(() =>
    buildOrderNotification(lease, {
      ...order,
      email: "buyer@example.test\r\nBcc: another@example.test",
    }),
  ).toThrow("invalid_recipient");
});

test("pickup cancellation does not imply a financial refund", () => {
  const message = buildOrderNotification({ ...lease, kind: "pickup_cancelled" }, order);
  expect(message.text).toContain("does not confirm a payment refund");
});

test("a delayed ready email is suppressed after collection instead of asking the customer to collect again", async () => {
  let sent = false;
  const outcomes: Array<string | null> = [];
  await deliverNotificationBatch(order.id, {
    claim: async (_, excluded) => (excluded.length ? null : { ...lease, kind: "pickup_ready" }),
    loadOrder: async () => ({ ...order, pickup_status: "collected" }),
    send: async () => {
      sent = true;
    },
    complete: async (_, code) => {
      outcomes.push(code);
    },
  });
  expect(sent).toBe(false);
  expect(outcomes).toEqual(["pickup_state_changed"]);
});

test("SMTP failure is retained separately from the committed business operation", async () => {
  const completions: Array<[string, string | null]> = [];
  const sent: string[] = [];
  await deliverNotificationBatch(order.id, {
    claim: async (_, excluded) => (excluded.length ? null : lease),
    loadOrder: async () => order,
    send: async (message) => {
      sent.push(message.messageId);
      throw new Error("SMTP response contains buyer@example.test and secret");
    },
    complete: async (notification, error) => {
      completions.push([notification.id, error]);
    },
  });
  expect(sent).toHaveLength(1);
  expect(completions).toEqual([[lease.id, "smtp_delivery_failed"]]);
  expect(notificationErrorCode({ code: "ETIMEDOUT", message: "private detail" })).toBe(
    "smtp_connection_failed",
  );
});

test("one request attempts at most four distinct queued emails and can recover a failed attempt", async () => {
  let failed = true;
  const completed: Array<string | null> = [];
  const identities: string[] = [];
  const dependencies = {
    claim: async (_: string, excluded: string[]) => (excluded.length ? null : lease),
    loadOrder: async () => order,
    send: async (message: { messageId: string }) => {
      identities.push(message.messageId);
      if (failed) throw new NotificationDeliveryError("smtp_not_configured");
    },
    complete: async (_: NotificationLease, code: string | null) => {
      completed.push(code);
    },
  };
  await deliverNotificationBatch(order.id, dependencies);
  failed = false;
  await deliverNotificationBatch(order.id, dependencies);
  expect(completed).toEqual(["smtp_not_configured", null]);
  expect(new Set(identities).size).toBe(1);
  let claims = 0;
  await deliverNotificationBatch(order.id, {
    ...dependencies,
    claim: async () => ({ ...lease, id: `notification-${++claims}` }),
  });
  expect(claims).toBe(4);
});

test("a missing order and invalid recipient are visible failures without an SMTP attempt", async () => {
  let sends = 0;
  const results: Array<string | null> = [];
  for (const value of [null, { ...order, email: null }]) {
    await deliverNotificationBatch(order.id, {
      claim: async (_, excluded) => (excluded.length ? null : lease),
      loadOrder: async () => value,
      send: async () => {
        sends++;
      },
      complete: async (_, code) => {
        results.push(code);
      },
    });
  }
  expect(sends).toBe(0);
  expect(results).toEqual(["order_missing", "invalid_recipient"]);
});

test("SMTP configuration fails closed and requires TLS independently of provider", () => {
  const configuration = {
    EMAIL_SERVER_HOST: "smtp.example.test",
    EMAIL_SERVER_PORT: "587",
    EMAIL_SERVER_USER: "user",
    EMAIL_SERVER_PASSWORD: "fixture-not-a-secret",
    EMAIL_FROM: "PLANKZ DECKZ <sales@example.test>",
  };
  expect(getOrderEmailConfiguration({})).toBeNull();
  expect(getOrderEmailConfiguration({ ...configuration, EMAIL_SERVER_PASSWORD: "" })).toBeNull();
  expect(getOrderEmailConfiguration(configuration)?.server).toMatchObject({
    secure: false,
    requireTLS: true,
  });
  expect(
    getOrderEmailConfiguration({ ...configuration, EMAIL_SERVER_PORT: "465" })?.server.secure,
  ).toBe(true);
});

test("mock SMTP acceptance is necessary before marking an attempt accepted", async () => {
  const names = [
    "EMAIL_SERVER_HOST",
    "EMAIL_SERVER_PORT",
    "EMAIL_SERVER_USER",
    "EMAIL_SERVER_PASSWORD",
    "EMAIL_FROM",
  ] as const;
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  Object.assign(process.env, {
    EMAIL_SERVER_HOST: "mock.invalid",
    EMAIL_SERVER_PORT: "587",
    EMAIL_SERVER_USER: "fixture",
    EMAIL_SERVER_PASSWORD: "fixture",
    EMAIL_FROM: "sales@example.test",
  });
  let closed = 0;
  try {
    await sendOrderEmail(buildOrderNotification(lease, order), () => ({
      sendMail: async () => ({ accepted: ["buyer@example.test"] }),
      close: () => {
        closed++;
      },
    }));
    await expect(
      sendOrderEmail(buildOrderNotification(lease, order), () => ({
        sendMail: async () => ({ accepted: [] }),
        close: () => {
          closed++;
        },
      })),
    ).rejects.toThrow("smtp_recipient_rejected");
    expect(closed).toBe(2);
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
});

test("pickup transitions cannot mark unpaid, shipping or already collected orders ready", () => {
  const pending = { status: "paid", fulfilment_method: "local_pickup", pickup_status: "pending" };
  expect(canTransitionPickup(pending, "ready")).toBe(true);
  expect(canTransitionPickup(pending, "collected")).toBe(false);
  expect(canTransitionPickup({ ...pending, status: "refunded" }, "ready")).toBe(false);
  expect(canTransitionPickup({ ...pending, refund_status: "full" }, "ready")).toBe(false);
  expect(canTransitionPickup({ ...pending, refund_status: "full" }, "cancelled")).toBe(true);
  expect(canTransitionPickup({ ...pending, fulfilment_method: "shipping" }, "ready")).toBe(false);
  expect(canTransitionPickup({ ...pending, pickup_status: "collected" }, "ready")).toBe(false);
  expect(canTransitionPickup({ ...pending, pickup_status: "ready" }, "collected")).toBe(true);
});
