import { db } from "@/lib/db";
import { toProductDTO } from "./dto";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function getDashboardData(organizationId: string, userId: string) {
  const since24h = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

  const [
    totalProducts,
    analyzedToday,
    risingFastCount,
    meetsLaunchCriteria,
    topWinners,
    emerging,
    losingMomentum,
    saturated,
    recentlyDiscovered,
    watchlist,
    recentAnalyses,
    watchedIds,
  ] = await Promise.all([
    db.product.count({ where: { organizationId } }),
    db.product.count({ where: { organizationId, firstSeenAt: { gte: since24h } } }),
    db.product.count({ where: { organizationId, trendDirection: "RISING_FAST" } }),
    db.product.count({ where: { organizationId, winnerScore: { gte: 70 } } }),
    db.product.findMany({
      where: { organizationId },
      orderBy: { winnerScore: "desc" },
      take: 5,
    }),
    db.product.findMany({
      where: { organizationId, trendDirection: "RISING_FAST" },
      orderBy: { winnerScore: "desc" },
      take: 6,
    }),
    db.product.findMany({
      where: { organizationId, trendDirection: "DECLINING" },
      orderBy: { searchGrowthPercent: "asc" },
      take: 5,
    }),
    db.product.findMany({
      where: { organizationId, saturationScore: { gte: 70 } },
      orderBy: { saturationScore: "desc" },
      take: 5,
    }),
    db.product.findMany({
      where: { organizationId },
      orderBy: { firstSeenAt: "desc" },
      take: 8,
    }),
    db.watchlistItem.findMany({
      where: { organizationId, userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.aIAnalysis.findMany({
      where: { organizationId },
      include: { product: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.watchlistItem.findMany({ where: { organizationId, userId }, select: { productId: true } }),
  ]);

  const watchedIdSet = new Set(watchedIds.map((w) => w.productId));

  return {
    stats: {
      totalProducts,
      analyzedToday,
      risingFastCount,
      meetsLaunchCriteria,
      topScore: topWinners[0] ? Number(topWinners[0].winnerScore ?? 0) : null,
    },
    topWinners: topWinners.map(toProductDTO),
    emerging: emerging.map(toProductDTO),
    losingMomentum: losingMomentum.map(toProductDTO),
    saturated: saturated.map(toProductDTO),
    recentlyDiscovered: recentlyDiscovered.map(toProductDTO),
    watchlist: watchlist.map((w) => ({ ...toProductDTO(w.product), watchlistItemId: w.id })),
    recentAnalyses: recentAnalyses.map((a) => ({
      id: a.id,
      productId: a.productId,
      productTitle: a.product.title,
      launchRecommendation: a.launchRecommendation,
      createdAt: a.createdAt.toISOString(),
    })),
    watchedIdSet,
  };
}
