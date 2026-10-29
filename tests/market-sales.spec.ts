import { expect, test } from "@playwright/test";
import {
  assertMarketPayment,
  assertMarketStock,
  parseMarketSaleInput,
  type MarketStockProduct,
} from "@/server/commerce/market-sale-input";

const productId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const requestId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
function input() {
  return {
    requestId,
    paymentReference: "pi_fixture",
    soldAt: "2026-01-01T01:00:00Z",
    customerEmail: null,
    items: [{ productId, size: null, quantity: 1, lineAmount: 27500 }],
  };
}
function board(): MarketStockProduct {
  return {
    id: productId,
    publication_status: "draft",
    product_type: "board",
    merch_kind: null,
    availability_status: "available",
    stock_quantity: 1,
    stock_by_size: {},
    merch_sizes: [],
    metadata: {},
  };
}
const payment = {
  status: "succeeded",
  currency: "aud",
  amount_received: 27500,
  amount: 27500,
  paymentMethodType: "card_present",
};

test("market totals come from explicit integer line amounts and customer email remains optional", () => {
  const parsed = parseMarketSaleInput({ ...input(), totalAmount: 1 });
  expect(parsed.totalAmount).toBe(27500);
  expect(parsed.customerEmail).toBeNull();
  expect(
    parseMarketSaleInput({ ...input(), customerEmail: " Buyer@Example.test " }).customerEmail,
  ).toBe("buyer@example.test");
  expect(() =>
    parseMarketSaleInput({ ...input(), customerEmail: "x\r\nBcc: victim@example.test" }),
  ).toThrow("email");
});

test("market input rejects noninteger quantities, fractional cents, unsafe totals and duplicate variants", () => {
  for (const quantity of [0, -1, 1.5, 1001])
    expect(() =>
      parseMarketSaleInput({ ...input(), items: [{ ...input().items[0], quantity }] }),
    ).toThrow("quantities");
  for (const lineAmount of [0, -1, 1.5, Number.NaN, 2_147_483_648])
    expect(() =>
      parseMarketSaleInput({ ...input(), items: [{ ...input().items[0], lineAmount }] }),
    ).toThrow("line total");
  expect(() =>
    parseMarketSaleInput({
      ...input(),
      items: [input().items[0], { ...input().items[0], productId: productId.toUpperCase() }],
    }),
  ).toThrow("duplicate");
  expect(() =>
    parseMarketSaleInput({
      ...input(),
      items: [
        { ...input().items[0], lineAmount: 2_147_483_647 },
        { ...input().items[0], productId: requestId, lineAmount: 1 },
      ],
    }),
  ).toThrow("total");
});

test("unknown Stripe references remain representable for durable manual review", () => {
  expect(
    parseMarketSaleInput({ ...input(), paymentReference: "receipt from business account" })
      .paymentReference,
  ).toBe("receipt from business account");
  expect(() => parseMarketSaleInput({ ...input(), paymentReference: "\n" })).toThrow("reference");
  expect(() => parseMarketSaleInput({ ...input(), soldAt: "not a date" })).toThrow("date");
  expect(() =>
    parseMarketSaleInput({ ...input(), soldAt: new Date(Date.now() + 86_400_000).toISOString() }),
  ).toThrow("future");
});

test("market payment verification requires succeeded AUD payment and exact actual amount", () => {
  expect(() => assertMarketPayment(payment, 27500)).not.toThrow();
  for (const status of ["processing", "requires_payment_method", "canceled"])
    expect(() => assertMarketPayment({ ...payment, status }, 27500)).toThrow("succeeded");
  expect(() => assertMarketPayment({ ...payment, currency: "usd" }, 27500)).toThrow("AUD");
  expect(() => assertMarketPayment({ ...payment, amount_received: 27499 }, 27500)).toThrow(
    "totals",
  );
  expect(() => assertMarketPayment({ ...payment, amount: 27499 }, 27500)).toThrow("totals");
  expect(() => assertMarketPayment({ ...payment, paymentMethodType: "card" }, 27500)).toThrow(
    "contactless",
  );
});

test("unique event decks must be unpublished, unsold and have exactly one unit", () => {
  const item = parseMarketSaleInput(input()).items[0];
  expect(assertMarketStock(board(), item)).toBe(1);
  for (const publication_status of ["published", "archived"])
    expect(() => assertMarketStock({ ...board(), publication_status }, item)).toThrow("Unpublish");
  for (const stock_quantity of [0, 2])
    expect(() => assertMarketStock({ ...board(), stock_quantity }, item)).toThrow("deck");
  expect(() => assertMarketStock({ ...board(), availability_status: "sold" }, item)).toThrow(
    "deck",
  );
  expect(() => assertMarketStock(board(), { ...item, quantity: 2 })).toThrow("deck");
  expect(() => assertMarketStock({ ...board(), metadata: { display_only: true } }, item)).toThrow(
    "Display-only",
  );
});

test("merchandise reconciliation checks the selected variant and cannot make stock negative", () => {
  const product: MarketStockProduct = {
    ...board(),
    product_type: "merch",
    merch_kind: "hat",
    merch_sizes: ["One size"],
    stock_by_size: { "One size": 2 },
    metadata: { sales_unit_label: "Each" },
  };
  const item = { productId, size: "One size", quantity: 2, lineAmount: 5000 };
  expect(assertMarketStock(product, item)).toBe(2);
  expect(() => assertMarketStock(product, { ...item, quantity: 3 })).toThrow("insufficient");
  expect(() => assertMarketStock(product, { ...item, size: "M" })).toThrow("variant");
  expect(() => assertMarketStock({ ...product, merch_kind: "unknown" }, item)).toThrow("variant");
  expect(() => assertMarketStock({ ...product, metadata: {} }, item)).toThrow("sales unit");
  for (const merch_kind of ["truck", "wheel"]) {
    expect(assertMarketStock({ ...product, merch_kind }, item)).toBe(2);
    expect(() => assertMarketStock({ ...product, merch_kind, metadata: {} }, item)).toThrow(
      "sales unit",
    );
  }
});
