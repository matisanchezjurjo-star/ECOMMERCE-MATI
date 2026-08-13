"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getAIProvider } from "@/lib/ai/factory";
import { recordAIUsage } from "@/lib/ai/usage";

export async function analyzeProductWithAI(productId: string) {
  const session = await requireSession();

  const product = await db.product.findFirst({
    where: { id: productId, organizationId: session.organizationId },
  });
  if (!product) throw new Error("Product not found");

  const provider = getAIProvider({
    provider: session.settings?.aiProvider ?? "ANTHROPIC",
    model: session.settings?.aiModel,
  });

  const result = await provider.analyzeProduct({
    title: product.title,
    description: product.description,
    category: product.category,
    cost: product.cost?.toNumber() ?? null,
    sellingPriceEstimate: product.sellingPriceEstimate?.toNumber() ?? null,
    country: product.country,
    trendScore: product.trendScore?.toNumber() ?? null,
    competitionScore: product.competitionScore?.toNumber() ?? null,
    saturationScore: product.saturationScore?.toNumber() ?? null,
    reviewCount: product.reviewCount,
    adCount: product.adCount,
  });

  await recordAIUsage({
    organizationId: session.organizationId,
    userId: session.userId,
    feature: "analyzeProduct",
    usage: result.usage,
  });

  const analysis = await db.aIAnalysis.create({
    data: {
      organizationId: session.organizationId,
      productId: product.id,
      overview: result.data.overview,
      whyTrending: result.data.whyTrending,
      consumerProblem: result.data.consumerProblem,
      targetAudience: result.data.targetAudience,
      buyerPsychology: result.data.buyerPsychology,
      marketMaturity: result.data.marketMaturity,
      marketSaturation: result.data.marketSaturation,
      majorCompetitors: result.data.majorCompetitors,
      supplierOpportunities: result.data.supplierOpportunities,
      potentialSellingPrice: result.data.potentialSellingPrice,
      expectedMargins: result.data.expectedMarginPercent,
      brandPotential: result.data.brandPotential,
      advertisingPotential: result.data.advertisingPotential,
      tiktokPotential: result.data.tiktokPotential,
      instagramPotential: result.data.instagramPotential,
      metaAdsPotential: result.data.metaAdsPotential,
      risks: result.data.risks,
      launchRecommendation: result.data.launchRecommendation,
      confidenceScore: result.data.confidenceScore,
      aiProvider: result.usage.provider,
      aiModel: result.usage.model,
    },
  });

  revalidatePath(`/products/${productId}`);
  return { analysisId: analysis.id, usedDemoProvider: result.usedDemoProvider };
}
