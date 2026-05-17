// app/products/page.tsx
import { redirect } from "next/navigation";

export default function ProductsRedirectPage() {
  redirect("/shop");
}
