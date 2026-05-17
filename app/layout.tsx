// app/layout.tsx
import type { Metadata } from "next";
import { Bangers, Inter } from "next/font/google";
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

const bangers = Bangers({
  subsets: ["latin"],
  variable: "--font-bangers",
  weight: "400",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://plankzdeckz.com";
const siteDescription =
  "Hand-crafted skateboard deckz made from recycled and reclaimed timber. One-of-a-kind custom boards, merch, and local pickup.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PLANKZ DECKZ",
    template: "%s | PLANKZ DECKZ",
  },
  description: siteDescription,
  applicationName: "PLANKZ DECKZ",
  authors: [{ name: "PLANKZ DECKZ" }],
  creator: "PLANKZ DECKZ",
  publisher: "PLANKZ DECKZ",
  category: "skateboard decks",
  keywords: [
    "PLANKZ DECKZ",
    "hand-crafted skateboard decks",
    "recycled timber skateboards",
    "reclaimed timber longboards",
    "custom skateboard decks",
    "surfskate decks",
    "Australian skateboard brand",
    "local pickup skateboard decks",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: "PLANKZ DECKZ",
    title: "PLANKZ DECKZ",
    description: siteDescription,
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "PLANKZ DECKZ coastal recycled timber Open Graph placeholder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PLANKZ DECKZ",
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
    <html lang="en" className={`${inter.variable} ${bangers.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
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
