import { Store } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export default function StoreBuilderPage() {
  return (
    <ComingSoon
      icon={Store}
      title="Store Builder"
      phase="Phase 5"
      description="Shopify/Tiendanube OAuth connection and automated store structure generation. The AI provider abstraction already supports generateStore() and generateLandingPage() — this page will surface that as a guided workflow with real API-confirmed publishing."
      plannedFeatures={[
        "Shopify Admin API OAuth connection (Integration model is schema-ready)",
        "Tiendanube/Nuvemshop API connection",
        "AI-recommended platform choice with reasoning, collections, navigation, and policy pages",
        "Landing page generator with drag-and-drop section editor",
        "Never marks a step as done unless the platform API actually confirms it",
      ]}
    />
  );
}
