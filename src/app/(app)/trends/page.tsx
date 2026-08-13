import { LineChart } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export default function TrendsPage() {
  return (
    <ComingSoon
      icon={LineChart}
      title="Trends"
      phase="Phase 3"
      description="Dedicated growth-velocity and acceleration analytics across every discovered product, beyond the per-product trend chart already available today."
      plannedFeatures={[
        "24h / 3-day / 7-day / 30-day growth rollups across your whole catalog",
        "Growth velocity and acceleration detection (spec section 10)",
        "Advertising velocity and competition velocity charts",
        "Category-level trend momentum heatmaps",
      ]}
      availableNow={{ label: "See per-product trend charts in Product Radar", href: "/radar" }}
    />
  );
}
