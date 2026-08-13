import { requireSession } from "@/lib/session";
import { getRadarFacets } from "@/lib/products/facets";
import { RadarView } from "@/components/radar/radar-view";

export default async function WinningProductsPage() {
  const session = await requireSession();
  const facets = await getRadarFacets(session.organizationId);

  return (
    <RadarView
      facets={facets}
      initialFilters={{ minWinnerScore: 70, sort: "winnerScore" }}
      title="Winning Products"
      description="Products scoring 70+ on the Winner Score engine — test-ready and above."
    />
  );
}
