/** Profitability Calculator (spec section 29) — pure functions, no side effects. */

export interface ProfitabilityInputs {
  productCost: number;
  shippingCost: number;
  paymentFeePercent: number;
  platformFeePercent: number;
  taxPercent: number;
  fulfillmentCost: number;
  returnRatePercent: number;
  cac: number;
  sellingPrice: number;
  upsellRevenue: number;
  monthlyOrders: number;
}

export interface ProfitabilityResult {
  revenue: number;
  aov: number;
  paymentFee: number;
  platformFee: number;
  tax: number;
  returnLoss: number;
  grossProfit: number;
  contributionMargin: number;
  netProfit: number;
  marginPercent: number;
  breakEvenCpa: number;
  breakEvenRoas: number;
  estimatedMonthlyProfit: number;
}

export function calculateProfitability(inputs: ProfitabilityInputs): ProfitabilityResult {
  const revenue = inputs.sellingPrice + inputs.upsellRevenue;
  const aov = revenue;

  const paymentFee = revenue * (inputs.paymentFeePercent / 100);
  const platformFee = revenue * (inputs.platformFeePercent / 100);
  const tax = revenue * (inputs.taxPercent / 100);
  const returnLoss = revenue * (inputs.returnRatePercent / 100);

  const grossProfit = revenue - inputs.productCost - inputs.shippingCost;
  const contributionMargin =
    revenue -
    inputs.productCost -
    inputs.shippingCost -
    paymentFee -
    platformFee -
    tax -
    inputs.fulfillmentCost;

  const netProfit = contributionMargin - inputs.cac - returnLoss;
  const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const breakEvenCpa = Math.max(0, contributionMargin - returnLoss);
  const breakEvenRoas = breakEvenCpa > 0 ? revenue / breakEvenCpa : Infinity;

  const estimatedMonthlyProfit = netProfit * inputs.monthlyOrders;

  return {
    revenue,
    aov,
    paymentFee,
    platformFee,
    tax,
    returnLoss,
    grossProfit,
    contributionMargin,
    netProfit,
    marginPercent,
    breakEvenCpa,
    breakEvenRoas,
    estimatedMonthlyProfit,
  };
}

export type ScenarioName = "conservative" | "base" | "aggressive";

const SCENARIO_MULTIPLIERS: Record<ScenarioName, { cac: number; orders: number; returnRate: number }> = {
  conservative: { cac: 1.35, orders: 0.55, returnRate: 1.4 },
  base: { cac: 1, orders: 1, returnRate: 1 },
  aggressive: { cac: 0.75, orders: 1.7, returnRate: 0.8 },
};

export function applyScenario(inputs: ProfitabilityInputs, scenario: ScenarioName): ProfitabilityInputs {
  const m = SCENARIO_MULTIPLIERS[scenario];
  return {
    ...inputs,
    cac: inputs.cac * m.cac,
    monthlyOrders: Math.round(inputs.monthlyOrders * m.orders),
    returnRatePercent: inputs.returnRatePercent * m.returnRate,
  };
}
