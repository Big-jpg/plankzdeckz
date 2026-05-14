// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import { SessionProvider } from "@/components/session-provider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumenform.studio";
const siteDescription =
  "Custom 3D printed lampshades designed for the lights you already own. Parametric lighting objects with included B22, E27, and Clipsal-compatible adapters.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lumenform Studio",
    template: "%s | Lumenform Studio",
  },
  description: siteDescription,
  applicationName: "Lumenform Studio",
  authors: [{ name: "Lumenform Studio" }],
  creator: "Lumenform Studio",
  publisher: "Lumenform Studio",
  category: "lighting design",
  keywords: [
    "3D printed lampshades",
    "custom lampshades",
    "B22 adapter",
    "E27 adapter",
    "Clipsal adapter",
    "LED lampshades",
    "domestic lighting",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: "Lumenform Studio",
    title: "Lumenform Studio",
    description: siteDescription,
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Lumenform Studio warm ivory Open Graph placeholder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumenform Studio",
    description: siteDescription,
    images: ["/og-default.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SessionProvider>
          <CartProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CartDrawer />
          </CartProvider>
        </SessionProvider>
      </body>
      <Analytics />
    </html>
  );
}
