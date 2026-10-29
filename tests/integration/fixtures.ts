import "./setup";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { pool } from "@/server/db/client";
import type { BoardProduct, MerchProduct } from "@/lib/types";
import { validateCartItems, type VerifiedCartItem } from "@/server/cart/validation-core";
import { getStripeClient } from "@/server/stripe/client";

export { pool, randomUUID };

export async function resetDatabase() {
  await pool.query(
    "TRUNCATE users, products, orders, checkout_attempts, stripe_events, market_sales RESTART IDENTITY CASCADE",
  );
}

export async function createBoard(overrides: Partial<BoardProduct> = {}): Promise<BoardProduct> {
  const id = randomUUID();
  const product: BoardProduct = {
    id,
    handle: `fixture-${id}`,
    title: "Isolated fixture board",
    description: "Commerce test fixture",
    productType: "board",
    category: "Reclaimed cruisers",
    price: 275,
    currency: "AUD",
    publicationStatus: "published",
    images: ["https://example.invalid/fixture.jpg"],
    material: "Fixture timber",
    dimensions: "",
    colours: [],
    boardStyles: ["Cruiser"],
    inStock: true,
    stockQuantity: 1,
    availabilityStatus: "available",
    timberSpecies: ["Fixture timber"],
    boardStyle: "cruiser",
    boardShape: "Fixture shape",
    boardDimensions: { display: "" },
    specs: [],
    galleryNotes: "",
    ...overrides,
  };
  await pool.query(
    `INSERT INTO products(id,handle,title,description,product_type,price_amount,currency,board_style,board_shape,
       publication_status,availability_status,stock_quantity,metadata,image_urls)
     VALUES($1,$2,$3,$4,'board',$5,'aud','cruiser','Fixture shape',$6,$7,$8,'{}','[]')`,
    [
      product.id,
      product.handle,
      product.title,
      product.description,
      Math.round(product.price * 100),
      product.publicationStatus,
      product.availabilityStatus,
      product.stockQuantity,
    ],
  );
  return product;
}

export async function createTee(stock = 2): Promise<MerchProduct> {
  const id = randomUUID();
  const product: MerchProduct = {
    id,
    handle: `fixture-${id}`,
    title: "Isolated fixture tee",
    description: "Commerce test fixture",
    productType: "merch",
    category: "Merch",
    price: 35,
    currency: "AUD",
    publicationStatus: "published",
    images: [],
    material: "Fixture cotton",
    dimensions: "",
    colours: [],
    boardStyles: [],
    inStock: stock > 0,
    stockQuantity: 0,
    merchKind: "tee",
    sizes: ["S"],
    sizeRequired: true,
    stockBySize: { S: stock },
    fitNotes: "Fixture fit",
    salesUnitLabel: "Each",
  };
  await pool.query(
    `INSERT INTO products(id,handle,title,description,product_type,price_amount,currency,publication_status,
       availability_status,stock_quantity,merch_kind,merch_sizes,stock_by_size,metadata)
     VALUES($1,$2,$3,$4,'merch',3500,'aud','published','available',0,'tee',ARRAY['S'],$5::jsonb,'{"sales_unit_label":"Each"}')`,
    [id, product.handle, product.title, product.description, JSON.stringify(product.stockBySize)],
  );
  return product;
}

export function verifiedItems(
  products: Array<BoardProduct | MerchProduct>,
  quantity = 1,
): VerifiedCartItem[] {
  const result = validateCartItems(
    {
      items: products.map((product) => ({
        handle: product.handle,
        productType: product.productType,
        unitPrice: product.price,
        currency: product.currency,
        quantity,
        ...(product.productType === "merch" ? { selectedSize: "S" } : {}),
      })),
    },
    products,
  );
  if (!result.valid) throw new Error(JSON.stringify(result.errors));
  return result.verifiedItems;
}

export function mockStripe() {
  const stripe = getStripeClient();
  const sender = stripe as unknown as {
    _requestSender: { _request(...args: unknown[]): never; _rawRequest(...args: unknown[]): never };
  };
  sender._requestSender._request = () => {
    throw new Error("Unexpected Stripe network request in isolated integration tests.");
  };
  sender._requestSender._rawRequest = () => {
    throw new Error("Unexpected raw Stripe network request in isolated integration tests.");
  };
  Object.assign(stripe.refunds, { list: () => (async function* () {})() });
  return stripe;
}

export function paidSession(
  items: VerifiedCartItem[],
  token: string,
  sessionId = `cs_test_${randomUUID()}`,
) {
  const amount = items.reduce((sum, item) => sum + item.totalAmount, 0);
  const session = {
    id: sessionId,
    object: "checkout.session",
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    currency: "aud",
    amount_total: amount,
    amount_subtotal: amount,
    payment_intent: `pi_test_${randomUUID()}`,
    customer_details: { email: "fixture@example.test", name: "Fixture customer", phone: null },
    metadata: { source: "plankz_deckz", hold_token: token },
  } as unknown as Stripe.Checkout.Session;
  const lines = items.map((item) => ({
    id: `li_${randomUUID()}`,
    quantity: item.quantity,
    currency: "aud",
    amount_total: item.totalAmount,
    price: {
      unit_amount: item.unitAmount,
      product: {
        id: `prod_${randomUUID()}`,
        metadata: {
          product_id: item.productId,
          product_type: item.productType,
          merch_size: item.selectedSize ?? "",
        },
      },
    },
  })) as unknown as Stripe.LineItem[];
  return { session, lines };
}

export function mockCheckoutLines(stripe: Stripe, lines: Stripe.LineItem[]) {
  Object.assign(stripe.checkout.sessions, {
    listLineItems: () =>
      (async function* () {
        yield* lines;
      })(),
  });
}
