// Public catalogue release gate. Enable only after explicit approval of sales readiness.
export const SALES_ENABLED: boolean = process.env.NEXT_PUBLIC_SALES_ENABLED === "true";

export const SALES_DISABLED_CODE = "sales_disabled";
export const SALES_DISABLED_MESSAGE =
  "Online purchases are currently disabled. You can still browse the collection.";
