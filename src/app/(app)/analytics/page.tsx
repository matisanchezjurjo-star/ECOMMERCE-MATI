import { Gauge } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export default function AnalyticsPage() {
  return (
    <ComingSoon
      icon={Gauge}
      title="Analytics"
      phase="Phase 5"
      description="Store and campaign performance once Shopify/Tiendanube and ad platforms are connected — AI usage/cost analytics live in Settings today."
      plannedFeatures={[
        "Store revenue, orders, and conversion tracking",
        "Campaign ROAS and spend tracking once ad accounts are connected",
        "Database growth and data-freshness dashboards (admin panel)",
      ]}
      availableNow={{ label: "See AI provider status in Settings", href: "/settings" }}
    />
  );
}
