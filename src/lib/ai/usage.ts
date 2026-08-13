import { db } from "@/lib/db";
import type { AIUsageMeta } from "./types";

/** Persists AI Cost Management data (spec section 44) for every model call. */
export async function recordAIUsage(params: {
  organizationId: string;
  userId?: string | null;
  feature: string;
  usage: AIUsageMeta;
}) {
  if (params.usage.provider === "DEMO") return; // demo calls cost nothing, nothing to track

  await db.aIUsageEvent.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId ?? undefined,
      feature: params.feature,
      provider: params.usage.provider,
      model: params.usage.model,
      inputTokens: params.usage.inputTokens,
      outputTokens: params.usage.outputTokens,
      estimatedCostUsd: params.usage.estimatedCostUsd,
    },
  });
}
