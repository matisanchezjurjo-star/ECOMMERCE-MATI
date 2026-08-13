"use client";

import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { CLASSIFICATION_LABEL } from "@/lib/scoring/format";
import type { WinnerClassificationValue } from "@/lib/scoring/types";
import type { ProductListItem } from "./types";

const CLASSIFICATION_COLOR: Record<WinnerClassificationValue, string> = {
  EXTREME_OPPORTUNITY: "var(--color-success)",
  STRONG_WINNER: "var(--color-success)",
  TEST_PRODUCT: "var(--color-info)",
  HIGH_RISK: "var(--color-warning)",
  REJECT: "var(--color-destructive)",
};

interface Point {
  id: string;
  title: string;
  growth: number;
  score: number;
  margin: number;
  classification: WinnerClassificationValue;
}

export function RadarScatter({ products }: { products: ProductListItem[] }) {
  const router = useRouter();

  const points: Point[] = products
    .filter((p) => p.winnerScore !== null && p.searchGrowthPercent !== null)
    .map((p) => ({
      id: p.id,
      title: p.title,
      growth: p.searchGrowthPercent!,
      score: p.winnerScore!,
      margin: p.cost && p.sellingPriceEstimate ? ((p.sellingPriceEstimate - p.cost) / p.sellingPriceEstimate) * 100 : 20,
      classification: p.winnerClassification ?? "REJECT",
    }));

  if (points.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        No products with both growth and score data to plot.
      </div>
    );
  }

  const byClassification = new Map<WinnerClassificationValue, Point[]>();
  for (const point of points) {
    const arr = byClassification.get(point.classification) ?? [];
    arr.push(point);
    byClassification.set(point.classification, arr);
  }

  return (
    <div className="h-[28rem] rounded-lg border p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            type="number"
            dataKey="growth"
            name="Growth"
            unit="%"
            tick={{ fontSize: 12 }}
            label={{ value: "Search / trend growth %", position: "insideBottom", offset: -5, fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="score"
            name="Winner Score"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: "Winner Score", angle: -90, position: "insideLeft", fontSize: 12 }}
          />
          <ZAxis type="number" dataKey="margin" range={[40, 300]} name="Margin %" unit="%" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Point;
              return (
                <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-muted-foreground">
                    Score {p.score.toFixed(0)} · Growth {p.growth.toFixed(0)}% · {CLASSIFICATION_LABEL[p.classification]}
                  </div>
                </div>
              );
            }}
          />
          {Array.from(byClassification.entries()).map(([classification, data]) => (
            <Scatter
              key={classification}
              name={CLASSIFICATION_LABEL[classification]}
              data={data}
              fill={CLASSIFICATION_COLOR[classification]}
              onClick={(entry) => {
                const point = entry as unknown as Point;
                if (point?.id) router.push(`/products/${point.id}`);
              }}
              cursor="pointer"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
