import { db } from "@/lib/db";
import { toProductDTO } from "./dto";

export async function getProductDetail(organizationId: string, userId: string, productId: string) {
  const product = await db.product.findFirst({ where: { id: productId, organizationId } });
  if (!product) return null;

  const [snapshots, productSuppliers, competitors, advertisements, latestAnalysis, relatedProducts, watchlistItem] =
    await Promise.all([
      db.productSnapshot.findMany({ where: { productId }, orderBy: { timestamp: "asc" } }),
      db.productSupplier.findMany({ where: { productId }, include: { supplier: true }, orderBy: { price: "asc" } }),
      db.competitor.findMany({ where: { productId }, include: { snapshots: { orderBy: { timestamp: "desc" }, take: 1 } } }),
      db.advertisement.findMany({ where: { productId }, orderBy: { lastSeenAt: "desc" } }),
      db.aIAnalysis.findFirst({ where: { productId }, orderBy: { createdAt: "desc" } }),
      db.product.findMany({
        where: { organizationId, category: product.category, id: { not: product.id } },
        orderBy: { winnerScore: "desc" },
        take: 4,
      }),
      db.watchlistItem.findUnique({ where: { userId_productId: { userId, productId } } }),
    ]);

  return {
    product: toProductDTO(product),
    snapshots: snapshots.map((s) => ({
      date: s.timestamp.toISOString(),
      orders: s.orders,
      views: s.views,
      price: s.price ? s.price.toNumber() : null,
    })),
    productSuppliers: productSuppliers.map((ps) => ({
      id: ps.id,
      badge: ps.badge,
      price: ps.price ? ps.price.toNumber() : null,
      moq: ps.moq,
      leadTimeDays: ps.leadTimeDays,
      shippingCost: ps.shippingCost ? ps.shippingCost.toNumber() : null,
      supplier: {
        id: ps.supplier.id,
        name: ps.supplier.name,
        platform: ps.supplier.platform,
        country: ps.supplier.country,
        rating: ps.supplier.rating ? ps.supplier.rating.toNumber() : null,
        yearsActive: ps.supplier.yearsActive,
        tradeAssurance: ps.supplier.tradeAssurance,
        supplierScore: ps.supplier.supplierScore ? ps.supplier.supplierScore.toNumber() : null,
        isDemoData: ps.supplier.isDemoData,
      },
    })),
    competitors: competitors.map((c) => ({
      id: c.id,
      name: c.name,
      website: c.website,
      price: c.price ? c.price.toNumber() : null,
      offer: c.offer,
      positioning: c.positioning,
      marketingAngle: c.marketingAngle,
      reviewScore: c.reviewScore ? c.reviewScore.toNumber() : null,
      weaknesses: c.weaknesses,
      opportunityScore: c.opportunityScore ? c.opportunityScore.toNumber() : null,
      isDemoData: c.isDemoData,
    })),
    advertisements: advertisements.map((a) => ({
      id: a.id,
      platform: a.platform,
      advertiser: a.advertiser,
      thumbnailUrl: a.thumbnailUrl,
      copy: a.copy,
      cta: a.cta,
      daysActive: a.daysActive,
      views: a.views,
      likes: a.likes,
      isDemoData: a.isDemoData,
    })),
    latestAnalysis: latestAnalysis
      ? {
          id: latestAnalysis.id,
          overview: latestAnalysis.overview,
          whyTrending: latestAnalysis.whyTrending,
          consumerProblem: latestAnalysis.consumerProblem,
          targetAudience: latestAnalysis.targetAudience,
          buyerPsychology: latestAnalysis.buyerPsychology,
          marketMaturity: latestAnalysis.marketMaturity,
          marketSaturation: latestAnalysis.marketSaturation,
          majorCompetitors: (latestAnalysis.majorCompetitors as string[] | null) ?? [],
          supplierOpportunities: (latestAnalysis.supplierOpportunities as string[] | null) ?? [],
          potentialSellingPrice: latestAnalysis.potentialSellingPrice?.toNumber() ?? null,
          expectedMargins: latestAnalysis.expectedMargins?.toNumber() ?? null,
          brandPotential: latestAnalysis.brandPotential,
          advertisingPotential: latestAnalysis.advertisingPotential,
          tiktokPotential: latestAnalysis.tiktokPotential,
          instagramPotential: latestAnalysis.instagramPotential,
          metaAdsPotential: latestAnalysis.metaAdsPotential,
          risks: latestAnalysis.risks,
          launchRecommendation: latestAnalysis.launchRecommendation,
          confidenceScore: latestAnalysis.confidenceScore?.toNumber() ?? null,
          aiProvider: latestAnalysis.aiProvider,
          createdAt: latestAnalysis.createdAt.toISOString(),
        }
      : null,
    relatedProducts: relatedProducts.map(toProductDTO),
    isWatching: Boolean(watchlistItem),
  };
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductDetail>>>;
