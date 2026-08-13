import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

export const SORT_OPTIONS = [
  "winnerScore",
  "growth",
  "margin",
  "competition",
  "newest",
  "viral",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const ProductFiltersSchema = z.object({
  q: z.string().optional(),
  source: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  trend: z.enum(["RISING_FAST", "RISING", "STABLE", "DECLINING", "DECLINING_FAST", "NEW"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minCost: z.coerce.number().optional(),
  maxCost: z.coerce.number().optional(),
  minMargin: z.coerce.number().optional(),
  minWinnerScore: z.coerce.number().optional(),
  minGrowth: z.coerce.number().optional(),
  maxCompetition: z.coerce.number().optional(),
  maxSaturation: z.coerce.number().optional(),
  maxShippingDays: z.coerce.number().optional(),
  minEngagement: z.coerce.number().optional(),
  minAdCount: z.coerce.number().optional(),
  watchlistOnly: z.coerce.boolean().optional(),
  sort: z.enum(SORT_OPTIONS).optional().default("winnerScore"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(24),
});
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

export function parseProductFilters(searchParams: URLSearchParams): ProductFilters {
  return ProductFiltersSchema.parse(Object.fromEntries(searchParams.entries()));
}

export function buildProductWhere(organizationId: string, filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { organizationId };

  if (filters.q) where.title = { contains: filters.q, mode: "insensitive" };
  if (filters.source) where.sourceKey = filters.source;
  if (filters.category) where.category = filters.category;
  if (filters.country) where.country = filters.country;
  if (filters.trend) where.trendDirection = filters.trend;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.sellingPriceEstimate = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.minCost !== undefined || filters.maxCost !== undefined) {
    where.cost = {
      ...(filters.minCost !== undefined ? { gte: filters.minCost } : {}),
      ...(filters.maxCost !== undefined ? { lte: filters.maxCost } : {}),
    };
  }
  if (filters.minWinnerScore !== undefined) {
    where.winnerScore = { gte: filters.minWinnerScore };
  }
  if (filters.minGrowth !== undefined) {
    where.searchGrowthPercent = { gte: filters.minGrowth };
  }
  if (filters.maxCompetition !== undefined) {
    where.competitionScore = { lte: filters.maxCompetition };
  }
  if (filters.maxSaturation !== undefined) {
    where.saturationScore = { lte: filters.maxSaturation };
  }
  if (filters.maxShippingDays !== undefined) {
    where.estimatedDeliveryDays = { lte: filters.maxShippingDays };
  }
  if (filters.minEngagement !== undefined) {
    where.engagement = { gte: filters.minEngagement };
  }
  if (filters.minAdCount !== undefined) {
    where.adCount = { gte: filters.minAdCount };
  }

  return where;
}

export function buildProductOrderBy(sort: SortOption): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "growth":
      return { searchGrowthPercent: "desc" };
    case "margin":
      return { marginPotential: "desc" };
    case "competition":
      return { competitionScore: "asc" };
    case "newest":
      return { firstSeenAt: "desc" };
    case "viral":
      return { viralPotential: "desc" };
    case "winnerScore":
    default:
      return { winnerScore: "desc" };
  }
}
