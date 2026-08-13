import OpenAI from "openai";

import { BaseAIProvider } from "../base-provider";
import type { AIGenerationOptions } from "../types";

export class OpenAIProvider extends BaseAIProvider {
  readonly id = "OPENAI" as const;
  readonly model: string;
  private readonly client: OpenAI;

  constructor(apiKey: string, model = "gpt-5.1") {
    super();
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  protected async callModel(prompt: string, options: AIGenerationOptions & { jsonMode?: boolean }) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: options.temperature ?? 0.7,
      max_completion_tokens: options.maxTokens ?? 4096,
      response_format: options.jsonMode ? { type: "json_object" } : undefined,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content ?? "";

    return {
      text,
      inputTokens: completion.usage?.prompt_tokens ?? 0,
      outputTokens: completion.usage?.completion_tokens ?? 0,
    };
  }
}
