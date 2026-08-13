import type {
  AdStrategyInput,
  AdStrategyOutput,
  BrandInput,
  BrandKitOutput,
  CreativeInput,
  CreativeScriptOutput,
  LandingPageInput,
  LandingPageOutput,
  MarketResearchInput,
  MarketResearchOutput,
  ProductAnalysisInput,
  ProductAnalysisOutput,
  StoreStructureInput,
  StoreStructureOutput,
} from "../schemas";
import type {
  AIProvider,
  AIStructuredResult,
  AITextResult,
  AIUsageMeta,
} from "../types";

/**
 * DEMO_MOCK provider. Runs with zero network calls and zero cost so the
 * platform is fully usable before any AI API key is configured. Output is
 * clearly templated, not a real model call — every result this provider
 * returns is flagged `usedDemoProvider: true` so the UI can show a
 * "DEMO DATA" badge instead of presenting it as a real AI analysis.
 */
export class DemoAIProvider implements AIProvider {
  readonly id = "DEMO" as const;
  readonly model = "demo-template-engine";
  readonly isDemo = true;

  private usage(): AIUsageMeta {
    return { provider: this.id, model: this.model, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 };
  }

  async generateText(prompt: string): Promise<AITextResult> {
    return {
      text: `[DEMO MODE — configure an AI provider API key in Settings to generate real output]\n\n${prompt.slice(0, 200)}...`,
      usage: this.usage(),
    };
  }

  async generateStructuredOutput<T>(): Promise<AIStructuredResult<T>> {
    throw new Error(
      "DemoAIProvider does not support generic generateStructuredOutput — use a domain method (analyzeProduct, generateCreative, ...) instead."
    );
  }

  async analyzeProduct(input: ProductAnalysisInput): Promise<AIStructuredResult<ProductAnalysisOutput>> {
    const price = input.sellingPriceEstimate ?? (input.cost ? input.cost * 3.2 : 29.99);
    const margin = input.cost ? Math.round(((price - input.cost) / price) * 100) : 62;

    const data: ProductAnalysisOutput = {
      overview: `${input.title} is a ${input.category.toLowerCase()} product currently being evaluated. This is a DEMO analysis template — connect an AI provider for a real, product-specific breakdown.`,
      whyTrending: "Demo data: rising social engagement and search volume detected in the last 7 days (simulated).",
      consumerProblem: "Demo data: addresses a common pain point in this category (simulated placeholder).",
      targetAudience: "Demo data: primary audience skews 25-44, mobile-first shoppers (simulated).",
      buyerPsychology: "Demo data: impulse-driven purchase with visual/social proof as the main trigger (simulated).",
      marketMaturity: "Demo data: early-growth stage, not yet mainstream (simulated).",
      marketSaturation: `Demo data: ${input.saturationScore ?? 35}/100 saturation — moderate headroom remains (simulated).`,
      majorCompetitors: ["Demo Competitor A", "Demo Competitor B", "Demo Competitor C"],
      supplierOpportunities: ["Demo Supplier — Alibaba (Trade Assurance)", "Demo Supplier — 1688 (lower MOQ)"],
      potentialSellingPrice: Math.round(price * 100) / 100,
      expectedMarginPercent: Math.max(0, Math.min(100, margin)),
      brandPotential: "Demo data: moderate-to-strong brand potential for a focused DTC brand (simulated).",
      advertisingPotential: "Demo data: strong short-form video potential given the visual demo angle (simulated).",
      tiktokPotential: "Demo data: high — product suits organic + paid TikTok creative formats (simulated).",
      instagramPotential: "Demo data: moderate — best via Reels rather than static posts (simulated).",
      metaAdsPotential: "Demo data: moderate CPMs expected in this category (simulated).",
      risks: ["Demo data: shipping time may exceed 15 days from some suppliers", "Demo data: category has seasonal demand swings"],
      launchRecommendation: "Demo data: worth a small validation test budget before scaling (simulated recommendation).",
      confidenceScore: 20,
    };

    return { data, usage: this.usage(), usedDemoProvider: true };
  }

