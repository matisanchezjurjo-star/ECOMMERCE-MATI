import { GoogleGenerativeAI } from "@google/generative-ai";

import { BaseAIProvider } from "../base-provider";
import type { AIGenerationOptions } from "../types";

export class GoogleProvider extends BaseAIProvider {
  readonly id = "GOOGLE" as const;
  readonly model: string;
  private readonly client: GoogleGenerativeAI;

  constructor(apiKey: string, model = "gemini-2.5-pro") {
    super();
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  protected async callModel(prompt: string, options: AIGenerationOptions & { jsonMode?: boolean }) {
    const generativeModel = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 4096,
        responseMimeType: options.jsonMode ? "application/json" : "text/plain",
      },
    });

    const result = await generativeModel.generateContent(prompt);
    const text = result.response.text();
    const usage = result.response.usageMetadata;

    return {
      text,
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
    };
  }
}
