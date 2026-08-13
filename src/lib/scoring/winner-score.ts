import type {
  ScorableProduct,
  WinnerScoreFactorBreakdown,
  WinnerScorePenalty,
  WinnerScoreResult,
  WinnerClassificationValue,
} from "./types";

/**
 * Winning Product Algorithm (spec section 11).
 *
 * Scores 0-100 from weighted factors, then subtracts risk penalties.
 * Missing inputs are NEVER defaulted upward — they fall back to a neutral
 * 50 and are flagged `wasEstimated`, which drags down the reported
 * confidence. A product with mostly-missing data cannot reach a high score
 * just because its few known factors are strong.
 */

const NEUTRAL_DEFAULT = 50;

const FACTOR_WEIGHTS = {
  viralPotential: 0.15,
  trendMomentum: 0.15,
  marginPotential: 0.15,
  problemSolving: 0.1,
  adPotential: 0.1,
  competitionOpportunity: 0.1,
  supplierQuality: 0.05,
  shippingScore: 0.05,
  brandPotential: 0.05,
  impulsePurchase: 0.05,
  marketGrowth: 0.05,
} as const;

const FACTOR_LABELS: Record<keyof typeof FACTOR_WEIGHTS, string> = {
  viralPotential: "Viral potential",
  trendMomentum: "Trend momentum",
  marginPotential: "Margin potential",
  problemSolving: "Problem-solving fit",
  adPotential: "Advertising potential",
  competitionOpportunity: "Competition opportunity",
  supplierQuality: "Supplier quality",
  shippingScore: "Shipping simplicity",
  brandPotential: "Brand potential",
  impulsePurchase: "Impulse-purchase potential",
  marketGrowth: "Market growth",
};

const PENALTY_WEIGHTS = {
  saturation: 0.22,
  legalRisk: 0.22,
  shippingComplexity: 0.14,
  returnRisk: 0.18,
  seasonalityRisk: 0.12,
};

const PENALTY_LABELS: Record<keyof typeof PENALTY_WEIGHTS, string> = {
  saturation: "Market saturation",
  legalRisk: "Legal / compliance risk",
  shippingComplexity: "Shipping complexity",
  returnRisk: "Return-rate risk",
  seasonalityRisk: "Seasonality risk",
};

