import { Users } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export default function CompetitorsPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Competitors"
      phase="Phase 3"
      description="The full Competitor Intelligence Engine (spec section 16) — automated discovery of brands selling each product, not just the per-product competitor list available today."
      plannedFeatures={[
        "Automated competitor discovery jobs per product",
        "Competitor Opportunity Score with AI-written differentiation strategy",
        "Historical competitor price/traffic/ad-count snapshots over time",
      ]}
      availableNow={{ label: "See seeded competitor data on product pages", href: "/radar" }}
    />
  );
}
