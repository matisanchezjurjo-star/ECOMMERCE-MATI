import Anthropic from "@anthropic-ai/sdk";

import { BaseAIProvider } from "../base-provider";
import type { AIGenerationOptions } from "../types";

export class AnthropicProvider extends BaseAIProvider {
  readonly id = "ANTHROPIC" as const;
  readonly model: string;
  private readonly client: Anthropic;

  constructor(apiKey: string, model = "claude-sonnet-5") {
    super();
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  protected async callModel(prompt: string, options: AIGenerationOptions & { jsonMode?: boolean }) {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return {
      text,
      inputTokens: message.usage.input_tokens ?? 0,
      outputTokens: message.usage.output_tokens ?? 0,
    };
  }
}