const CONFIDENCE_MULTIPLIER: Record<ScorableProduct["dataConfidence"], number> = {
  REAL: 1,
  ESTIMATED: 0.85,
  AI_INFERRED: 0.7,
  DEMO: 0.6,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/** Maps a percentage growth figure (can be negative or >100) onto a 0-100 score. */
function normalizeGrowth(percent: number): number {
  // 0% growth -> 40 (flat is mediocre, not "bad"); 100%+ growth -> 100
  if (percent <= -50) return 0;
  if (percent >= 100) return 100;
  return clamp(40 + percent * 0.6);
}

function deriveMarginScore(product: ScorableProduct): number | null {
  if (product.marginPotential !== null) return clamp(product.marginPotential);
  if (product.cost === null || product.sellingPriceEstimate === null || product.sellingPriceEstimate <= 0) {
    return null;
  }
  const landedCost = product.cost + (product.shippingCost ?? 0);
  const marginPercent = ((product.sellingPriceEstimate - landedCost) / product.sellingPriceEstimate) * 100;
  // 30% margin -> ~50 score, 70%+ margin -> 100 score, <=10% -> near 0
  return clamp((marginPercent - 10) * 1.7);
}

function deriveShippingScore(product: ScorableProduct): number | null {
  if (product.estimatedDeliveryDays === null) return null;
  // 3 days -> 100, 15 days -> ~40, 30+ days -> 0
  return clamp(100 - product.estimatedDeliveryDays * 3.3);
}

function deriveAdPotential(product: ScorableProduct): number | null {
  if (product.adCount === null && product.advertiserCount === null) return null;
  const ads = product.adCount ?? 0;
  const advertisers = product.advertiserCount ?? 0;
  // Some active advertising validates demand, but too many advertisers
  // signals saturation rather than opportunity — score peaks then flattens.
  const activityScore = clamp(Math.log2(ads + 1) * 14);
  const competitionPenalty = advertisers > 25 ? clamp((advertisers - 25) * 0.8) : 0;
  return clamp(activityScore - competitionPenalty * 0.3);
}

function deriveCompetitionOpportunity(product: ScorableProduct): number | null {
  if (product.competitionScore === null) return null;
  return clamp(100 - product.competitionScore);
}

function shippingComplexityPenaltyInput(product: ScorableProduct): number | null {
  if (product.estimatedDeliveryDays === null) return null;
  // 30+ day shipping is high complexity/risk; <=7 days is negligible.
  return clamp((product.estimatedDeliveryDays - 7) * 4);
}

export function calculateWinnerScore(product: ScorableProduct): WinnerScoreResult {
  const rawFactors: Record<keyof typeof FACTOR_WEIGHTS, number | null> = {
    viralPotential: product.viralPotential,
    trendMomentum: product.trendScore,
    marginPotential: deriveMarginScore(product),
    problemSolving: product.problemSolvingPotential,
    adPotential: deriveAdPotential(product),
    competitionOpportunity: deriveCompetitionOpportunity(product),
    supplierQuality: product.supplierReliability,
    shippingScore: deriveShippingScore(product),
    brandPotential: product.brandPotential,
    impulsePurchase: product.impulsePurchasePotential,
    marketGrowth: product.searchGrowthPercent === null ? null : normalizeGrowth(product.searchGrowthPercent),
  };

  const factors: WinnerScoreFactorBreakdown[] = (
    Object.keys(FACTOR_WEIGHTS) as (keyof typeof FACTOR_WEIGHTS)[]
  ).map((key) => {
    const weight = FACTOR_WEIGHTS[key];
    const rawValue = rawFactors[key];
    const wasEstimated = rawValue === null;
    const value = clamp(rawValue ?? NEUTRAL_DEFAULT);
    return {
      key,
      label: FACTOR_LABELS[key],
      weight,
      value,
      wasEstimated,
      contribution: value * weight,
    };
  });

  const rawWeightedScore = factors.reduce((sum, f) => sum + f.contribution, 0);

  const rawPenaltyInputs: Record<keyof typeof PENALTY_WEIGHTS, number | null> = {
    saturation: product.saturationScore,
    legalRisk: product.legalRisk,
    shippingComplexity: shippingComplexityPenaltyInput(product),
    returnRisk: product.returnRisk,
    seasonalityRisk: product.seasonalityRisk,
  };

  const penalties: WinnerScorePenalty[] = (
    Object.keys(PENALTY_WEIGHTS) as (keyof typeof PENALTY_WEIGHTS)[]
  )
    .map((key) => {
      const severity = clamp(rawPenaltyInputs[key] ?? 0);
      const deduction = severity * PENALTY_WEIGHTS[key];
      return { key, label: PENALTY_LABELS[key], severity, deduction };
    })
    .filter((p) => p.severity > 0);

  const totalPenalty = penalties.reduce((sum, p) => sum + p.deduction, 0);
  const score = clamp(Math.round((rawWeightedScore - totalPenalty) * 10) / 10);

  const classification = classify(score);

  const knownFactorCount = factors.filter((f) => !f.wasEstimated).length;
  const completeness = (knownFactorCount / factors.length) * 100;
  const confidence = clamp(
    Math.round(completeness * CONFIDENCE_MULTIPLIER[product.dataConfidence])
  );

  const positives = factors
    .filter((f) => f.value >= 70 && !f.wasEstimated)
    .sort((a, b) => b.value - a.value)
    .map((f) => `${f.label} is strong (${Math.round(f.value)}/100)`);

  const negatives = factors
    .filter((f) => f.value < 40 && !f.wasEstimated)
    .sort((a, b) => a.value - b.value)
    .map((f) => `${f.label} is weak (${Math.round(f.value)}/100)`);

  const risks = penalties
    .filter((p) => p.severity >= 50)
    .sort((a, b) => b.severity - a.severity)
    .map((p) => `${p.label} is elevated (${Math.round(p.severity)}/100)`);

  const recommendation = buildRecommendation(classification, score, confidence, positives, risks);

  return {
    score,
    rawWeightedScore: Math.round(rawWeightedScore * 10) / 10,
    totalPenalty: Math.round(totalPenalty * 10) / 10,
    classification,
    confidence,
    positives,
    negatives,
    risks,
    recommendation,
    factors,
    penalties,
  };
}

function classify(score: number): WinnerClassificationValue {
  if (score >= 90) return "EXTREME_OPPORTUNITY";
  if (score >= 80) return "STRONG_WINNER";
  if (score >= 70) return "TEST_PRODUCT";
  if (score >= 60) return "HIGH_RISK";
  return "REJECT";
}

function buildRecommendation(
  classification: WinnerClassificationValue,
  score: number,
  confidence: number,
  positives: string[],
  risks: string[]
): string {
  const confidenceNote =
    confidence < 50
      ? " Confidence is low — most factors are estimated, not verified; treat this as a lead worth validating, not a final verdict."
      : "";

  switch (classification) {
    case "EXTREME_OPPORTUNITY":
      return `Score ${score}/100 — extreme opportunity. ${positives[0] ?? "Multiple factors are strong."} Move fast: validate suppliers and launch a small test budget within the week.${confidenceNote}`;
    case "STRONG_WINNER":
      return `Score ${score}/100 — strong winner. Backed by ${positives.length || "several"} solid signal(s). Recommend a structured test campaign with a defined kill/scale threshold.${confidenceNote}`;
    case "TEST_PRODUCT":
      return `Score ${score}/100 — worth testing at small budget. Not a guaranteed winner; validate demand with a limited creative test before committing spend.${confidenceNote}`;
    case "HIGH_RISK":
      return `Score ${score}/100 — high risk. ${risks[0] ?? "Multiple weak factors."} Only pursue if you can mitigate the flagged risks first.${confidenceNote}`;
    case "REJECT":
    default:
      return `Score ${score}/100 — recommend against launching. The weighted factors and risk penalties do not support a positive outlook right now.${confidenceNote}`;
  }
}
