import { Truck } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export default function SuppliersPage() {
  return (
    <ComingSoon
      icon={Truck}
      title="Suppliers"
      phase="Phase 3"
      description="A cross-product supplier directory and comparison view, building on the per-product supplier search already live today."
      plannedFeatures={[
        "All suppliers found across your workspace in one searchable table",
        "Supplier Score comparison: best price, best quality, best for testing, best for scaling",
        "Certifications, trade assurance, and response-rate filters",
      ]}
      availableNow={{ label: "Find suppliers from any product's detail page", href: "/radar" }}
    />
  );
}
