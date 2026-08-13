import { db } from "@/lib/db";
import { calculateWinnerScore } from "@/lib/scoring/winner-score";
import { productToScorable } from "@/lib/scoring/from-product";
import { PRODUCT_SOURCE_ADAPTERS, getAdapter } from "@/integrations/registry";
import type { NormalizedProductInput, ProductSearchParams } from "@/integrations/types";

export interface DiscoverProductsParams {
  organizationId: string;
  sourceKeys?: string[]; // defaults to all registered sources
  query?: string;
  category?: string;
  country?: string;
  trending?: boolean;
  limitPerSource?: number;
}

export interface DiscoveryResult {
  createdCount: number;
  updatedCount: number;
  bySource: Record<string, { created: number; updated: number; error?: string }>;
}

/**
 * ProductDiscoveryEngine — the orchestration layer described in spec
 * section 6. Fans out to every configured `ProductSourceAdapter`, maps
 * results into the normalized Product model, recalculates the Winner
 * Score, and records a historical snapshot. A single adapter failing never
 * aborts the run for the others (spec section 41).
 */
export class ProductDiscoveryEngine {
  /** Keeps the ProductSource table (used by the admin panel) in sync with the adapter registry. */
  async ensureSourcesSeeded(): Promise<void> {
    for (const adapter of PRODUCT_SOURCE_ADAPTERS) {
      await db.productSource.upsert({
        where: { key: adapter.key },
        create: {
          key: adapter.key,
          name: adapter.name,
          category: adapter.category,
          integrationType: adapter.integrationType,
          status: adapter.isConfigured() ? "CONNECTED" : "DEMO_MODE",
        },
        update: {
          name: adapter.name,
          category: adapter.category,
          integrationType: adapter.integrationType,
          status: adapter.isConfigured() ? "CONNECTED" : "DEMO_MODE",
        },
      });
    }
  }

  async discover(params: DiscoverProductsParams): Promise<DiscoveryResult> {
    await this.ensureSourcesSeeded();

    const keys = params.sourceKeys ?? PRODUCT_SOURCE_ADAPTERS.map((a) => a.key);
    const result: DiscoveryResult = { createdCount: 0, updatedCount: 0, bySource: {} };

    for (const key of keys) {
      const adapter = getAdapter(key);
      if (!adapter) {
        result.bySource[key] = { created: 0, updated: 0, error: "Unknown source key" };
        continue;
      }

      const searchParams: ProductSearchParams = {
        query: params.query,
        category: params.category,
        country: params.country,
        limit: params.limitPerSource ?? 6,
      };

      try {
        const items = params.trending
          ? await adapter.getTrendingProducts(searchParams)
          : await adapter.searchProducts(searchParams);

        let created = 0;
        let updated = 0;
        for (const item of items) {
          const wasCreated = await this.upsertProduct(params.organizationId, adapter.key, item);
          if (wasCreated) created++;
          else updated++;
        }
        result.bySource[key] = { created, updated };
        result.createdCount += created;
        result.updatedCount += updated;
      } catch (err) {
        // Never let one source's failure abort the whole discovery run.
        result.bySource[key] = {
          created: 0,
          updated: 0,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }

    return result;
  }

  private async upsertProduct(
    organizationId: string,
    sourceKey: string,
    item: NormalizedProductInput
  ): Promise<boolean> {
    const source = await db.productSource.findUnique({ where: { key: sourceKey } });

    const existing = await db.product.findFirst({
      where: {
        organizationId,
        sourceKey,
        title: { equals: item.title, mode: "insensitive" },
      },
    });

    const scored = calculateWinnerScore(
      productToScorable({
        cost: item.cost,
        sellingPriceEstimate: item.sellingPriceEstimate,
        shippingCost: item.shippingCost,
        estimatedDeliveryDays: item.estimatedDeliveryDays,
        viralPotential: item.viralPotential,
        brandPotential: item.brandPotential,
        dataConfidence: item.dataConfidence,
        adCount: item.adCount,
        advertiserCount: item.advertiserCount,
        searchGrowthPercent: item.searchGrowthPercent,
      })
    );

    const baseData = {
      title: item.title,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory,
      sourceUrl: item.sourceUrl,
      supplierName: item.supplierName,
      supplierUrl: item.supplierUrl,
      images: item.images,
      videoUrls: item.videoUrls,
      cost: item.cost,
      currency: item.currency,
      shippingCost: item.shippingCost,
      moq: item.moq,
      estimatedDeliveryDays: item.estimatedDeliveryDays,
      sellingPriceEstimate: item.sellingPriceEstimate,
      marketplacePrice: item.marketplacePrice,
      reviewCount: item.reviewCount,
      averageRating: item.averageRating,
      unitsSold: item.unitsSold,
      orders: item.orders,
      engagement: item.engagement,
      likes: item.likes,
      comments: item.comments,
      shares: item.shares,
      views: item.views,
      adCount: item.adCount,
      advertiserCount: item.advertiserCount,
      searchVolume: item.searchVolume,
      searchGrowthPercent: item.searchGrowthPercent,
      country: item.country,
      targetMarkets: item.targetMarkets,
      dataConfidence: item.dataConfidence,
      isDemoData: item.dataConfidence === "DEMO",
      lastSeenAt: new Date(),
      winnerScore: scored.score,
      winnerClassification: scored.classification,
      winnerConfidence: scored.confidence,
      winnerPositives: scored.positives,
      winnerNegatives: scored.negatives,
      winnerRisks: scored.risks,
      winnerRecommendation: scored.recommendation,
      winnerScoredAt: new Date(),
    };

    const product = existing
      ? await db.product.update({ where: { id: existing.id }, data: baseData })
      : await db.product.create({
          data: {
            ...baseData,
            organizationId,
            sourceKey,
            sourceId: source?.id,
            firstSeenAt: new Date(),
          },
        });

    await db.productSnapshot.create({
      data: {
        productId: product.id,
        price: item.sellingPriceEstimate,
        orders: item.orders,
        reviews: item.reviewCount,
        views: item.views,
        likes: item.likes,
        comments: item.comments,
        shares: item.shares,
        adsRunning: item.adCount,
        advertisers: item.advertiserCount,
        searchVolume: item.searchVolume,
        trendScore: null,
        winnerScore: scored.score,
        dataConfidence: item.dataConfidence,
      },
    });

    return !existing;
  }
}

export const productDiscoveryEngine = new ProductDiscoveryEngine();
