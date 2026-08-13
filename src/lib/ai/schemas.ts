import { z } from "zod";

/**
 * Zod schemas for every structured AI output in the platform. Every call to
 * `generateStructuredOutput` validates against one of these — raw LLM JSON
 * never reaches the database or the UI unchecked.
 */

export const ProductAnalysisSchema = z.object({
  overview: z.string(),
  whyTrending: z.string(),
  consumerProblem: z.string(),
  targetAudience: z.string(),
  buyerPsychology: z.string(),
  marketMaturity: z.string(),
  marketSaturation: z.string(),
  majorCompetitors: z.array(z.string()).max(8),
  supplierOpportunities: z.array(z.string()).max(6),
  potentialSellingPrice: z.number().positive(),
  expectedMarginPercent: z.number().min(0).max(100),
  brandPotential: z.string(),
  advertisingPotential: z.string(),
  tiktokPotential: z.string(),
  instagramPotential: z.string(),
  metaAdsPotential: z.string(),
  risks: z.array(z.string()).max(6),
  launchRecommendation: z.string(),
  confidenceScore: z.number().min(0).max(100),
});
export type ProductAnalysisOutput = z.infer<typeof ProductAnalysisSchema>;

export const CreativeSceneSchema = z.object({
  scene: z.string(),
  voiceover: z.string(),
  onScreenText: z.string(),
  shotDescription: z.string(),
});

export const CreativeScriptSchema = z.object({
  title: z.string(),
  hook: z.string(),
  scenes: z.array(CreativeSceneSchema).min(2).max(10),
  productDemonstration: z.string(),
  cta: z.string(),
  editingInstructions: z.string(),
  musicDirection: z.string(),
  generatorPrompt: z.string().describe(
    "Ready-to-paste prompt adapted to the requested video generation engine"
  ),
});
export type CreativeScriptOutput = z.infer<typeof CreativeScriptSchema>;

export const MarketResearchSchema = z.object({
  summary: z.string(),
  emergingNiches: z.array(z.string()).max(8),
  opportunities: z.array(z.string()).max(8),
  risks: z.array(z.string()).max(6),
  recommendedSearchTerms: z.array(z.string()).max(10),
});
export type MarketResearchOutput = z.infer<typeof MarketResearchSchema>;

export const BrandKitSchema = z.object({
  names: z.array(z.string()).min(3).max(8),
  chosenName: z.string(),
  tagline: z.string(),
  positioning: z.string(),
  usp: z.string(),
  story: z.string(),
  toneOfVoice: z.string(),
  colorPalette: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    neutral: z.string(),
  }),
  typography: z.object({ heading: z.string(), body: z.string() }),
  logoConcepts: z.array(z.string()).max(4),
  domainSuggestions: z.array(z.string()).max(6),
  socialHandles: z.array(z.string()).max(6),
  packagingIdeas: z.array(z.string()).max(4),
  memorabilityScore: z.number().min(0).max(100),
  premiumPerceptionScore: z.number().min(0).max(100),
  trademarkRiskScore: z.number().min(0).max(100),
  domainPotentialScore: z.number().min(0).max(100),
});
export type BrandKitOutput = z.infer<typeof BrandKitSchema>;

export const AdStrategySchema = z.object({
  angles: z.array(z.string()).max(8),
  personas: z.array(
    z.object({ name: z.string(), description: z.string(), painPoints: z.array(z.string()) })
  ).max(4),
  painPoints: z.array(z.string()).max(8),
  desires: z.array(z.string()).max(8),
  objections: z.array(z.string()).max(8),
  hooks: z.array(z.string()).max(10),
  offers: z.array(z.string()).max(6),
  pricingStrategy: z.string(),
  testingMatrix: z.array(
    z.object({ angle: z.string(), hook: z.string(), format: z.string(), audience: z.string(), cta: z.string() })
  ).max(15),
  retargetingStrategy: z.string(),
  scalingStrategy: z.string(),
});
export type AdStrategyOutput = z.infer<typeof AdStrategySchema>;

export const StoreStructureSchema = z.object({
  recommendedPlatform: z.enum(["SHOPIFY", "TIENDANUBE"]),
  recommendationReason: z.string(),
  collections: z.array(z.string()).max(8),
  navigation: z.array(z.string()).max(8),
  policyPages: z.array(z.string()).max(6),
  seoTitle: z.string(),
  seoDescription: z.string(),
});
export type StoreStructureOutput = z.infer<typeof StoreStructureSchema>;

export const LandingPageSchema = z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  hero: z.object({ headline: z.string(), subheadline: z.string(), ctaLabel: z.string(), imagePrompt: z.string() }),
  problem: z.object({ headline: z.string(), body: z.string() }),
  solution: z.object({ headline: z.string(), body: z.string() }),
  benefits: z.array(z.object({ title: z.string(), description: z.string() })).max(6),
  productDemo: z.object({ headline: z.string(), videoPrompt: z.string() }),
  features: z.array(z.string()).max(8),
  socialProof: z.object({ headline: z.string(), testimonials: z.array(z.object({ name: z.string(), quote: z.string() })).max(5) }),
  comparison: z.object({ headline: z.string(), rows: z.array(z.object({ feature: z.string(), us: z.string(), competitors: z.string() })).max(6) }),
  offer: z.object({ headline: z.string(), body: z.string(), bundles: z.array(z.string()).max(4) }),
  guarantee: z.object({ headline: z.string(), body: z.string() }),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).max(8),
  finalCta: z.object({ headline: z.string(), ctaLabel: z.string() }),
});
export type LandingPageOutput = z.infer<typeof LandingPageSchema>;

export interface ProductAnalysisInput {
  title: string;
  description?: string | null;
  category: string;
  cost?: number | null;
  sellingPriceEstimate?: number | null;
  country?: string | null;
  trendScore?: number | null;
  competitionScore?: number | null;
  saturationScore?: number | null;
  reviewCount?: number | null;
  adCount?: number | null;
}

export interface MarketResearchInput {
  query: string;
  countries: string[];
  categories: string[];
  maxSourcingCost?: number | null;
  minSellingPrice?: number | null;
}

export interface CreativeInput {
  productTitle: string;
  productDescription?: string | null;
  type: "TIKTOK_SCRIPT" | "INSTAGRAM_REEL_SCRIPT" | "META_VIDEO_AD" | "UGC_SCRIPT" | "YOUTUBE_SHORTS_SCRIPT";
  durationSeconds: 15 | 30 | 45 | 60;
  engine?: "SORA" | "VEO" | "RUNWAY" | "KLING" | "PIKA" | "CAPCUT";
}

export interface BrandInput {
  productTitle: string;
  productDescription?: string | null;
  category: string;
  targetAudience?: string | null;
}

export interface AdStrategyInput {
  productTitle: string;
  productDescription?: string | null;
  sellingPrice?: number | null;
  targetAudience?: string | null;
}

export interface StoreStructureInput {
  productTitle: string;
  category: string;
  country?: string | null;
  targetMarkets: string[];
  businessModel: string;
  expectedOrderVolume?: string | null;
}

export interface LandingPageInput {
  productTitle: string;
  productDescription?: string | null;
  sellingPrice?: number | null;
  brandName?: string | null;
}
