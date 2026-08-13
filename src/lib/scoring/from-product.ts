import type { ScorableProduct } from "./types";

type DecimalLike = { toNumber: () => number } | number | null | undefined;

function toNum(value: DecimalLike): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  return value.toNumber();
}

/**
 * Minimal shape accepted from a Prisma `Product` record (or a plain object
 * shaped like one, e.g. fresh off a source adapter before insertion).
 * Decimal fields may arrive as Prisma.Decimal, number, or null/undefined.
 */
export interface ProductLike {
  cost?: DecimalLike;
  sellingPriceEstimate?: DecimalLike;
  shippingCost?: DecimalLike;
  estimatedDeliveryDays?: number | null;
  viralPotential?: DecimalLike;
  problemSolvingPotential?: DecimalLike;
  impulsePurchasePotential?: DecimalLike;
  brandPotential?: DecimalLike;
  supplierReliability?: DecimalLike;
  marginPotential?: DecimalLike;
  trendScore?: DecimalLike;
  searchGrowthPercent?: DecimalLike;
  competitionScore?: DecimalLike;
  saturationScore?: DecimalLike;
  legalRisk?: DecimalLike;
  returnRisk?: DecimalLike;
  seasonalityRisk?: DecimalLike;
  adCount?: number | null;
  advertiserCount?: number | null;
  dataConfidence?: ScorableProduct["dataConfidence"];
}

export function productToScorable(product: ProductLike): ScorableProduct {
  return {
    cost: toNum(product.cost),
    sellingPriceEstimate: toNum(product.sellingPriceEstimate),
    shippingCost: toNum(product.shippingCost),
    estimatedDeliveryDays: product.estimatedDeliveryDays ?? null,
    viralPotential: toNum(product.viralPotential),
    problemSolvingPotential: toNum(product.problemSolvingPotential),
    impulsePurchasePotential: toNum(product.impulsePurchasePotential),
    brandPotential: toNum(product.brandPotential),
    supplierReliability: toNum(product.supplierReliability),
    marginPotential: toNum(product.marginPotential),
    trendScore: toNum(product.trendScore),
    searchGrowthPercent: toNum(product.searchGrowthPercent),
    competitionScore: toNum(product.competitionScore),
    saturationScore: toNum(product.saturationScore),
    legalRisk: toNum(product.legalRisk),
    returnRisk: toNum(product.returnRisk),
    seasonalityRisk: toNum(product.seasonalityRisk),
    adCount: product.adCount ?? null,
    advertiserCount: product.advertiserCount ?? null,
    dataConfidence: product.dataConfidence ?? "ESTIMATED",
  };
}