  async researchMarket(input: MarketResearchInput): Promise<AIStructuredResult<MarketResearchOutput>> {
    const data: MarketResearchOutput = {
      summary: `Demo data: simulated market scan for "${input.query}" across ${input.countries.join(", ") || "all regions"}. Connect an AI provider for real research.`,
      emergingNiches: ["Demo niche — smart home accessories", "Demo niche — pet wellness gadgets"],
      opportunities: ["Demo data: low-competition sub-niche identified (simulated)"],
      risks: ["Demo data: category showing early saturation signals (simulated)"],
      recommendedSearchTerms: [input.query, `${input.query} viral`, `${input.query} trending`],
    };
    return { data, usage: this.usage(), usedDemoProvider: true };
  }

  async generateCreative(input: CreativeInput): Promise<AIStructuredResult<CreativeScriptOutput>> {
    const data: CreativeScriptOutput = {
      title: `[DEMO] ${input.type.replace(/_/g, " ")} — ${input.productTitle}`,
      hook: "Demo data: \"You've been doing this wrong the whole time...\" (simulated hook)",
      scenes: [
        {
          scene: "Scene 1 — Hook",
          voiceover: "Demo voiceover line establishing the problem.",
          onScreenText: "STOP scrolling if you own one of these",
          shotDescription: "Close-up handheld shot, natural lighting",
        },
        {
          scene: "Scene 2 — Demonstration",
          voiceover: "Demo voiceover showing the product in use.",
          onScreenText: "This changed everything",
          shotDescription: "Product demo shot, before/after split screen",
        },
        {
          scene: "Scene 3 — CTA",
          voiceover: "Demo voiceover driving urgency.",
          onScreenText: "Link in bio — selling fast",
          shotDescription: "Product hero shot with price overlay",
        },
      ],
      productDemonstration: "Demo data: show the core use-case in the first 3 seconds (simulated).",
      cta: "Demo data: \"Tap the link before it's gone\" (simulated).",
      editingInstructions: "Demo data: fast cuts every 1-2s, captions burned in, trending audio (simulated).",
      musicDirection: "Demo data: upbeat trending sound, 120-130 BPM (simulated).",
      generatorPrompt: `[DEMO PROMPT for ${input.engine ?? "CAPCUT"}] Configure an AI provider to generate an engine-specific prompt for "${input.productTitle}".`,
    };
    return { data, usage: this.usage(), usedDemoProvider: true };
  }

  async generateBrand(input: BrandInput): Promise<AIStructuredResult<BrandKitOutput>> {
    const base = input.productTitle.split(" ")[0] || "Nova";
    const data: BrandKitOutput = {
      names: [`${base}ly`, `Get${base}`, `${base}Co`, `Pure${base}`, `${base}ify`],
      chosenName: `${base}ly`,
      tagline: "Demo data: \"Simple. Better. Different.\" (simulated)",
      positioning: "Demo data: premium-accessible positioning for design-conscious buyers (simulated).",
      usp: "Demo data: the only version of this product with [key differentiator] (simulated).",
      story: "Demo data: founder-led brand story placeholder (simulated).",
      toneOfVoice: "Confident, warm, a little playful",
      colorPalette: { primary: "#111827", secondary: "#F5F5F4", accent: "#22C55E", neutral: "#9CA3AF" },
      typography: { heading: "Geist", body: "Inter" },
      logoConcepts: ["Demo concept: minimal wordmark", "Demo concept: geometric icon + wordmark"],
      domainSuggestions: [`get${base.toLowerCase()}.com`, `${base.toLowerCase()}co.com`, `try${base.toLowerCase()}.com`],
      socialHandles: [`@${base.toLowerCase()}`, `@get.${base.toLowerCase()}`],
      packagingIdeas: ["Demo data: minimalist kraft box with embossed logo (simulated)"],
      memorabilityScore: 55,
      premiumPerceptionScore: 50,
      trademarkRiskScore: 40,
      domainPotentialScore: 50,
    };
    return { data, usage: this.usage(), usedDemoProvider: true };
  }

