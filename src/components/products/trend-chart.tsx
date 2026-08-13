"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  date: string;
  orders: number | null;
  views: number | null;
  price: number | null;
}

export function TrendChart({ data, metric }: { data: TrendPoint[]; metric: "orders" | "views" | "price" }) {
  const color = metric === "price" ? "var(--color-chart-2)" : "var(--color-chart-1)";

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            minTickGap={30}
          />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            labelFormatter={(v) => (typeof v === "string" ? new Date(v).toLocaleDateString() : String(v ?? ""))}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Line type="monotone" dataKey={metric} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
