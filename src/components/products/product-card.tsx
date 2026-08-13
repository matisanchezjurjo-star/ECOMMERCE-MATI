import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WinnerScoreBadge } from "./winner-score-badge";
import { WatchlistButton } from "./watchlist-button";
import { formatCurrency, formatPercent, marginPercent } from "@/lib/scoring/format";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/lib/products/dto";

export function ProductCard({ product, isWatching }: { product: ProductDTO; isWatching: boolean }) {
  const margin = marginPercent(product.cost, product.sellingPriceEstimate);
  const growth = product.searchGrowthPercent;
  const isPositiveGrowth = growth !== null && growth > 0;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Link href={`/products/${product.id}`} className="relative block aspect-square w-full bg-muted">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        {product.isDemoData && (
          <Badge variant="outline" className="absolute top-2 left-2 bg-background/90">
            DEMO
          </Badge>
        )}
        <div className="absolute top-2 right-2">
          <WatchlistButton productId={product.id} initialWatching={isWatching} size="icon" variant="secondary" />
        </div>
      </Link>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <Link href={`/products/${product.id}`} className="line-clamp-2 text-sm font-medium hover:underline">
            {product.title}
          </Link>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="capitalize">{product.sourceKey.replace(/-/g, " ")}</span>
            <span>·</span>
            <span>{product.category}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <WinnerScoreBadge score={product.winnerScore} classification={product.winnerClassification} size="sm" />
          {growth !== null && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositiveGrowth ? "text-success" : "text-destructive"
              )}
            >
              {isPositiveGrowth ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {formatPercent(growth, { signed: true })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-md bg-muted/50 p-2 text-center text-xs">
          <div>
            <div className="text-muted-foreground">Cost</div>
            <div className="font-medium tabular-nums">{formatCurrency(product.cost)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Sell</div>
            <div className="font-medium tabular-nums">{formatCurrency(product.sellingPriceEstimate)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Margin</div>
            <div className="font-medium tabular-nums">{margin !== null ? `${margin.toFixed(0)}%` : "—"}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Competition</span>
          <span className="font-medium">
            {product.competitionScore === null
              ? "—"
              : product.competitionScore < 34
                ? "Low"
                : product.competitionScore < 67
                  ? "Medium"
                  : "High"}
          </span>
        </div>

        <Button asChild size="sm" variant="outline" className="mt-1">
          <Link href={`/products/${product.id}`}>
            View analysis
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
