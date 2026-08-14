/**
 * Populates an organization with realistic demo data: products discovered
 * across every registered source, 21 days of history with differentiated
 * trend cohorts, suppliers, competitors, ads, a starter watchlist, and
 * default alert rules. Shared by `prisma/seed.ts` (CLI, for local dev) and
 * the in-app "Load Demo Data" action (`lib/actions/demo-data.ts`), so any
 * new organization — not just the fixed CLI demo login — can get an
 * instantly-explorable workspace. Every row is flagged `isDemoData` /
 * `dataConfidence: DEMO`.
 */
import { db } from "@/lib/db";
import { productDiscoveryEngine } from "@/lib/discovery/product-discovery-engine";
import { calculateWinnerScore } from "@/lib/scoring/winner-score";
import { productToScorable } from "@/lib/scoring/from-product";
import { PRODUCT_SOURCE_ADAPTERS } from "@/integrations/registry";
import { seededRandom, pick, randomFloat, randomInt } from "@/integrations/shared/rng";

const SUPPLIER_SEED = [
  { name: "Shenzhen Yuexin Trading Co.", platform: "ALIBABA" as const, country: "China", rating: 4.6, years: 8, trade: true },
  { name: "Guangzhou Haoyu Electronics", platform: "ALIBABA_1688" as const, country: "China", rating: 4.3, years: 5, trade: false },
  { name: "Ningbo Star Home Goods", platform: "MADE_IN_CHINA" as const, country: "China", rating: 4.5, years: 11, trade: true },
  { name: "Yiwu Sunrise Commodity Co.", platform: "ALIEXPRESS" as const, country: "China", rating: 4.1, years: 3, trade: false },
  { name: "Foshan Kaida Manufacturing", platform: "ALIBABA" as const, country: "China", rating: 4.8, years: 14, trade: true },
  { name: "CJ Dropshipping Fulfillment", platform: "CJ_DROPSHIPPING" as const, country: "China", rating: 4.4, years: 6, trade: true },
];

const AD_PLATFORMS = ["META", "TIKTOK", "GOOGLE", "PINTEREST"] as const;
const COMPETITOR_NAMES = [
  "UrbanNest Co.",
  "PureLiving Store",
  "TrendGoods",
  "NovaShop",
  "EverydayEssentials",
  "GlowLab",
  "SwiftGear",
];

export interface PopulateDemoDataResult {
  productCount: number;
  supplierCount: number;
  competitorTargets: number;
  adTargets: number;
  watchlistCount: number;
  bySource: Record<string, { created: number; updated: number; error?: string }>;
}

