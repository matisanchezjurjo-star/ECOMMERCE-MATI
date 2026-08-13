/**
 * Product Discovery Engine — adapter contract.
 *
 * Every data source (marketplace, social platform, ad library, search
 * trend feed, or supplier directory) implements this same interface and
 * returns data in the same normalized shape (spec section 7), regardless
 * of how wildly different the underlying source actually is.
 *
 * `integrationType` must accurately describe how the adapter is really
 * wired up — never claim "Official API" for something that scrapes a page.
 */
export type IntegrationTypeValue =
  | "OFFICIAL_API"
  | "PARTNER_API"
  | "PUBLIC_FEED"
  | "SEARCH_API"
  | "BROWSER_AUTOMATION"
  | "SCRAPING"
  | "MANUAL_IMPORT"
  | "DEMO_MOCK";

export type SourceCategory = "marketplace" | "social" | "ads" | "search" | "supplier";

export type DataConfidenceValue = "REAL" | "ESTIMATED" | "AI_INFERRED" | "DEMO";

export interface ProductSearchParams {
  query?: string;
  category?: string;
  country?: string;
  maxCost?: number;
  minCost?: number;
  limit?: number;
}

/** The normalized product model every adapter maps its raw source data into. */
export interface NormalizedProductInput {
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  sourceUrl?: string;
  supplierName?: string;
  supplierUrl?: string;
  images: string[];
  videoUrls: string[];

  cost?: number;
  currency: string;
  shippingCost?: number;
  moq?: number;
  estimatedDeliveryDays?: number;
  sellingPriceEstimate?: number;
  marketplacePrice?: number;

  reviewCount?: number;
  averageRating?: number;
  unitsSold?: number;
  orders?: number;

  engagement?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;

  adCount?: number;
  advertiserCount?: number;

  searchVolume?: number;
  searchGrowthPercent?: number;

  country?: string;
  targetMarkets: string[];

  /** 0-100 heuristics the adapter itself is well-placed to estimate (e.g. review velocity). */
  viralPotential?: number;
  brandPotential?: number;

  dataConfidence: DataConfidenceValue;
}

export interface HistoricalMetricPoint {
  timestamp: Date;
  price?: number;
  orders?: number;
  views?: number;
  ranking?: number;
  searchVolume?: number;
}

export interface SupplierResult {
  name: string;
  platform: string;
  url?: string;
  country?: string;
  price?: number;
  moq?: number;
  leadTimeDays?: number;
  rating?: number;
  yearsActive?: number;
  tradeAssurance?: boolean;
  supportsDropshipping?: boolean;
  supportsPrivateLabel?: boolean;
}

export interface ProductSourceAdapter {
  readonly key: string;
  readonly name: string;
  readonly category: SourceCategory;
  readonly integrationType: IntegrationTypeValue;
  /** One-line explanation of exactly how this adapter is (or would be) wired up. */
  readonly integrationNotes: string;
  /** Env vars required for this adapter to run against the real source. */
  readonly requiredEnvVars: string[];

  /** True once the required credentials are present in the environment. */
  isConfigured(): boolean;

  searchProducts(params: ProductSearchParams): Promise<NormalizedProductInput[]>;
  getProduct(sourceUrl: string): Promise<NormalizedProductInput | null>;
  getTrendingProducts(params: ProductSearchParams): Promise<NormalizedProductInput[]>;
  getHistoricalMetrics(sourceUrl: string): Promise<HistoricalMetricPoint[]>;
  getSupplierData(query: string): Promise<SupplierResult[]>;
}
