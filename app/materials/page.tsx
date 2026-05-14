// app/materials/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Lightbulb, Palette, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Materials",
  description:
    "Customer guide to Lumenform Studio materials, finishes, translucency, and expected variation in 3D printed lampshades.",
};

const materials = [
  {
    name: "PLA",
    subtitle: "Matte, silk, and textured shade forms",
    description:
      "PLA is used for many opaque and softly diffusing forms where surface detail, crisp geometry, and warm interior colour are the priority.",
    bestFor: "Pleated, floral, perforated, and textured designs with defined surface geometry.",
  },
  {
    name: "PETG",
    subtitle: "Translucent, gloss, and satin diffuser forms",
    description:
      "PETG is used where translucency, durability, and a more luminous body are desired. It can carry frosted, smoke, amber, blue, or clear-tinted effects depending on the product.",
    bestFor:
      "Faceted, diffuser, and experimental designs where light transmission through the shade is part of the visual effect.",
  },
];

const finishNotes = [
  {
    icon: Palette,
    title: "Colour",
    text: "Colour names describe the intended appearance, but exact tone can vary slightly between material batches, lighting conditions, and product photography.",
  },
  {
    icon: Layers,
    title: "Layer texture",
    text: "FDM printing creates fine layer lines. They are part of the fabrication method and may be more visible on glossy or translucent pieces.",
  },
  {
    icon: Sparkles,
    title: "Finish",
    text: "Matte, silk, textured, satin, and gloss finishes behave differently under light. Silk and gloss surfaces can show stronger highlights; matte surfaces appear softer.",
  },
  {
    icon: Lightbulb,
    title: "Light behaviour",
    text: "Opaque shades shape and direct light; translucent shades also glow through the material. Always use LED bulbs only, regardless of material.",
  },
];

export default function MaterialsPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Product information
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Materials</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Lumenform shades are produced as small-batch 3D printed objects. Material choice affects
            translucency, finish, shadow behaviour, durability, and the amount of visible print
            texture.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {materials.map((material) => (
              <article
                key={material.name}
                className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6 sm:p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/40">
                  Material
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-charcoal">{material.name}</h2>
                <p className="mt-1 text-sm font-medium text-charcoal/50">{material.subtitle}</p>
                <p className="mt-5 text-sm leading-relaxed text-charcoal/70">
                  {material.description}
                </p>
                <p className="mt-5 rounded-xl border border-charcoal/10 bg-warm-white p-4 text-sm leading-relaxed text-charcoal/70">
                  <strong className="text-charcoal">Common use:</strong> {material.bestFor}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-10 rounded-2xl border border-charcoal/10 bg-warm-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-charcoal">
              What to expect from printed shades
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {finishNotes.map((note) => {
                const Icon = note.icon;
                return (
                  <div
                    key={note.title}
                    className="rounded-xl border border-charcoal/10 bg-ivory/30 p-5"
                  >
                    <Icon className="h-5 w-5 text-charcoal/50" />
                    <h3 className="mt-4 text-base font-semibold text-charcoal">{note.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{note.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-charcoal/10 bg-ivory/40 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-charcoal">Variation between pieces</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-charcoal/70">
              <p>
                Lumenform operates as a small-batch design studio, not a mass-production retailer.
                Each shade is produced individually, so minor differences in layer texture, surface
                finish, translucency, geometry, and colour tone are expected.
              </p>
              <p>
                These variations are usually cosmetic and are considered part of the character of
                the object. If a product is materially defective, damaged before collection, or
                substantially inconsistent with the listed description, it is handled through the
                returns and refunds process.
              </p>
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-amber/30 bg-amber/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-charcoal">
              Heat limitation applies to every material
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
              PLA and PETG are suitable for the intended low-heat LED use case. They are not
              suitable for incandescent or halogen bulbs. The LED-only limitation applies to every
              shade, material, colour, and finish.
            </p>
            <Link
              href="/safety"
              className="mt-4 inline-flex text-sm font-semibold text-charcoal underline underline-offset-4"
            >
              Read the LED safety note
            </Link>
          </section>
        </div>
      </section>
    </>
  );
}
