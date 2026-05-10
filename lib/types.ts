// lib/types.ts

export type AdapterType = "B22" | "E27" | "Clipsal No. 530" | "Other / not sure";

export type ProductCategory =
  | "Pleated shades"
  | "Faceted / geometric shades"
  | "Floral / petal shades"
  | "Textured diffuser shades"
  | "Starfield / perforated shades"
  | "Experimental prototypes";

export interface Product {
  id: string;
  handle: string;
  title: string;
  price: number;
  currency: string;
  category: ProductCategory;
  description: string;
  material: string;
  dimensions: string;
  colours: string[];
  images: string[];
  adapters: AdapterType[];
  inStock: boolean;
}
