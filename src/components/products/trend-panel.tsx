"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendChart, type TrendPoint } from "./trend-chart";

export function TrendPanel({ snapshots }: { snapshots: TrendPoint[] }) {
  const [metric, setMetric] = useState<"orders" | "views" | "price">("orders");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Trend History</CardTitle>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="views">Views</TabsTrigger>
            <TabsTrigger value="price">Price</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {snapshots.length < 2 ? (
          <p className="text-sm text-muted-foreground">Not enough history yet to chart a trend.</p>
        ) : (
          <TrendChart data={snapshots} metric={metric} />
        )}
      </CardContent>
    </Card>
  );
}
