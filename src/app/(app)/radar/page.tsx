import { requireSession } from "@/lib/session";
import { getRadarFacets } from "@/lib/products/facets";
import { RadarView } from "@/components/radar/radar-view";

export default async function ProductRadarPage() {
  const session = await requireSession();
  const facets = await getRadarFacets(session.organizationId);

  return (
    <RadarView
      facets={facets}
      title="Product Radar"
      description="Every product discovered across your connected sources, filterable by score, growth, margin, and competition."
    />
  );
}
