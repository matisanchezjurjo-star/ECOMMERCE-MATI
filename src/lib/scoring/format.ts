import type { WinnerClassificationValue } from "./types";

export const CLASSIFICATION_LABEL: Record<WinnerClassificationValue, string> = {
  EXTREME_OPPORTUNITY: "Extreme Opportunity",
  STRONG_WINNER: "Strong Winner",
  TEST_PRODUCT: "Test Product",
  HIGH_RISK: "High Risk",
  REJECT: "Reject",
};

/** Maps a classification to a semantic badge variant already defined in the design system. */
export const CLASSIFICATION_BADGE_VARIANT: Record<
  WinnerClassificationValue,
  "success" | "info" | "warning" | "destructive"
> = {
  EXTREME_OPPORTUNITY: "success",
  STRONG_WINNER: "success",
  TEST_PRODUCT: "info",
  HIGH_RISK: "warning",
  REJECT: "destructive",
};

export const CLASSIFICATION_TEXT_CLASS: Record<WinnerClassificationValue, string> = {
  EXTREME_OPPORTUNITY: "text-success",
  STRONG_WINNER: "text-success",
  TEST_PRODUCT: "text-info",
  HIGH_RISK: "text-warning",
  REJECT: "text-destructive",
};

export function classifyFromScore(score: number): WinnerClassificationValue {
  if (score >= 90) return "EXTREME_OPPORTUNITY";
  if (score >= 80) return "STRONG_WINNER";
  if (score >= 70) return "TEST_PRODUCT";
  if (score >= 60) return "HIGH_RISK";
  return "REJECT";
}

export function formatCurrency(value: number | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

export function formatPercent(value: number | null | undefined, opts: { signed?: boolean } = {}): string {
  if (value === null || value === undefined) return "—";
  const sign = opts.signed && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function marginPercent(cost: number | null | undefined, price: number | null | undefined): number | null {
  if (!cost || !price || price <= 0) return null;
  return ((price - cost) / price) * 100;
}
