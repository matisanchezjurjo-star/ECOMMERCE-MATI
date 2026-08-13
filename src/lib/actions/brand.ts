"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getAIProvider } from "@/lib/ai/factory";
import { recordAIUsage } from "@/lib/ai/usage";

export async function generateBrandForProduct(productId: string) {
  const session = await requireSession();

  const product = await db.product.findFirst({ where: { id: productId, organizationId: session.organizationId } });
  if (!product) throw new Error("Product not found");

  const provider = getAIProvider({
    provider: session.settings?.aiProvider ?? "ANTHROPIC",
    model: session.settings?.aiModel,
  });

  const result = await provider.generateBrand({
    productTitle: product.title,
    productDescription: product.description,
    category: product.category,
  });

  await recordAIUsage({
    organizationId: session.organizationId,
    userId: session.userId,
    feature: "generateBrand",
    usage: result.usage,
  });

  const brand = await db.brand.create({
    data: {
      organizationId: session.organizationId,
      productId: product.id,
      name: result.data.chosenName,
      tagline: result.data.tagline,
      positioning: result.data.positioning,
      usp: result.data.usp,
      story: result.data.story,
      toneOfVoice: result.data.toneOfVoice,
      colorPalette: result.data.colorPalette,
      typography: result.data.typography,
      logoConcepts: result.data.logoConcepts,
      domainSuggestions: result.data.domainSuggestions,
      socialHandles: result.data.socialHandles,
      packagingIdeas: result.data.packagingIdeas,
      memorabilityScore: result.data.memorabilityScore,
      premiumPerceptionScore: result.data.premiumPerceptionScore,
      trademarkRiskScore: result.data.trademarkRiskScore,
      domainPotentialScore: result.data.domainPotentialScore,
      overallScore: (result.data.memorabilityScore + result.data.premiumPerceptionScore + result.data.domainPotentialScore) / 3,
      aiProvider: result.usage.provider,
      aiModel: result.usage.model,
    },
  });

  revalidatePath("/brand-builder");
  return { brandId: brand.id, usedDemoProvider: result.usedDemoProvider, data: result.data };
}
