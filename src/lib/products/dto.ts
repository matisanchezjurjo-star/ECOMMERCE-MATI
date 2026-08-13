import type { ProductModel } from "@/generated/prisma/models";

type DecimalLike = { toNumber: () => number } | number | null | undefined;

function n(value: DecimalLike): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : value.toNumber();
}

/**
 * Plain-JSON view of a Product row — Prisma's Decimal/Date types aren't
 * directly serializable across the server/client boundary, so every page
 * that hands product data to a Client Component maps through this first.
 */
export type ProductDTO = ReturnType<typeof toProductDTO>;

export function toProductDTO(p: ProductModel) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    subcategory: p.subcategory,
    sourceKey: p.sourceKey,
    sourceUrl: p.sourceUrl,
    supplierName: p.supplierName,
    supplierUrl: p.supplierUrl,
    images: p.images,
    videoUrls: p.videoUrls,
    cost: n(p.cost),
    currency: p.currency,
    shippingCost: n(p.shippingCost),
    moq: p.moq,
    estimatedDeliveryDays: p.estimatedDeliveryDays,
    sellingPriceEstimate: n(p.sellingPriceEstimate),
    marketplacePrice: n(p.marketplacePrice),
    reviewCount: p.reviewCount,
    averageRating: n(p.averageRating),
    unitsSold: p.unitsSold,
    orders: p.orders,
    engagement: p.engagement,
    likes: p.likes,
    comments: p.comments,
    shares: p.shares,
    views: p.views,
    adCount: p.adCount,
    advertiserCount: p.advertiserCount,
    searchVolume: p.searchVolume,
    searchGrowthPercent: n(p.searchGrowthPercent),
    competitionScore: n(p.competitionScore),
    saturationScore: n(p.saturationScore),
    trendScore: n(p.trendScore),
    firstSeenAt: p.firstSeenAt.toISOString(),
    lastSeenAt: p.lastSeenAt.toISOString(),
    country: p.country,
    targetMarkets: p.targetMarkets,
    supplierReliability: n(p.supplierReliability),
    brandPotential: n(p.brandPotential),
    viralPotential: n(p.viralPotential),
    problemSolvingPotential: n(p.problemSolvingPotential),
    impulsePurchasePotential: n(p.impulsePurchasePotential),
    marginPotential: n(p.marginPotential),
    returnRisk: n(p.returnRisk),
    legalRisk: n(p.legalRisk),
    seasonalityRisk: n(p.seasonalityRisk),
    winnerScore: n(p.winnerScore),
    winnerClassification: p.winnerClassification,
    winnerConfidence: n(p.winnerConfidence),
    winnerPositives: p.winnerPositives,
    winnerNegatives: p.winnerNegatives,
    winnerRisks: p.winnerRisks,
    winnerRecommendation: p.winnerRecommendation,
    dataConfidence: p.dataConfidence,
    status: p.status,
    trendDirection: p.trendDirection,
    isDemoData: p.isDemoData,
    createdAt: p.createdAt.toISOString(),
  };
}
