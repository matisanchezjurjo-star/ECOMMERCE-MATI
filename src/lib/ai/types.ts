import type { ZodType } from "zod";
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
} from "./schemas";

export type AIProviderId = "OPENAI" | "ANTHROPIC" | "GOOGLE" | "DEMO";

export interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  /** Which org/feature triggered this call, for cost tracking. */
  feature?: string;
}

export interface AIUsageMeta {
  provider: AIProviderId;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}

export interface AITextResult {
  text: string;
  usage: AIUsageMeta;
}

export interface AIStructuredResult<T> {
  data: T;
  usage: AIUsageMeta;
  usedDemoProvider: boolean;
}

/**
 * The provider abstraction (spec section 5). `generateText` and
 * `generateStructuredOutput` are the only methods each concrete provider
 * (OpenAI / Anthropic / Gemini / Demo) implements from scratch — the
 * domain-level methods below are shared logic built on top of them so every
 * provider automatically supports the full feature set.
 */
export interface AIProvider {
  readonly id: AIProviderId;
  readonly model: string;
  readonly isDemo: boolean;

  generateText(prompt: string, options?: AIGenerationOptions): Promise<AITextResult>;

  generateStructuredOutput<T>(
    prompt: string,
    schema: ZodType<T>,
    options?: AIGenerationOptions
  ): Promise<AIStructuredResult<T>>;

  analyzeProduct(input: ProductAnalysisInput): Promise<AIStructuredResult<ProductAnalysisOutput>>;
  researchMarket(input: MarketResearchInput): Promise<AIStructuredResult<MarketResearchOutput>>;
  generateCreative(input: CreativeInput): Promise<AIStructuredResult<CreativeScriptOutput>>;
  generateBrand(input: BrandInput): Promise<AIStructuredResult<BrandKitOutput>>;
  generateAdStrategy(input: AdStrategyInput): Promise<AIStructuredResult<AdStrategyOutput>>;
  generateStore(input: StoreStructureInput): Promise<AIStructuredResult<StoreStructureOutput>>;
  generateLandingPage(input: LandingPageInput): Promise<AIStructuredResult<LandingPageOutput>>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: AIProviderId,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
