import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Palette, Store, Video } from "lucide-react";

import { requireSession } from "@/lib/session";
import { getProductDetail } from "@/lib/products/detail-queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WinnerScoreBadge } from "@/components/products/winner-score-badge";
import { DataConfidenceBadge } from "@/components/products/data-confidence-badge";
import { WatchlistButton } from "@/components/products/watchlist-button";
import { ImageGallery } from "@/components/products/image-gallery";
import { AIAnalysisPanel } from "@/components/products/ai-analysis-panel";
import { TrendPanel } from "@/components/products/trend-panel";
import { SupplierPanel } from "@/components/products/supplier-panel";
import { CompetitorPanel } from "@/components/products/competitor-panel";
import { AdPanel } from "@/components/products/ad-panel";
import { ProductCard } from "@/components/products/product-card";
import { ProfitabilityCalculator } from "@/components/calculators/profitability-calculator";
import { formatCurrency, formatPercent, marginPercent } from "@/lib/scoring/format";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  const detail = await getProductDetail(session.organizationId, session.userId, id);

  if (!detail) notFound();

  const { product } = detail;
  const margin = marginPercent(product.cost, product.sellingPriceEstimate);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4">
        <Link href="/radar" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Back to Product Radar
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{product.title}</h1>
              <DataConfidenceBadge confidence={product.dataConfidence} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground capitalize">
              {product.sourceKey.replace(/-/g, " ")} · {product.category}
              {product.subcategory ? ` · ${product.subcategory}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WatchlistButton productId={product.id} initialWatching={detail.isWatching} />
            <Button asChild variant="outline" size="sm">
              <Link href={`/brand-builder?productId=${product.id}`}>
                <Palette className="size-3.5" />
                Generate Brand
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/creative-studio?productId=${product.id}`}>
                <Video className="size-3.5" />
                Generate Ads
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/store-builder?productId=${product.id}`}>
                <Store className="size-3.5" />
                Build Store
              </Link>
            </Button>
            {product.sourceUrl && (
              <Button asChild variant="ghost" size="sm">
                <a href={product.sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" />
                  Source
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-6">
          <ImageGallery images={product.images} title={product.title} />

          <div className="rounded-lg border p-4">
            <WinnerScoreBadge score={product.winnerScore} classification={product.winnerClassification} size="lg" />
            {product.winnerConfidence !== null && (
              <p className="mt-1 text-xs text-muted-foreground">AI confidence: {product.winnerConfidence}/100</p>
            )}
            {product.winnerRecommendation && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.winnerRecommendation}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm">
            <Stat label="Sourcing cost" value={formatCurrency(product.cost)} />
            <Stat label="Sell price" value={formatCurrency(product.sellingPriceEstimate)} />
            <Stat label="Margin" value={margin !== null ? `${margin.toFixed(0)}%` : "—"} />
            <Stat label="Growth" value={formatPercent(product.searchGrowthPercent, { signed: true })} />
            <Stat
              label="Competition"
              value={product.competitionScore === null ? "—" : product.competitionScore < 34 ? "Low" : product.competitionScore < 67 ? "Medium" : "High"}
            />
            <Stat
              label="Saturation"
              value={product.saturationScore === null ? "—" : product.saturationScore < 34 ? "Low" : product.saturationScore < 67 ? "Medium" : "High"}
            />
            <Stat label="Reviews" value={product.reviewCount?.toLocaleString() ?? "—"} />
            <Stat label="Shipping time" value={product.estimatedDeliveryDays ? `${product.estimatedDeliveryDays}d` : "—"} />
          </div>

          {(product.winnerPositives.length > 0 || product.winnerNegatives.length > 0 || product.winnerRisks.length > 0) && (
            <div className="flex flex-col gap-3 rounded-lg border p-4 text-sm">
              {product.winnerPositives.length > 0 && (
                <List title="Positives" items={product.winnerPositives} variant="success" />
              )}
              {product.winnerNegatives.length > 0 && (
                <List title="Negatives" items={product.winnerNegatives} variant="destructive" />
              )}
              {product.winnerRisks.length > 0 && <List title="Risks" items={product.winnerRisks} variant="warning" />}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <AIAnalysisPanel productId={product.id} analysis={detail.latestAnalysis} />
          <TrendPanel snapshots={detail.snapshots} />
          <ProfitabilityCalculator
            defaultCost={product.cost}
            defaultSellingPrice={product.sellingPriceEstimate}
            defaultShippingCost={product.shippingCost}
          />
          <SupplierPanel productId={product.id} suppliers={detail.productSuppliers} />
          <CompetitorPanel competitors={detail.competitors} />
          <AdPanel ads={detail.advertisements} />

          {detail.relatedProducts.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
                Related Products
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {detail.relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} isWatching={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}

function List({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "success" | "destructive" | "warning";
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <Badge variant={variant} className="text-[10px]">
          {title}
        </Badge>
      </div>
      <ul className="list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
