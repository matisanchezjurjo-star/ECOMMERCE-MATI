import { describe, expect, it } from "vitest";
import { applyScenario, calculateProfitability, type ProfitabilityInputs } from "./profitability";

const base: ProfitabilityInputs = {
  productCost: 8,
  shippingCost: 2,
  paymentFeePercent: 2.9,
  platformFeePercent: 0,
  taxPercent: 0,
  fulfillmentCost: 1,
  returnRatePercent: 5,
  cac: 12,
  sellingPrice: 35,
  upsellRevenue: 0,
  monthlyOrders: 300,
};

describe("calculateProfitability", () => {
  it("computes revenue as selling price plus upsells", () => {
    const result = calculateProfitability({ ...base, upsellRevenue: 5 });
    expect(result.revenue).toBe(40);
  });

  it("nets a positive profit for a healthy margin product", () => {
    const result = calculateProfitability(base);
    expect(result.netProfit).toBeGreaterThan(0);
    expect(result.marginPercent).toBeGreaterThan(0);
  });

  it("scales estimated monthly profit by monthly order volume", () => {
    const result = calculateProfitability(base);
    expect(result.estimatedMonthlyProfit).toBeCloseTo(result.netProfit * base.monthlyOrders, 5);
  });

  it("produces a break-even ROAS consistent with break-even CPA", () => {
    const result = calculateProfitability(base);
    expect(result.breakEvenRoas).toBeCloseTo(result.revenue / result.breakEvenCpa, 5);
  });

  it("conservative scenario reduces profit relative to base", () => {
    const conservative = calculateProfitability(applyScenario(base, "conservative"));
    const baseResult = calculateProfitability(base);
    expect(conservative.netProfit).toBeLessThan(baseResult.netProfit);
  });

  it("aggressive scenario increases estimated monthly profit relative to base", () => {
    const aggressive = calculateProfitability(applyScenario(base, "aggressive"));
    const baseResult = calculateProfitability(base);
    expect(aggressive.estimatedMonthlyProfit).toBeGreaterThan(baseResult.estimatedMonthlyProfit);
  });

  it("never divides by zero when revenue is zero", () => {
    const result = calculateProfitability({ ...base, sellingPrice: 0, upsellRevenue: 0 });
    expect(Number.isFinite(result.marginPercent)).toBe(true);
  });
});