  async generateAdStrategy(input: AdStrategyInput): Promise<AIStructuredResult<AdStrategyOutput>> {
    const data: AdStrategyOutput = {
      angles: ["Demo angle: problem/solution", "Demo angle: social proof", "Demo angle: scarcity/urgency"],
      personas: [
        { name: "Demo Persona A", description: "Simulated primary buyer persona.", painPoints: ["Demo pain point 1"] },
      ],
      painPoints: ["Demo data: pain point placeholder"],
      desires: ["Demo data: desire placeholder"],
      objections: ["Demo data: \"Is this worth the price?\" (simulated)"],
      hooks: ["Demo hook 1", "Demo hook 2", "Demo hook 3"],
      offers: ["Demo offer: buy 2 get 1 free", "Demo offer: free shipping over $40"],
      pricingStrategy: `Demo data: anchor at ${input.sellingPrice ? input.sellingPrice * 1.4 : "$49.99"} with a discount to ${input.sellingPrice ?? "$29.99"} (simulated).`,
      testingMatrix: [
        { angle: "Problem/solution", hook: "Demo hook 1", format: "UGC", audience: "Broad 25-44", cta: "Shop Now" },
        { angle: "Social proof", hook: "Demo hook 2", format: "Static", audience: "Lookalike 1%", cta: "Learn More" },
      ],
      retargetingStrategy: "Demo data: 3-day and 7-day cart abandonment sequences (simulated).",
      scalingStrategy: "Demo data: scale winning ad sets 20% every 3 days once ROAS target is hit (simulated).",
    };
    return { data, usage: this.usage(), usedDemoProvider: true };
  }

  async generateStore(input: StoreStructureInput): Promise<AIStructuredResult<StoreStructureOutput>> {
    const platform = input.targetMarkets.some((m) => ["AR", "BR", "MX", "CL", "CO"].includes(m.toUpperCase()))
      ? "TIENDANUBE"
      : "SHOPIFY";
    const data: StoreStructureOutput = {
      recommendedPlatform: platform,
      recommendationReason: `Demo data: ${platform === "TIENDANUBE" ? "Latin America-focused target markets favor Tiendanube's native local payment/shipping integrations" : "International/multi-currency reach favors Shopify's app ecosystem"} (simulated recommendation).`,
      collections: ["Best Sellers", "New Arrivals", input.category],
      navigation: ["Home", "Shop", input.category, "About", "Contact"],
      policyPages: ["Shipping Policy", "Return Policy", "Privacy Policy", "Terms of Service"],
      seoTitle: `${input.productTitle} | Shop Now`,
      seoDescription: `Demo data: SEO description placeholder for ${input.productTitle} (simulated).`,
    };
    return { data, usage: this.usage(), usedDemoProvider: true };
  }

  async generateLandingPage(input: LandingPageInput): Promise<AIStructuredResult<LandingPageOutput>> {
    const price = input.sellingPrice ?? 29.99;
    const data: LandingPageOutput = {
      seoTitle: `${input.productTitle} — Official Store`,
      seoDescription: `Demo data: SEO description for ${input.productTitle} (simulated).`,
      hero: {
        headline: `Demo Headline: Meet ${input.productTitle}`,
        subheadline: "Demo subheadline placeholder — connect an AI provider for real copy.",
        ctaLabel: "Shop Now",
        imagePrompt: `Product hero shot of ${input.productTitle} on a clean neutral background, studio lighting`,
      },
      problem: { headline: "Demo: The problem you're dealing with", body: "Demo body copy (simulated)." },
      solution: { headline: "Demo: How it solves it", body: "Demo body copy (simulated)." },
      benefits: [
        { title: "Demo Benefit 1", description: "Simulated benefit description." },
        { title: "Demo Benefit 2", description: "Simulated benefit description." },
      ],
      productDemo: { headline: "See it in action", videoPrompt: `Product demo video of ${input.productTitle}, 15 seconds, UGC style` },
      features: ["Demo feature 1", "Demo feature 2", "Demo feature 3"],
      socialProof: {
        headline: "Loved by thousands",
        testimonials: [{ name: "Demo Customer", quote: "Simulated testimonial quote." }],
      },
      comparison: {
        headline: "Why choose us",
        rows: [{ feature: "Quality", us: "Premium", competitors: "Standard" }],
      },
      offer: { headline: "Limited-time offer", body: "Demo offer copy (simulated).", bundles: ["Buy 1", "Buy 2 & Save"] },
      guarantee: { headline: "30-Day Guarantee", body: "Demo guarantee copy (simulated)." },
      faq: [{ question: "Demo question?", answer: "Demo answer (simulated)." }],
      finalCta: { headline: `Get your ${input.productTitle} today — $${price}`, ctaLabel: "Order Now" },
    };
    return { data, usage: this.usage(), usedDemoProvider: true };
  }
}