export async function populateDemoDataForOrg(
  organizationId: string,
  userId: string
): Promise<PopulateDemoDataResult> {
  // Make re-runs idempotent: clear previously-seeded demo rows that aren't
  // otherwise upserted by key.
  await db.advertisement.deleteMany({ where: { organizationId, isDemoData: true } });
  await db.competitor.deleteMany({ where: { organizationId, isDemoData: true } });
  await db.supplier.deleteMany({ where: { organizationId, isDemoData: true } });
  await db.alertRule.deleteMany({ where: { organizationId, userId } });

  // 1. Discover products across every registered source ------------------
  await productDiscoveryEngine.ensureSourcesSeeded();

  const bySource: PopulateDemoDataResult["bySource"] = {};
  for (const adapter of PRODUCT_SOURCE_ADAPTERS) {
    const result = await productDiscoveryEngine.discover({
      organizationId,
      sourceKeys: [adapter.key],
      limitPerSource: 6,
      trending: false,
    });
    bySource[adapter.key] = result.bySource[adapter.key];
  }

  const products = await db.product.findMany({ where: { organizationId } });

  // 2. Backfill 21 days of history + differentiate trend cohorts ---------
  const cohortSize = Math.max(1, Math.floor(products.length / 4));
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const risingFast = new Set(shuffled.slice(0, cohortSize).map((p) => p.id));
  const losingMomentum = new Set(shuffled.slice(cohortSize, cohortSize * 2).map((p) => p.id));
  const saturated = new Set(shuffled.slice(cohortSize * 2, cohortSize * 3).map((p) => p.id));

  for (const product of products) {
    const rng = seededRandom(`history:${product.id}`);
    const days = 21;
    let orders = randomInt(rng, 20, 150);
    const cohortDrift = risingFast.has(product.id)
      ? randomFloat(rng, 6, 11)
      : losingMomentum.has(product.id)
        ? randomFloat(rng, -6, -2)
        : randomFloat(rng, -0.5, 1.5);

    await db.productSnapshot.deleteMany({ where: { productId: product.id } });

    const snapshots = [];
    for (let i = days; i >= 0; i--) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - i);
      orders = Math.max(0, orders + cohortDrift + randomFloat(rng, -6, 6));
      snapshots.push({
        productId: product.id,
        timestamp,
        orders: Math.round(orders),
        views: Math.round(orders * randomFloat(rng, 15, 35)),
        reviews: product.reviewCount ? Math.round(product.reviewCount * (0.7 + i * 0.01)) : undefined,
        adsRunning: product.adCount ?? undefined,
        dataConfidence: "DEMO" as const,
      });
    }
    await db.productSnapshot.createMany({ data: snapshots });

    const first = snapshots[0].orders ?? 1;
    const last = snapshots[snapshots.length - 1].orders ?? 1;
    const growthPercent = first > 0 ? ((last - first) / first) * 100 : 0;

    const trendScore = risingFast.has(product.id)
      ? randomInt(rng, 88, 99)
      : losingMomentum.has(product.id)
        ? randomInt(rng, 5, 30)
        : randomInt(rng, 35, 70);

    const saturationScore = saturated.has(product.id)
      ? randomInt(rng, 75, 95)
      : risingFast.has(product.id)
        ? randomInt(rng, 2, 15)
        : randomInt(rng, 10, 45);
    const competitionScore = saturated.has(product.id)
      ? randomInt(rng, 70, 92)
      : risingFast.has(product.id)
        ? randomInt(rng, 5, 20)
        : randomInt(rng, 10, 55);

    const isRising = risingFast.has(product.id);
    const isLosing = losingMomentum.has(product.id);

    const viralPotential = product.viralPotential ?? (isRising ? randomInt(rng, 70, 96) : isLosing ? randomInt(rng, 10, 35) : randomInt(rng, 30, 75));
    const brandPotential = product.brandPotential ?? randomInt(rng, isRising ? 60 : 25, isRising ? 92 : 80);
    const supplierReliability = isRising ? randomInt(rng, 75, 97) : isLosing ? randomInt(rng, 30, 55) : randomInt(rng, 45, 90);
    const problemSolvingPotential = isRising ? randomInt(rng, 70, 95) : isLosing ? randomInt(rng, 15, 40) : randomInt(rng, 35, 80);
    const impulsePurchasePotential = isRising ? randomInt(rng, 65, 93) : isLosing ? randomInt(rng, 15, 40) : randomInt(rng, 30, 78);
    const legalRisk = isRising ? randomInt(rng, 0, 8) : randomInt(rng, 0, 22);
    const returnRisk = isRising ? randomInt(rng, 3, 15) : isLosing ? randomInt(rng, 30, 55) : randomInt(rng, 8, 32);
    const seasonalityRisk = isRising ? randomInt(rng, 0, 10) : randomInt(rng, 0, 28);
    const estimatedDeliveryDays = product.estimatedDeliveryDays ?? (isRising ? randomInt(rng, 4, 10) : randomInt(rng, 6, 22));
    const adCount = product.adCount ?? (isRising ? randomInt(rng, 8, 45) : randomInt(rng, 0, 15));
    const advertiserCount = product.advertiserCount ?? (isRising ? randomInt(rng, 3, 14) : randomInt(rng, 0, 10));

    const scored = calculateWinnerScore(
      productToScorable({
        cost: product.cost,
        sellingPriceEstimate: product.sellingPriceEstimate,
        shippingCost: product.shippingCost,
        estimatedDeliveryDays,
        viralPotential,
        brandPotential,
        marginPotential: product.marginPotential,
        supplierReliability,
        problemSolvingPotential,
        impulsePurchasePotential,
        trendScore,
        searchGrowthPercent: growthPercent,
        competitionScore,
        saturationScore,
        legalRisk,
        returnRisk,
        seasonalityRisk,
        adCount,
        advertiserCount,
        dataConfidence: "DEMO",
      })
    );

    await db.product.update({
      where: { id: product.id },
      data: {
        trendScore,
        searchGrowthPercent: growthPercent,
        saturationScore,
        competitionScore,
        viralPotential,
        brandPotential,
        supplierReliability,
        problemSolvingPotential,
        impulsePurchasePotential,
        legalRisk,
        returnRisk,
        seasonalityRisk,
        estimatedDeliveryDays,
        adCount,
        advertiserCount,
        trendDirection: risingFast.has(product.id)
          ? "RISING_FAST"
          : losingMomentum.has(product.id)
            ? "DECLINING"
            : "STABLE",
        winnerScore: scored.score,
        winnerClassification: scored.classification,
        winnerConfidence: scored.confidence,
        winnerPositives: scored.positives,
        winnerNegatives: scored.negatives,
        winnerRisks: scored.risks,
        winnerRecommendation: scored.recommendation,
        winnerScoredAt: new Date(),
        status: scored.score >= 70 ? "VALIDATED" : "ANALYZED",
      },
    });
  }

  // 3. Suppliers -----------------------------------------------------------
  const suppliers = [];
  for (const s of SUPPLIER_SEED) {
    const supplier = await db.supplier.create({
      data: {
        organizationId,
        name: s.name,
        platform: s.platform,
        country: s.country,
        rating: s.rating,
        yearsActive: s.years,
        responseRatePercent: randomFloat(seededRandom(s.name), 70, 99),
        tradeAssurance: s.trade,
        supportsDropshipping: true,
        supportsPrivateLabel: s.years > 5,
        supplierScore: randomFloat(seededRandom(s.name + "score"), 55, 95),
        dataConfidence: "DEMO",
        isDemoData: true,
      },
    });
    suppliers.push(supplier);
  }

  const supplierLinkTargets = products.slice(0, Math.min(20, products.length));
  for (const product of supplierLinkTargets) {
    const rng = seededRandom(`supplier-link:${product.id}`);
    const linkedSuppliers = [...suppliers].sort(() => rng() - 0.5).slice(0, randomInt(rng, 2, 4));
    const badges = ["BEST_PRICE", "BEST_QUALITY", "BEST_FOR_TESTING", "BEST_FOR_SCALING"];
    for (let i = 0; i < linkedSuppliers.length; i++) {
      await db.productSupplier.upsert({
        where: { productId_supplierId: { productId: product.id, supplierId: linkedSuppliers[i].id } },
        create: {
          productId: product.id,
          supplierId: linkedSuppliers[i].id,
          price: product.cost ?? randomFloat(rng, 3, 20),
          moq: pick(rng, [1, 50, 100]),
          leadTimeDays: randomInt(rng, 7, 25),
          shippingCost: randomFloat(rng, 0, 4),
          badge: badges[i] ?? undefined,
        },
        update: {},
      });
    }
  }

  // 4. Competitors -----------------------------------------------------------
  const competitorTargets = products.slice(0, Math.min(15, products.length));
  for (const product of competitorTargets) {
    const rng = seededRandom(`competitor:${product.id}`);
    const count = randomInt(rng, 1, 3);
    for (let i = 0; i < count; i++) {
      const competitor = await db.competitor.create({
        data: {
          organizationId,
          productId: product.id,
          name: pick(rng, COMPETITOR_NAMES),
          website: `https://${pick(rng, COMPETITOR_NAMES)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "")}.com`,
          price: product.sellingPriceEstimate ? Number(product.sellingPriceEstimate) * randomFloat(rng, 0.85, 1.25) : undefined,
          offer: pick(rng, ["Buy 2 Get 1 Free", "Free shipping over $40", "20% off first order", "Bundle & save 15%"]),
          estimatedTraffic: randomInt(rng, 500, 80000),
          positioning: "Mid-market DTC positioning with influencer-led acquisition.",
          marketingAngle: pick(rng, ["Problem/solution UGC", "Before/after transformation", "Founder story"]),
          reviewScore: randomFloat(rng, 3.6, 4.9, 1),
          weaknesses: ["Slow customer support response times", "Limited size/variant range"],
          complaints: ["Shipping delays reported in reviews", "Packaging damaged in transit (occasional)"],
          opportunityScore: randomInt(rng, 40, 90),
          dataConfidence: "DEMO",
          isDemoData: true,
        },
      });

      await db.competitorSnapshot.create({
        data: {
          competitorId: competitor.id,
          price: competitor.price ?? undefined,
          estimatedTraffic: competitor.estimatedTraffic ?? undefined,
          adCount: randomInt(rng, 0, 20),
          reviewScore: competitor.reviewScore ?? undefined,
        },
      });
    }
  }

  // 5. Advertisements -----------------------------------------------------------
  const adTargets = products.slice(0, Math.min(20, products.length));
  for (const product of adTargets) {
    const rng = seededRandom(`ads:${product.id}`);
    const count = randomInt(rng, 1, 4);
    for (let i = 0; i < count; i++) {
      const daysActive = randomInt(rng, 3, 90);
      const firstSeenAt = new Date();
      firstSeenAt.setDate(firstSeenAt.getDate() - daysActive);
      await db.advertisement.create({
        data: {
          organizationId,
          productId: product.id,
          platform: pick(rng, AD_PLATFORMS),
          advertiser: pick(rng, COMPETITOR_NAMES),
          thumbnailUrl: `https://picsum.photos/seed/${product.id}-ad-${i}/400/500`,
          copy: "Stop scrolling — this is the fix you didn't know you needed. Limited stock.",
          cta: pick(rng, ["Shop Now", "Learn More", "Get Yours"]),
          landingPageUrl: product.sourceUrl ?? undefined,
          firstSeenAt,
          lastSeenAt: new Date(),
          daysActive,
          estimatedEngagement: randomInt(rng, 200, 50000),
          views: randomInt(rng, 5000, 2000000),
          likes: randomInt(rng, 100, 80000),
          comments: randomInt(rng, 5, 3000),
          shares: randomInt(rng, 5, 5000),
          country: product.country ?? "US",
          category: product.category,
          dataConfidence: "DEMO",
          isDemoData: true,
        },
      });
    }
  }

  // 6. Watchlist + alerts -----------------------------------------------------------
  const watchTargets = [...products].sort((a, b) => Number(b.winnerScore ?? 0) - Number(a.winnerScore ?? 0)).slice(0, 5);
  for (const product of watchTargets) {
    await db.watchlistItem.upsert({
      where: { userId_productId: { userId, productId: product.id } },
      create: { organizationId, userId, productId: product.id },
      update: {},
    });
  }

  await db.alertRule.createMany({
    data: [
      { organizationId, userId, type: "WINNER_SCORE_ABOVE", thresholdValue: 85, channels: ["IN_APP", "EMAIL"] },
      { organizationId, userId, type: "TREND_GROWTH_ABOVE", thresholdValue: 100, channels: ["IN_APP"] },
    ],
    skipDuplicates: true,
  });

  return {
    productCount: products.length,
    supplierCount: suppliers.length,
    competitorTargets: competitorTargets.length,
    adTargets: adTargets.length,
    watchlistCount: watchTargets.length,
    bySource,
  };
}
