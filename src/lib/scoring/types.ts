import type { DataConfidence } from "@/generated/prisma/enums";

/**
 * Minimal shape the Winner Score engine needs. Deliberately narrower than
 * the Prisma `Product` model so it can be unit tested with plain objects and
 * reused against partial/denormalized data (e.g. a row fresh off an
 * adapter, before it's ever written to the DB).
 */
export interface ScorableProduct {
  cost: number | null;
  sellingPriceEstimate: number | null;
  shippingCost: number | null;
  estimatedDeliveryDays: number | null;

  viralPotential: number | null; // 0-100
  problemSolvingPotential: number | null; // 0-100
  impulsePurchasePotential: number | null; // 0-100
  brandPotential: number | null; // 0-100
  supplierReliability: number | null; // 0-100
  marginPotential: number | null; // 0-100, overrides derived cost/price margin when present

  trendScore: number | null; // 0-100
  searchGrowthPercent: number | null; // percent, can be negative
  competitionScore: number | null; // 0-100, higher = more competitive
  saturationScore: number | null; // 0-100, higher = more saturated
  legalRisk: number | null; // 0-100, higher = riskier
  returnRisk: number | null; // 0-100, higher = riskier
  seasonalityRisk: number | null; // 0-100, higher = riskier

  adCount: number | null;
  advertiserCount: number | null;

  dataConfidence: DataConfidence;
}

export type WinnerClassificationValue =
  | "EXTREME_OPPORTUNITY"
  | "STRONG_WINNER"
  | "TEST_PRODUCT"
  | "HIGH_RISK"
  | "REJECT";

export interface WinnerScoreFactorBreakdown {
  key: string;
  label: string;
  weight: number; // fraction of 1.0
  value: number; // 0-100, the value actually used (defaulted if missing)
  wasEstimated: boolean; // true if no real input existed and a neutral default was substituted
  contribution: number; // value * weight
}

export interface WinnerScorePenalty {
  key: string;
  label: string;
  severity: number; // 0-100 input risk value
  deduction: number; // points subtracted from the final score
}

export interface WinnerScoreResult {
  score: number; // 0-100, final
  rawWeightedScore: number; // before penalties
  totalPenalty: number;
  classification: WinnerClassificationValue;
  confidence: number; // 0-100 — how much of this is backed by real data
  positives: string[];
  negatives: string[];
  risks: string[];
  recommendation: string;
  factors: WinnerScoreFactorBreakdown[];
  penalties: WinnerScorePenalty[];
}
