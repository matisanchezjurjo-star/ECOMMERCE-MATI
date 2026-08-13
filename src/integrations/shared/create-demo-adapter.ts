import type {
  HistoricalMetricPoint,
  IntegrationTypeValue,
  NormalizedProductInput,
  ProductSearchParams,
  ProductSourceAdapter,
  SourceCategory,
  SupplierResult,
} from "../types";
import { DEMO_COUNTRIES, DEMO_PRODUCTS, flattenCatalog } from "./catalog";
import { pick, randomFloat, randomInt, seededRandom } from "./rng";

export interface DemoAdapterConfig {
  key: string;
  name: string;
  category: SourceCategory;
  integrationType: IntegrationTypeValue;
  integrationNotes: string;
  requiredEnvVars: string[];
  /** Domain used to build plausible (non-dereferenced) sourceUrl values. */
  urlDomain: string;
  supplierPlatformName?: string;
}

const SUPPLIER_NAMES = [
  "Shenzhen Yuexin Trading Co.",
  "Guangzhou Haoyu Electronics",
  "Ningbo Star Home Goods",
  "Yiwu Sunrise Commodity Co.",
  "Foshan Kaida Manufacturing",
];

function baseImage(seedStr: string, index: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(seedStr)}-${index}/640/640`;
}

/**
 * Builds a fully working `ProductSourceAdapter` backed by deterministic
 * synthetic data. Used for every source until real credentials are supplied
 * (see each adapter file's `requiredEnvVars`) — every product it returns is
 * flagged `dataConfidence: "DEMO"` so it is never confused with live data.
 */
export function createDemoAdapter(config: DemoAdapterConfig): ProductSourceAdapter {
  function isConfigured() {
    return config.requiredEnvVars.length > 0 && config.requiredEnvVars.every((v) => Boolean(process.env[v]));
  }

  function generateProduct(
    seedStr: string,
    title: string,
    category: string,
    country: string
  ): NormalizedProductInput {
    const rng = seededRandom(`${config.key}:${seedStr}`);
    const cost = randomFloat(rng, 3, 22);
    const sellingPriceEstimate = Math.round(cost * randomFloat(rng, 2.2, 4.2) * 100) / 100;

    const isMarketplace = config.category === "marketplace";
    const isSocial = config.category === "social";
    const isAds = config.category === "ads";
    const isSearch = config.category === "search";
    const isSupplier = config.category === "supplier";

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return {
      title,
      description: `${title} — discovered via ${config.name}. Demo listing generated for development/testing; connect the real ${config.name} integration for live data.`,
      category,
      sourceUrl: `https://${config.urlDomain}/${isSupplier ? "product" : "item"}/${slug}-${randomInt(rng, 10000, 99999)}`,
      supplierName: isSupplier ? pick(rng, SUPPLIER_NAMES) : undefined,
      supplierUrl: isSupplier ? `https://${config.urlDomain}/supplier/${randomInt(rng, 1000, 9999)}` : undefined,
      images: [baseImage(seedStr, 1), baseImage(seedStr, 2), baseImage(seedStr, 3)],
      videoUrls: isSocial ? [`https://example-cdn.invalid/demo-video/${slug}.mp4`] : [],

      cost: isSupplier || isMarketplace ? cost : undefined,
      currency: "USD",
      shippingCost: isSupplier ? randomFloat(rng, 0, 4) : undefined,
      moq: isSupplier ? pick(rng, [1, 1, 1, 50, 100, 200]) : undefined,
      estimatedDeliveryDays: isSupplier ? randomInt(rng, 7, 25) : undefined,
      sellingPriceEstimate,
      marketplacePrice: isMarketplace ? sellingPriceEstimate : undefined,

      reviewCount: isMarketplace ? randomInt(rng, 20, 8000) : undefined,
      averageRating: isMarketplace ? randomFloat(rng, 3.6, 5, 1) : undefined,
      unitsSold: isMarketplace ? randomInt(rng, 50, 20000) : undefined,
      orders: isMarketplace ? randomInt(rng, 50, 20000) : undefined,

      engagement: isSocial ? randomInt(rng, 500, 500000) : undefined,
      likes: isSocial ? randomInt(rng, 200, 300000) : undefined,
      comments: isSocial ? randomInt(rng, 5, 5000) : undefined,
      shares: isSocial ? randomInt(rng, 5, 20000) : undefined,
      views: isSocial ? randomInt(rng, 5000, 5000000) : undefined,

      adCount: isAds ? randomInt(rng, 1, 60) : undefined,
      advertiserCount: isAds ? randomInt(rng, 1, 30) : undefined,

      searchVolume: isSearch ? randomInt(rng, 500, 200000) : undefined,
      searchGrowthPercent: isSearch ? randomFloat(rng, -20, 220, 1) : undefined,

      country,
      targetMarkets: [country],

      viralPotential: isSocial ? randomInt(rng, 30, 95) : undefined,
      brandPotential: randomInt(rng, 25, 90),

      dataConfidence: "DEMO",
    };
  }

  function candidateList(params: ProductSearchParams) {
    const all = flattenCatalog();
    const filtered = all.filter((p) => {
      if (params.category && p.category !== params.category) return false;
      if (params.query && !p.title.toLowerCase().includes(params.query.toLowerCase())) return false;
      return true;
    });
    return (filtered.length > 0 ? filtered : all).slice(0, params.limit ?? 8);
  }

  return {
    key: config.key,
    name: config.name,
    category: config.category,
    integrationType: isConfigured() ? config.integrationType : "DEMO_MOCK",
    integrationNotes: config.integrationNotes,
    requiredEnvVars: config.requiredEnvVars,
    isConfigured,

    async searchProducts(params: ProductSearchParams): Promise<NormalizedProductInput[]> {
      const country = params.country ?? pick(seededRandom(config.key), DEMO_COUNTRIES);
      return candidateList(params).map((c, i) =>
        generateProduct(`${c.title}-${i}`, c.title, c.category, country)
      );
    },

    async getProduct(sourceUrl: string): Promise<NormalizedProductInput | null> {
      const all = flattenCatalog();
      const match = all.find((c) => sourceUrl.toLowerCase().includes(c.title.toLowerCase().split(" ")[0]));
      const chosen = match ?? all[0];
      return generateProduct(sourceUrl, chosen.title, chosen.category, "US");
    },

    async getTrendingProducts(params: ProductSearchParams): Promise<NormalizedProductInput[]> {
      const items = await this.searchProducts({ ...params, limit: params.limit ?? 6 });
      // Trending view skews growth/engagement upward relative to the base search.
      return items.map((item) => ({
        ...item,
        searchGrowthPercent: item.searchGrowthPercent !== undefined ? item.searchGrowthPercent + 40 : undefined,
        viralPotential: item.viralPotential !== undefined ? Math.min(99, item.viralPotential + 15) : undefined,
      }));
    },

    async getHistoricalMetrics(sourceUrl: string): Promise<HistoricalMetricPoint[]> {
      const rng = seededRandom(`${config.key}:history:${sourceUrl}`);
      const points: HistoricalMetricPoint[] = [];
      const days = 30;
      let baseOrders = randomInt(rng, 10, 200);
      let basePrice = randomFloat(rng, 15, 60);
      const trendDrift = randomFloat(rng, -1.5, 4);

      for (let i = days; i >= 0; i--) {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - i);
        baseOrders = Math.max(0, baseOrders + trendDrift + randomFloat(rng, -8, 8));
        basePrice = Math.max(1, basePrice + randomFloat(rng, -0.5, 0.5));
        points.push({
          timestamp,
          price: Math.round(basePrice * 100) / 100,
          orders: Math.round(baseOrders),
          views: Math.round(baseOrders * randomFloat(rng, 15, 40)),
          ranking: randomInt(rng, 1, 500),
          searchVolume: Math.round(baseOrders * randomFloat(rng, 20, 60)),
        });
      }
      return points;
    },

    async getSupplierData(query: string): Promise<SupplierResult[]> {
      if (config.category !== "supplier") return [];
      const rng = seededRandom(`${config.key}:supplier:${query}`);
      const count = randomInt(rng, 3, 5);
      return Array.from({ length: count }, (_, i) => ({
        name: pick(rng, SUPPLIER_NAMES),
        platform: config.supplierPlatformName ?? config.name,
        url: `https://${config.urlDomain}/supplier/${randomInt(rng, 1000, 9999)}`,
        country: pick(rng, ["China", "Vietnam", "India"]),
        price: randomFloat(rng, 2, 20),
        moq: pick(rng, [1, 50, 100, 500]),
        leadTimeDays: randomInt(rng, 5, 30),
        rating: randomFloat(rng, 3.8, 5, 1),
        yearsActive: randomInt(rng, 1, 12),
        tradeAssurance: i % 2 === 0,
        supportsDropshipping: i % 3 !== 0,
        supportsPrivateLabel: i % 2 === 1,
      }));
    },
  };
}

export { DEMO_PRODUCTS };
