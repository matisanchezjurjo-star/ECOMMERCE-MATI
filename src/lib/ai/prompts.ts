import type {
  AdStrategyInput,
  BrandInput,
  CreativeInput,
  LandingPageInput,
  MarketResearchInput,
  ProductAnalysisInput,
  StoreStructureInput,
} from "./schemas";

const SYSTEM_CONTEXT = `You are the AI research and strategy engine inside EcomHunter AI, an ecommerce
intelligence platform. You analyze real product, market, and advertising data to help
sellers decide what to launch and how to launch it. Be specific and concrete — avoid
generic filler. Ground every claim in the data provided; when data is thin, say so
rather than inventing specifics. Respond with JSON only, matching the requested shape
exactly, no markdown fences, no commentary before or after the JSON.`;

export function buildProductAnalysisPrompt(input: ProductAnalysisInput): string {
  return `${SYSTEM_CONTEXT}

Analyze this ecommerce product opportunity and return a JSON object with keys:
overview, whyTrending, consumerProblem, targetAudience, buyerPsychology, marketMaturity,
marketSaturation, majorCompetitors (string[]), supplierOpportunities (string[]),
potentialSellingPrice (number), expectedMarginPercent (number 0-100), brandPotential,
advertisingPotential, tiktokPotential, instagramPotential, metaAdsPotential,
risks (string[]), launchRecommendation, confidenceScore (number 0-100).

Product:
- Title: ${input.title}
- Description: ${input.description ?? "(none provided)"}
- Category: ${input.category}
- Sourcing cost: ${input.cost ?? "unknown"}
- Estimated selling price: ${input.sellingPriceEstimate ?? "unknown"}
- Target country: ${input.country ?? "unspecified"}
- Trend score (0-100): ${input.trendScore ?? "unknown"}
- Competition score (0-100, higher = more competitive): ${input.competitionScore ?? "unknown"}
- Saturation score (0-100): ${input.saturationScore ?? "unknown"}
- Review count: ${input.reviewCount ?? "unknown"}
- Active ad count observed: ${input.adCount ?? "unknown"}`;
}

export function buildMarketResearchPrompt(input: MarketResearchInput): string {
  return `${SYSTEM_CONTEXT}

Research this market request and return a JSON object with keys: summary,
emergingNiches (string[]), opportunities (string[]), risks (string[]),
recommendedSearchTerms (string[]).

Request: "${input.query}"
Target countries: ${input.countries.join(", ") || "any"}
Categories of interest: ${input.categories.join(", ") || "any"}
Max sourcing cost: ${input.maxSourcingCost ?? "no limit"}
Min selling price target: ${input.minSellingPrice ?? "no limit"}`;
}

export function buildCreativePrompt(input: CreativeInput): string {
  return `${SYSTEM_CONTEXT}

Write a ${input.durationSeconds}-second ${input.type.replace(/_/g, " ").toLowerCase()} for this
product. Return a JSON object with keys: title, hook, scenes (array of
{scene, voiceover, onScreenText, shotDescription}, 3-6 scenes sized to fit the duration),
productDemonstration, cta, editingInstructions, musicDirection, generatorPrompt.

generatorPrompt must be written specifically for the ${input.engine ?? "CAPCUT"} video
generation tool's prompt conventions (camera direction and shot-by-shot detail for
Sora/Veo/Runway/Kling/Pika; a structured timeline/effects brief for CapCut) — do not
write a generic prompt that ignores which tool it targets.

Product: ${input.productTitle}
Description: ${input.productDescription ?? "(none provided)"}`;
}

export function buildBrandPrompt(input: BrandInput): string {
  return `${SYSTEM_CONTEXT}

Create a brand identity for this product. Return a JSON object with keys: names
(3-8 candidate names), chosenName (the best one), tagline, positioning, usp, story,
toneOfVoice, colorPalette ({primary, secondary, accent, neutral} as hex codes),
typography ({heading, body} font names), logoConcepts (string[] of concept
descriptions), domainSuggestions (string[]), socialHandles (string[]), packagingIdeas
(string[]), memorabilityScore, premiumPerceptionScore, trademarkRiskScore,
domainPotentialScore (all 0-100).

Product: ${input.productTitle}
Description: ${input.productDescription ?? "(none provided)"}
Category: ${input.category}
Target audience: ${input.targetAudience ?? "unspecified"}`;
}

export function buildAdStrategyPrompt(input: AdStrategyInput): string {
  return `${SYSTEM_CONTEXT}

Build a paid-advertising strategy for this product. Return a JSON object with keys:
angles (string[]), personas (array of {name, description, painPoints[]}), painPoints
(string[]), desires (string[]), objections (string[]), hooks (string[]), offers
(string[]), pricingStrategy, testingMatrix (array of {angle, hook, format, audience,
cta}, 6-15 rows), retargetingStrategy, scalingStrategy.

Product: ${input.productTitle}
Description: ${input.productDescription ?? "(none provided)"}
Selling price: ${input.sellingPrice ?? "unknown"}
Target audience: ${input.targetAudience ?? "unspecified"}`;
}

export function buildStoreStructurePrompt(input: StoreStructureInput): string {
  return `${SYSTEM_CONTEXT}

Recommend Shopify vs Tiendanube for this seller and outline the store structure.
Return a JSON object with keys: recommendedPlatform ("SHOPIFY" or "TIENDANUBE"),
recommendationReason, collections (string[]), navigation (string[]), policyPages
(string[]), seoTitle, seoDescription.

Product: ${input.productTitle}
Category: ${input.category}
Primary country: ${input.country ?? "unspecified"}
Target markets: ${input.targetMarkets.join(", ") || "unspecified"}
Business model: ${input.businessModel}
Expected order volume: ${input.expectedOrderVolume ?? "unknown"}

Shopify tends to win for international/multi-currency expansion, a mature app
ecosystem, and higher order volumes. Tiendanube tends to win for LatAm-first sellers
needing native Mercado Pago/local payment and shipping integrations at lower cost.`;
}

export function buildLandingPagePrompt(input: LandingPageInput): string {
  return `${SYSTEM_CONTEXT}

Write a direct-response landing page for this product. Return a JSON object with keys:
seoTitle, seoDescription, hero ({headline, subheadline, ctaLabel, imagePrompt}),
problem ({headline, body}), solution ({headline, body}), benefits (array of
{title, description}, up to 6), productDemo ({headline, videoPrompt}), features
(string[]), socialProof ({headline, testimonials: [{name, quote}]}), comparison
({headline, rows: [{feature, us, competitors}]}), offer ({headline, body, bundles[]}),
guarantee ({headline, body}), faq (array of {question, answer}), finalCta
({headline, ctaLabel}).

Product: ${input.productTitle}
Description: ${input.productDescription ?? "(none provided)"}
Selling price: ${input.sellingPrice ?? "unknown"}
Brand name: ${input.brandName ?? "(use a generic brand voice)"}`;
}
