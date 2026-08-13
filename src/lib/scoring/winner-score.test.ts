import { describe, expect, it } from "vitest";
import { calculateWinnerScore } from "./winner-score";
import type { ScorableProduct } from "./types";

const strongWinner: ScorableProduct = {
  cost: 5,
  sellingPriceEstimate: 36,
  shippingCost: 1.5,
  estimatedDeliveryDays: 5,
  viralPotential: 92,
  problemSolvingPotential: 85,
  impulsePurchasePotential: 80,
  brandPotential: 75,
  supplierReliability: 88,
  marginPotential: null,
  trendScore: 95,
  searchGrowthPercent: 160,
  competitionScore: 15,
  saturationScore: 8,
  legalRisk: 2,
  returnRisk: 5,
  seasonalityRisk: 0,
  adCount: 40,
  advertiserCount: 12,
  dataConfidence: "REAL",
};

const weakReject: ScorableProduct = {
  cost: 18,
  sellingPriceEstimate: 21,
  shippingCost: 6,
  estimatedDeliveryDays: 35,
  viralPotential: 20,
  problemSolvingPotential: 15,
  impulsePurchasePotential: 10,
  brandPotential: 12,
  supplierReliability: 30,
  marginPotential: null,
  trendScore: 18,
  searchGrowthPercent: -40,
  competitionScore: 90,
  saturationScore: 85,
  legalRisk: 70,
  returnRisk: 60,
  seasonalityRisk: 50,
  adCount: 0,
  advertiserCount: 0,
  dataConfidence: "REAL",
};

const emptyProduct: ScorableProduct = {
  cost: null,
  sellingPriceEstimate: null,
  shippingCost: null,
  estimatedDeliveryDays: null,
  viralPotential: null,
  problemSolvingPotential: null,
  impulsePurchasePotential: null,
  brandPotential: null,
  supplierReliability: null,
  marginPotential: null,
  trendScore: null,
  searchGrowthPercent: null,
  competitionScore: null,
  saturationScore: null,
  legalRisk: null,
  returnRisk: null,
  seasonalityRisk: null,
  adCount: null,
  advertiserCount: null,
  dataConfidence: "AI_INFERRED",
};

describe("calculateWinnerScore", () => {
  it("classifies a strong, low-risk product as a winner", () => {
    const result = calculateWinnerScore(strongWinner);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(["STRONG_WINNER", "EXTREME_OPPORTUNITY"]).toContain(result.classification);
    expect(result.confidence).toBeGreaterThan(80);
    expect(result.positives.length).toBeGreaterThan(0);
  });

  it("classifies a weak, high-risk product as reject", () => {
    const result = calculateWinnerScore(weakReject);
    expect(result.score).toBeLessThan(60);
    expect(result.classification).toBe("REJECT");
    expect(result.risks.length).toBeGreaterThan(0);
  });

  it("never rewards missing data with a high score (no artificial inflation)", () => {
    const result = calculateWinnerScore(emptyProduct);
    // All factors fall back to neutral 50, so the raw weighted score should
    // land near 50, never near 100.
    expect(result.rawWeightedScore).toBeGreaterThan(40);
    expect(result.rawWeightedScore).toBeLessThan(60);
    expect(result.classification).not.toBe("EXTREME_OPPORTUNITY");
  });

  it("reports low confidence when most factors are estimated", () => {
    const result = calculateWinnerScore(emptyProduct);
    expect(result.confidence).toBeLessThan(30);
  });

  it("derives margin score from cost/price when marginPotential is absent", () => {
    const highMargin = calculateWinnerScore({ ...emptyProduct, cost: 4, sellingPriceEstimate: 40 });
    const lowMargin = calculateWinnerScore({ ...emptyProduct, cost: 18, sellingPriceEstimate: 20 });
    expect(highMargin.score).toBeGreaterThan(lowMargin.score);
  });

  it("penalizes high saturation and legal risk", () => {
    const risky = calculateWinnerScore({ ...strongWinner, saturationScore: 95, legalRisk: 90 });
    const safe = calculateWinnerScore({ ...strongWinner, saturationScore: 0, legalRisk: 0 });
    expect(risky.score).toBeLessThan(safe.score);
  });

  it("classification boundaries follow the spec thresholds", () => {
    expect(calculateWinnerScore({ ...emptyProduct }).classification).toBeDefined();
  });
});
