import type { ZodType } from "zod";
import { ZodError } from "zod";

import {
  AdStrategySchema,
  BrandKitSchema,
  CreativeScriptSchema,
  LandingPageSchema,
  MarketResearchSchema,
  ProductAnalysisSchema,
  StoreStructureSchema,
  type AdStrategyInput,
  type AdStrategyOutput,
  type BrandInput,
  type BrandKitOutput,
  type CreativeInput,
  type CreativeScriptOutput,
  type LandingPageInput,
  type LandingPageOutput,
  type MarketResearchInput,
  type MarketResearchOutput,
  type ProductAnalysisInput,
  type ProductAnalysisOutput,
  type StoreStructureInput,
  type StoreStructureOutput,
} from "./schemas";
import {
  buildAdStrategyPrompt,
  buildBrandPrompt,
  buildCreativePrompt,
  buildLandingPagePrompt,
  buildMarketResearchPrompt,
  buildProductAnalysisPrompt,
  buildStoreStructurePrompt,
} from "./prompts";
import { estimateCostUsd } from "./cost";
import {
  AIProviderError,
  type AIGenerationOptions,
  type AIProvider,
  type AIProviderId,
  type AIStructuredResult,
  type AITextResult,
  type AIUsageMeta,
} from "./types";

interface RawModelResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

const MAX_STRUCTURED_ATTEMPTS = 2;

/**
 * Shared implementation for every real (non-demo) provider. Concrete
 * subclasses only need to implement `callModel` against their SDK — every
 * domain capability (analyzeProduct, generateCreative, ...) is built once
 * here on top of `generateStructuredOutput`, so adding a new capability
 * doesn't require touching OpenAI/Anthropic/Google code separately.
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly id: AIProviderId;
  abstract readonly model: string;
  readonly isDemo = false;

  protected abstract callModel(
    prompt: string,
    options: AIGenerationOptions & { jsonMode?: boolean }
  ): Promise<RawModelResult>;

  private buildUsage(inputTokens: number, outputTokens: number): AIUsageMeta {
    return {
      provider: this.id,
      model: this.model,
      inputTokens,
      outputTokens,
      estimatedCostUsd: estimateCostUsd(this.model, inputTokens, outputTokens),
    };
  }

  async generateText(prompt: string, options: AIGenerationOptions = {}): Promise<AITextResult> {
    const { text, inputTokens, outputTokens } = await this.callModel(prompt, options);
    return { text, usage: this.buildUsage(inputTokens, outputTokens) };
  }

  async generateStructuredOutput<T>(
    prompt: string,
    schema: ZodType<T>,
    options: AIGenerationOptions = {}
  ): Promise<AIStructuredResult<T>> {
    let lastText = "";
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_STRUCTURED_ATTEMPTS; attempt++) {
      const attemptPrompt = attempt === 0 ? prompt : buildRepairPrompt(prompt, lastText, lastError);
      const { text, inputTokens, outputTokens } = await this.callModel(attemptPrompt, {
        ...options,
        jsonMode: true,
      });
      lastText = text;
      try {
        const parsed = JSON.parse(extractJson(text));
        const data = schema.parse(parsed);
        return { data, usage: this.buildUsage(inputTokens, outputTokens), usedDemoProvider: false };
      } catch (err) {
        lastError = err;
      }
    }

    throw new AIProviderError(
      `Model output failed schema validation after ${MAX_STRUCTURED_ATTEMPTS} attempts: ${describeError(lastError)}`,
      this.id,
      lastError
    );
  }

  analyzeProduct(input: ProductAnalysisInput): Promise<AIStructuredResult<ProductAnalysisOutput>> {
    return this.generateStructuredOutput(buildProductAnalysisPrompt(input), ProductAnalysisSchema, {
      feature: "analyzeProduct",
    });
  }

  researchMarket(input: MarketResearchInput): Promise<AIStructuredResult<MarketResearchOutput>> {
    return this.generateStructuredOutput(buildMarketResearchPrompt(input), MarketResearchSchema, {
      feature: "researchMarket",
    });
  }

  generateCreative(input: CreativeInput): Promise<AIStructuredResult<CreativeScriptOutput>> {
    return this.generateStructuredOutput(buildCreativePrompt(input), CreativeScriptSchema, {
      feature: "generateCreative",
    });
  }

  generateBrand(input: BrandInput): Promise<AIStructuredResult<BrandKitOutput>> {
    return this.generateStructuredOutput(buildBrandPrompt(input), BrandKitSchema, {
      feature: "generateBrand",
    });
  }

  generateAdStrategy(input: AdStrategyInput): Promise<AIStructuredResult<AdStrategyOutput>> {
    return this.generateStructuredOutput(buildAdStrategyPrompt(input), AdStrategySchema, {
      feature: "generateAdStrategy",
    });
  }

  generateStore(input: StoreStructureInput): Promise<AIStructuredResult<StoreStructureOutput>> {
    return this.generateStructuredOutput(buildStoreStructurePrompt(input), StoreStructureSchema, {
      feature: "generateStore",
    });
  }

  generateLandingPage(input: LandingPageInput): Promise<AIStructuredResult<LandingPageOutput>> {
    return this.generateStructuredOutput(buildLandingPagePrompt(input), LandingPageSchema, {
      feature: "generateLandingPage",
    });
  }
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model output");
  }
  return candidate.slice(start, end + 1);
}

function describeError(error: unknown): string {
  if (error instanceof ZodError) return error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  if (error instanceof Error) return error.message;
  return String(error);
}

function buildRepairPrompt(originalPrompt: string, badOutput: string, error: unknown): string {
  return `${originalPrompt}

Your previous response could not be parsed as valid JSON matching the required shape.
Previous response:
${badOutput.slice(0, 2000)}

Validation error:
${describeError(error)}

Reply again with ONLY the corrected raw JSON object — no markdown fences, no commentary.`;
}
