"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getAIProvider } from "@/lib/ai/factory";
import { recordAIUsage } from "@/lib/ai/usage";
import type { CreativeInput } from "@/lib/ai/schemas";

export async function generateCreativeForProduct(
  productId: string,
  options: { type: CreativeInput["type"]; durationSeconds: CreativeInput["durationSeconds"]; engine?: CreativeInput["engine"] }
) {
  const session = await requireSession();

  const product = await db.product.findFirst({ where: { id: productId, organizationId: session.organizationId } });
  if (!product) throw new Error("Product not found");

  const provider = getAIProvider({
    provider: session.settings?.aiProvider ?? "ANTHROPIC",
    model: session.settings?.aiModel,
  });

  const result = await provider.generateCreative({
    productTitle: product.title,
    productDescription: product.description,
    type: options.type,
    durationSeconds: options.durationSeconds,
    engine: options.engine,
  });

  await recordAIUsage({
    organizationId: session.organizationId,
    userId: session.userId,
    feature: "generateCreative",
    usage: result.usage,
  });

  const creative = await db.creative.create({
    data: {
      productId: product.id,
      type: options.type,
      engine: options.engine,
      title: result.data.title,
      durationSeconds: options.durationSeconds,
      hook: result.data.hook,
      script: result.data.scenes,
      editingInstructions: result.data.editingInstructions,
      musicDirection: result.data.musicDirection,
      prompt: result.data.generatorPrompt,
      cta: result.data.cta,
      aiProvider: result.usage.provider,
      aiModel: result.usage.model,
    },
  });

  revalidatePath("/creative-studio");
  return { creativeId: creative.id, usedDemoProvider: result.usedDemoProvider, data: result.data };
}
