import { db } from "@/lib/db";
import { PRODUCT_SOURCE_ADAPTERS } from "@/integrations/registry";
import type { RadarFacets } from "@/components/radar/types";

export async function getRadarFacets(organizationId: string): Promise<RadarFacets> {
  const [categories, countries] = await Promise.all([
    db.product.findMany({ where: { organizationId }, select: { category: true }, distinct: ["category"] }),
    db.product.findMany({
      where: { organizationId, country: { not: null } },
      select: { country: true },
      distinct: ["country"],
    }),
  ]);

  return {
    categories: categories.map((c) => c.category).sort(),
    countries: countries.map((c) => c.country!).filter(Boolean).sort(),
    sources: PRODUCT_SOURCE_ADAPTERS.map((a) => ({ key: a.key, name: a.name })),
  };
}
