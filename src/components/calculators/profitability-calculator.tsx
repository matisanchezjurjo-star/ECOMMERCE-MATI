"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/scoring/format";
import {
  applyScenario,
  calculateProfitability,
  type ProfitabilityInputs,
  type ScenarioName,
} from "@/lib/calculators/profitability";

const FIELDS: { key: keyof ProfitabilityInputs; label: string; step?: string; suffix?: string }[] = [
  { key: "sellingPrice", label: "Selling price", suffix: "$" },
  { key: "upsellRevenue", label: "Upsell revenue / order", suffix: "$" },
  { key: "productCost", label: "Product cost", suffix: "$" },
  { key: "shippingCost", label: "Shipping cost", suffix: "$" },
  { key: "fulfillmentCost", label: "Fulfillment cost", suffix: "$" },
  { key: "cac", label: "Customer acquisition cost (CAC)", suffix: "$" },
  { key: "paymentFeePercent", label: "Payment processing fee", suffix: "%" },
  { key: "platformFeePercent", label: "Platform fee", suffix: "%" },
  { key: "taxPercent", label: "Tax", suffix: "%" },
  { key: "returnRatePercent", label: "Return rate", suffix: "%" },
  { key: "monthlyOrders", label: "Estimated monthly orders", suffix: "" },
];

export function ProfitabilityCalculator({
  defaultCost,
  defaultSellingPrice,
  defaultShippingCost,
}: {
  defaultCost: number | null;
  defaultSellingPrice: number | null;
  defaultShippingCost: number | null;
}) {
  const [scenario, setScenario] = useState<ScenarioName>("base");
  const [inputs, setInputs] = useState<ProfitabilityInputs>({
    productCost: defaultCost ?? 8,
    shippingCost: defaultShippingCost ?? 2,
    paymentFeePercent: 2.9,
    platformFeePercent: 0,
    taxPercent: 0,
    fulfillmentCost: 1,
    returnRatePercent: 5,
    cac: 12,
    sellingPrice: defaultSellingPrice ?? 35,
    upsellRevenue: 0,
    monthlyOrders: 300,
  });

  const result = useMemo(
    () => calculateProfitability(scenario === "base" ? inputs : applyScenario(inputs, scenario)),
    [inputs, scenario]
  );

  function update(key: keyof ProfitabilityInputs, value: string) {
    const parsed = Number(value);
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : 0 }));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Profitability Calculator</CardTitle>
        <Tabs value={scenario} onValueChange={(v) => setScenario(v as ScenarioName)}>
          <TabsList>
            <TabsTrigger value="conservative">Conservative</TabsTrigger>
            <TabsTrigger value="base">Base</TabsTrigger>
            <TabsTrigger value="aggressive">Aggressive</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={field.key} className="text-xs text-muted-foreground">
                  {field.label}
                </Label>
                <div className="relative">
                  <Input
                    id={field.key}
                    type="number"
                    min={0}
                    step="0.01"
                    value={inputs[field.key]}
                    onChange={(e) => update(field.key, e.target.value)}
                    className={field.suffix === "$" ? "pl-6" : undefined}
                  />
                  {field.suffix === "$" && (
                    <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                  )}
                  {field.suffix === "%" && (
                    <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 content-start rounded-lg bg-muted/40 p-4">
            <ResultStat label="Revenue (AOV)" value={formatCurrency(result.revenue)} />
            <ResultStat label="Gross profit" value={formatCurrency(result.grossProfit)} />
            <ResultStat label="Contribution margin" value={formatCurrency(result.contributionMargin)} />
            <ResultStat
              label="Net profit / order"
              value={formatCurrency(result.netProfit)}
              tone={result.netProfit >= 0 ? "success" : "destructive"}
            />
            <ResultStat label="Margin %" value={`${result.marginPercent.toFixed(1)}%`} />
            <ResultStat label="Break-even CPA" value={formatCurrency(result.breakEvenCpa)} />
            <ResultStat
              label="Break-even ROAS"
              value={Number.isFinite(result.breakEvenRoas) ? `${result.breakEvenRoas.toFixed(2)}x` : "—"}
            />
            <ResultStat
              label="Est. monthly profit"
              value={formatCurrency(result.estimatedMonthlyProfit)}
              tone={result.estimatedMonthlyProfit >= 0 ? "success" : "destructive"}
              className="col-span-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultStat({
  label,
  value,
  tone,
  className,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`text-lg font-semibold tabular-nums ${tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
