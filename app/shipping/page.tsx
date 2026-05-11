// app/shipping/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Box,
  Leaf,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Shipping and packaging information for Lumenform Studio.",
};

export default function ShippingPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Shipping
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Lightweight lighting objects, packed carefully and sent through
            Australia Post.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="prose prose-charcoal max-w-none text-charcoal/80">
              <p className="text-lg leading-relaxed">
                Lumenform shades are designed to be durable, lightweight, and
                suitable for domestic delivery. Each order is packed with a
                practical balance of protection, presentation, and material
                restraint.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6 text-center">
                <Truck className="mx-auto h-6 w-6 text-charcoal/50" />
                <h3 className="mt-3 text-sm font-semibold text-charcoal">
                  Australia Post
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  Domestic orders are sent from Western Australia using Australia
                  Post Parcel Post.
                </p>
              </div>

              <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6 text-center">
                <Box className="mx-auto h-6 w-6 text-charcoal/50" />
                <h3 className="mt-3 text-sm font-semibold text-charcoal">
                  Right-sized packaging
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  Orders are packed in appropriately sized lightweight recycled
                  cardboard boxes.
                </p>
              </div>

              <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6 text-center">
                <Leaf className="mx-auto h-6 w-6 text-charcoal/50" />
                <h3 className="mt-3 text-sm font-semibold text-charcoal">
                  Paper-based cushioning
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  Internal protection uses paper roll, rolled paper, or shredded
                  cardboard where required.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-charcoal/10 bg-ivory/50 p-6">
              <h2 className="text-xl font-semibold text-charcoal">
                Shipping inclusions
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-charcoal/10 bg-warm-white p-4">
                  <BadgeCheck className="h-5 w-5 text-charcoal/50" />
                  <h3 className="mt-3 text-sm font-semibold text-charcoal">
                    Free shipping over $75
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                    Orders over $75 include standard domestic shipping within
                    Australia.
                  </p>
                </div>

                <div className="rounded-lg border border-charcoal/10 bg-warm-white p-4">
                  <Zap className="h-5 w-5 text-charcoal/50" />
                  <h3 className="mt-3 text-sm font-semibold text-charcoal">
                    Priority service over $100
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                    Orders over $100 include express shipping where available.
                  </p>
                </div>

                <div className="rounded-lg border border-charcoal/10 bg-warm-white p-4">
                  <ShieldCheck className="h-5 w-5 text-charcoal/50" />
                  <h3 className="mt-3 text-sm font-semibold text-charcoal">
                    Added cover over $100
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                    Eligible orders over $100 include additional delivery cover
                    for loss or damage in transit.
                  </p>
                </div>

                <div className="rounded-lg border border-charcoal/10 bg-warm-white p-4">
                  <RotateCcw className="h-5 w-5 text-charcoal/50" />
                  <h3 className="mt-3 text-sm font-semibold text-charcoal">
                    Return support over $100
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                    Eligible orders over $100 may include prepaid return support
                    where return shipping is required.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal">
                Packaging approach
              </h2>

              <div className="mt-5 space-y-5 text-sm leading-relaxed text-charcoal/70">
                <p>
                  Each piece is packed to support the form, reduce movement, and
                  protect the surface during transit. Packaging is selected to suit
                  the size and geometry of the order.
                </p>

                <p>
                  Lumenform primarily uses PETG for its strength, durability, and
                  suitability for long-term domestic use. This allows each shade to
                  be protected effectively without excessive void-fill or bulky
                  packing materials.
                </p>

                <p>
                  The preferred packaging system is simple: recycled cardboard
                  externally, paper-based cushioning internally, and additional
                  protection only where the design or destination requires it.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-dashed border-charcoal/20 bg-ivory/50 p-8 text-center text-sm text-charcoal/40">
                  Image placeholder — packed Lumenform shade
                </div>

                <div className="rounded-lg border border-dashed border-charcoal/20 bg-ivory/50 p-8 text-center text-sm text-charcoal/40">
                  Image placeholder — recycled packaging materials
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-charcoal/10 bg-ivory/50 p-6">
              <h2 className="text-xl font-semibold text-charcoal">
                Estimated shipping costs
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
                Australia Post currently lists national Parcel Post rates for
                parcels up to 5kg. Most Lumenform orders are expected to fall
                within these bands, although larger shades may be assessed by
                cubic weight due to packed dimensions.
              </p>

              <div className="mt-5 overflow-hidden rounded-lg border border-charcoal/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-warm-white text-charcoal">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Parcel range</th>
                      <th className="px-4 py-3 font-semibold">
                        Estimated Parcel Post
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/10 text-charcoal/70">
                    <tr>
                      <td className="px-4 py-3">Up to 500g</td>
                      <td className="px-4 py-3">$9.70-$11.15</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">500g to 1kg</td>
                      <td className="px-4 py-3">$15.25</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">1kg to 3kg</td>
                      <td className="px-4 py-3">$19.30</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">3kg to 5kg</td>
                      <td className="px-4 py-3">$23.30</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Large or bulky parcels</td>
                      <td className="px-4 py-3">
                        Calculated by destination and packed dimensions
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-charcoal/50">
                Final shipping charges are calculated from the packed size,
                delivery postcode, and applicable Australia Post rates at the time
                of dispatch.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal">
                Delivery within Australia
              </h2>

              <div className="mt-5 space-y-5 text-sm leading-relaxed text-charcoal/70">
                <p>
                  Orders are lodged from Western Australia. Local and intrastate
                  deliveries may differ from interstate deliveries depending on
                  destination postcode and parcel size.
                </p>

                <p>
                  For larger orders, delivery may be confirmed before dispatch if
                  the packed dimensions place the parcel outside standard
                  expectations.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-charcoal/10 bg-warm-white p-6">
              <div className="flex items-start gap-4">
                <PackageCheck className="mt-1 h-6 w-6 shrink-0 text-charcoal/50" />

                <div>
                  <h2 className="text-lg font-semibold text-charcoal">
                    Delivery issues
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                    If an order arrives damaged, retain the packaging and contact
                    Lumenform with photographs of the parcel, internal packing,
                    and product. This allows the issue to be assessed accurately
                    and resolved appropriately.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-charcoal/10 bg-ivory/50 p-6">
              <h3 className="text-base font-semibold text-charcoal">
                Local pickup remains available
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                Local pickup remains available for nearby customers and is often
                preferred for larger custom pieces or orders requiring fitting
                guidance at handover.
              </p>

              <div className="mt-6">
                <Link
                  href="/pickup"
                  className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
                >
                  View pickup information
                </Link>
              </div>
            </div>

            <p className="border-t border-charcoal/10 pt-6 text-xs leading-relaxed text-charcoal/40">
              Shipping prices are indicative and may vary by packed dimensions,
              cubic weight, destination postcode, optional delivery services, and
              future carrier rate changes. Free shipping, express shipping,
              return support, and added delivery cover apply only to eligible
              domestic orders.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}