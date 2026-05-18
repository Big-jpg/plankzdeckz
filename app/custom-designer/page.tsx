// app/custom-designer/page.tsx
// Public interactive custom board configurator page.

import type { Metadata } from "next";
import { CustomBoardDesigner } from "@/components/custom-board-designer";

export const metadata: Metadata = {
  title: "Interactive Custom Board Designer | PLANKZ DECKZ",
  description:
    "Design a bespoke PLANKZ DECKZ board with live SVG board shapes, dimension controls, resin inlay bands, and builder-ready truck mounting specifications.",
};

export default function CustomDesignerPage() {
  return <CustomBoardDesigner />;
}
