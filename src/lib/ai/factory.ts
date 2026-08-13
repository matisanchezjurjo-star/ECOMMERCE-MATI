import { AnthropicProvider } from "./providers/anthropic";
import { DemoAIProvider } from "./providers/demo";
import { GoogleProvider } from "./providers/google";
import { OpenAIProvider } from "./providers/openai";
import type { AIProvider, AIProviderId } from "./types";

export interface AIProviderPreference {
  provider: AIProviderId;
  model?: string | null;
}

/**
 * Resolves the AIProvider to use, preferring the org's configured choice
 * (Settings > AI Provider) but always falling back to the demo provider
 * when no API key is present for that choice — the app must never crash or
 * silently do nothing just because credentials aren't configured yet.
 */
export function getAIProvider(preference?: AIProviderPreference): AIProvider {
  const provider = preference?.provider ?? "ANTHROPIC";

  switch (provider) {
    case "ANTHROPIC": {
      const key = process.env.ANTHROPIC_API_KEY;
      if (key) return new AnthropicProvider(key, preference?.model ?? "claude-sonnet-5");
      break;
    }
    case "OPENAI": {
      const key = process.env.OPENAI_API_KEY;
      if (key) return new OpenAIProvider(key, preference?.model ?? "gpt-5.1");
      break;
    }
    case "GOOGLE": {
      const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (key) return new GoogleProvider(key, preference?.model ?? "gemini-2.5-pro");
      break;
    }
    default:
      break;
  }

  return new DemoAIProvider();
}

/** Which real providers currently have an API key configured in this environment. */
export function getConfiguredProviders(): Record<Exclude<AIProviderId, "DEMO">, boolean> {
  return {
    ANTHROPIC: Boolean(process.env.ANTHROPIC_API_KEY),
    OPENAI: Boolean(process.env.OPENAI_API_KEY),
    GOOGLE: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
  };
}

export type { AIProvider, AIProviderId } from "./types";
export { AIProviderError } from "./types";
export * from "./schemas";
