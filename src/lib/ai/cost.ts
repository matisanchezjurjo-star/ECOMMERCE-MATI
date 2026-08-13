import type { AIProviderId } from "./types";

/**
 * Approximate USD cost per 1M tokens, input/output. Used only for the AI
 * Cost Management dashboard (spec section 44) — not billing-accurate.
 * Update as providers change pricing; unknown models fall back to a
 * conservative default so costs are never silently reported as zero.
 */
const PRICING_PER_MILLION_TOKENS: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-opus-5": { input: 15, output: 75 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4 },
  "gpt-5.1": { input: 2.5, output: 10 },
  "gpt-5.1-mini": { input: 0.4, output: 1.6 },
  "gemini-2.5-pro": { input: 1.25, output: 5 },
  "gemini-2.5-flash": { input: 0.15, output: 0.6 },
  DEMO: { input: 0, output: 0 },
};

const DEFAULT_PRICING = { input: 3, output: 15 };

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING_PER_MILLION_TOKENS[model] ?? DEFAULT_PRICING;
  const cost = (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

export function estimateTokens(text: string): number {
  // Rough heuristic (~4 chars/token) used only when a provider doesn't
  // return exact usage counts.
  return Math.ceil(text.length / 4);
}

export type { AIProviderId };
