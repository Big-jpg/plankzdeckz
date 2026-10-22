import { isMerchKind, isSizeLabel } from "@/lib/types";

export interface MarketSaleItem {
  productId: string;
  size: string | null;
  quantity: number;
  lineAmount: number;
}

export interface MarketSaleInput {
  requestId: string;
  paymentReference: string;
  soldAt: string;
  customerEmail: string | null;
  items: MarketSaleItem[];
  totalAmount: number;
  expectedRevision?: number;
}

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const cents = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 2_147_483_647;

export function parseMarketSaleInput(value: unknown): MarketSaleInput {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid market sale.");
  const raw = value as Record<string, unknown>;
  if (!isUuid(raw.requestId)) throw new Error("A valid sale request identifier is required.");
  const paymentReference =
    typeof raw.paymentReference === "string" ? raw.paymentReference.trim() : "";
  if (
    !paymentReference ||
    paymentReference.length > 255 ||
    /[\u0000-\u001f\u007f]/.test(paymentReference)
  )
    throw new Error("Enter the Stripe payment reference.");
  if (typeof raw.soldAt !== "string" || !Number.isFinite(Date.parse(raw.soldAt)))
    throw new Error("Enter a valid sale date and time.");
  if (Date.parse(raw.soldAt) > Date.now() + 5 * 60_000)
    throw new Error("The sale cannot be in the future.");
  const customerEmail =
    typeof raw.customerEmail === "string" ? raw.customerEmail.trim().toLowerCase() : null;
  if (
    customerEmail &&
    (customerEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
  )
    throw new Error("Enter a valid customer email, or leave it blank.");
  if (!Array.isArray(raw.items) || !raw.items.length || raw.items.length > 20)
    throw new Error("Record between 1 and 20 sale lines.");
  const seen = new Set<string>();
  const items = raw.items.map((value): MarketSaleItem => {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("Invalid sale line.");
    const item = value as Record<string, unknown>;
    if (!isUuid(item.productId)) throw new Error("Select a catalogue product for every line.");
    const size =
      item.size === null || item.size === undefined || item.size === "" ? null : item.size;
    if (size !== null && !isSizeLabel(size))
      throw new Error("Select a valid size or stock variant.");
    if (
      typeof item.quantity !== "number" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 1000
    )
      throw new Error("Sale quantities must be whole numbers from 1 to 1000.");
    if (!cents(item.lineAmount)) throw new Error("Enter each actual line total in whole cents.");
    const productId = item.productId.toLowerCase();
    const key = `${productId}:${size ?? ""}`;
    if (seen.has(key)) throw new Error("Combine duplicate product and size lines before saving.");
    seen.add(key);
    return {
      productId,
      size: size as string | null,
      quantity: item.quantity,
      lineAmount: item.lineAmount,
    };
  });
  const totalAmount = items.reduce((total, item) => total + item.lineAmount, 0);
  if (!cents(totalAmount)) throw new Error("The sale total is outside the supported range.");
  if (
    raw.expectedRevision !== undefined &&
    (typeof raw.expectedRevision !== "number" ||
      !Number.isSafeInteger(raw.expectedRevision) ||
      raw.expectedRevision < 0)
  )
    throw new Error("Invalid sale version. Reload and try again.");
  return {
    requestId: raw.requestId.toLowerCase(),
    paymentReference,
    soldAt: new Date(raw.soldAt).toISOString(),
    customerEmail: customerEmail || null,
    items,
    totalAmount,
    expectedRevision: raw.expectedRevision as number | undefined,
  };
}

export interface MarketStockProduct {
  id: string;
  publication_status: string;
  product_type: string;
  merch_kind: string | null;
  availability_status: string;
  stock_quantity: number;
  stock_by_size: Record<string, number>;
  merch_sizes: string[];
  metadata: Record<string, unknown>;
}

export function assertMarketStock(product: MarketStockProduct, item: MarketSaleItem): number {
  if (product.publication_status !== "draft")
    throw new Error(
      "Unpublish event stock before recording the sale. Archived products cannot be sold.",
    );
  if (
    [product.metadata.display_only, product.metadata.displayOnly].some(
      (value) => value !== undefined && value !== false,
    )
  )
    throw new Error("Display-only products cannot be recorded as sales.");
  if (product.product_type === "board") {
    if (
      item.size ||
      item.quantity !== 1 ||
      product.availability_status !== "available" ||
      product.stock_quantity !== 1
    )
      throw new Error("This unique deck is unavailable or has already been sold.");
    return 1;
  }
  if (
    product.product_type !== "merch" ||
    !isMerchKind(product.merch_kind) ||
    !item.size ||
    !product.merch_sizes.includes(item.size)
  )
    throw new Error("The selected merchandise stock variant is unavailable.");
  if (
    typeof product.metadata.sales_unit_label !== "string" ||
    !product.metadata.sales_unit_label.trim()
  )
    throw new Error(
      "Confirm the merchandise sales unit in product administration before recording the sale.",
    );
  const available = product.stock_by_size[item.size];
  if (!Number.isSafeInteger(available) || available < item.quantity)
    throw new Error("The selected merchandise has insufficient stock.");
  return available;
}

export function assertMarketPayment(
  payment: {
    status: string;
    currency: string;
    amount_received: number;
    amount: number;
    paymentMethodType: string | undefined;
  },
  totalAmount: number,
): void {
  if (payment.status !== "succeeded") throw new Error("The Stripe payment has not succeeded.");
  if (payment.currency.toLowerCase() !== "aud")
    throw new Error("The Stripe payment must be in AUD.");
  if (payment.amount_received !== totalAmount || payment.amount !== totalAmount)
    throw new Error("The actual sale line totals do not match the Stripe payment amount.");
  if (payment.paymentMethodType !== "card_present")
    throw new Error(
      "This is not a Stripe in-person contactless payment. Review its sales channel before continuing.",
    );
}
