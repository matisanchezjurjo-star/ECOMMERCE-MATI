import { Megaphone } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export default function AdIntelligencePage() {
  return (
    <ComingSoon
      icon={Megaphone}
      title="Ad Intelligence"
      phase="Phase 3"
      description="A searchable library of every ad discovered across Meta Ads Library, TikTok Creative Center, and connected platforms, independent of a single product."
      plannedFeatures={[
        "Filterable ad feed by platform, country, advertiser, and virality",
        "Creative thumbnails, copy, CTA, and days-active tracking",
        "Cross-product advertiser intelligence",
      ]}
      availableNow={{ label: "See per-product ad activity in Product Radar", href: "/radar" }}
    />
  );
}
