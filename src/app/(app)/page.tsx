import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Flame,
  Palette,
  Radar,
  Sparkles,
  Store,
  TrendingDown,
  Video,
} from "lucide-react";

import { requireSession } from "@/lib/session";
import { getDashboardData } from "@/lib/products/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { WinnerScoreBadge } from "@/components/products/winner-score-badge";
import { DataConfidenceBadge } from "@/components/products/data-confidence-badge";
import { formatCurrency, formatPercent, marginPercent } from "@/lib/scoring/format";
import type { ProductDTO } from "@/lib/products/dto";

const QUICK_ACTIONS = [
  { label: "Find Winners", href: "/radar?sort=winnerScore", icon: Radar },
  { label: "Analyze a Product", href: "/radar", icon: Sparkles },
  { label: "Create Brand", href: "/brand-builder", icon: Palette },
  { label: "Generate Ads", href: "/creative-studio", icon: Video },
  { label: "Build Store", href: "/store-builder", icon: Store },
];

export default async function DashboardPage() {
  const session = await requireSession();
  const data = await getDashboardData(session.organizationId, session.userId);
  const top = data.topWinners[0];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 p-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
        <p className="text-sm leading-relaxed text-foreground">
          <strong className="font-semibold">{data.stats.analyzedToday}</strong> new products were analyzed today.{" "}
          <strong className="font-semibold">{data.stats.risingFastCount}</strong> show unusual momentum.{" "}
          <strong className="font-semibold">{data.stats.meetsLaunchCriteria}</strong> meet your launch criteria.
          {data.stats.topScore !== null && (
            <>
              {" "}
              The strongest opportunity currently has a Winner Score of{" "}
              <strong className="font-semibold">{data.stats.topScore.toFixed(0)}/100</strong>.
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button key={action.href} asChild variant="outline" size="sm">
              <Link href={action.href}>
                <action.icon className="size-3.5" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {top && (
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            Today&apos;s Top Product
          </h2>
          <Card className="overflow-hidden py-0">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
              <div className="relative aspect-square bg-muted md:aspect-auto">
                {top.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={top.images[0]} alt={top.title} className="size-full object-cover" />
                )}
              </div>
              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/products/${top.id}`} className="text-lg font-semibold hover:underline">
                        {top.title}
                      </Link>
                      {top.isDemoData && <DataConfidenceBadge confidence="DEMO" />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground capitalize">
                      {top.sourceKey.replace(/-/g, " ")} · {top.category}
                    </p>
                  </div>
                  <WinnerScoreBadge score={top.winnerScore} classification={top.winnerClassification} size="lg" />
                </div>

                {top.winnerRecommendation && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{top.winnerRecommendation}</p>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Trend" value={formatPercent(top.searchGrowthPercent, { signed: true })} />
                  <Stat
                    label="Margin"
                    value={
                      marginPercent(top.cost, top.sellingPriceEstimate) !== null
                        ? `${marginPercent(top.cost, top.sellingPriceEstimate)!.toFixed(0)}%`
                        : "—"
                    }
                  />
                  <Stat label="Sell price" value={formatCurrency(top.sellingPriceEstimate)} />
                  <Stat
                    label="Competition"
                    value={top.competitionScore === null ? "—" : top.competitionScore < 34 ? "Low" : top.competitionScore < 67 ? "Medium" : "High"}
                  />
                </div>

                <div>
                  <Button asChild>
                    <Link href={`/products/${top.id}`}>
                      View full analysis
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      <ProductSection title="Top 5 Winners" products={data.topWinners} watchedIds={data.watchedIdSet} emptyLabel="No products scored yet." viewAllHref="/winners" />

      <ProductSection
        title="Emerging Opportunities"
        products={data.emerging}
        watchedIds={data.watchedIdSet}
        emptyLabel="No products with rising-fast momentum right now."
        viewAllHref="/radar?trend=RISING_FAST"
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Trend Alerts
        </h2>
        {data.losingMomentum.length === 0 && data.saturated.length === 0 ? (
          <EmptyState message="No momentum or saturation alerts right now." />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.losingMomentum.map((p) => (
              <AlertRow key={p.id} product={p} icon={TrendingDown} tone="destructive" reason="Losing momentum" />
            ))}
            {data.saturated.map((p) => (
              <AlertRow key={p.id} product={p} icon={Flame} tone="warning" reason="Market getting saturated" />
            ))}
          </div>
        )}
      </section>

      <ProductSection
        title="Recently Discovered"
        products={data.recentlyDiscovered}
        watchedIds={data.watchedIdSet}
        emptyLabel="No products discovered yet."
        viewAllHref="/radar?sort=newest"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">My Watchlist</h2>
            <Link href="/watchlist" className="text-xs font-medium text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {data.watchlist.length === 0 ? (
            <EmptyState message="Save products from Product Radar to track them here." />
          ) : (
            <Card>
              <CardContent className="divide-y p-0">
                {data.watchlist.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50"
                  >
                    <span className="truncate font-medium">{p.title}</span>
                    <WinnerScoreBadge score={p.winnerScore} classification={p.winnerClassification} size="sm" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground uppercase">Recent AI Actions</h2>
          {data.recentAnalyses.length === 0 ? (
            <EmptyState message="AI analyses you run will show up here." />
          ) : (
            <Card>
              <CardContent className="divide-y p-0">
                {data.recentAnalyses.map((a) => (
                  <Link
                    key={a.id}
                    href={`/products/${a.productId}`}
                    className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-muted/50"
                  >
                    <Bot className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.productTitle}</div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">{a.launchRecommendation}</div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store Performance</CardTitle>
            <CardDescription>Connect Shopify or Tiendanube to see live store metrics here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/store-builder">Go to Store Builder</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>No campaigns launched yet — build one from a product&apos;s ad strategy.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/ads">Go to Ad Intelligence</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductSection({
  title,
  products,
  watchedIds,
  emptyLabel,
  viewAllHref,
}: {
  title: string;
  products: ProductDTO[];
  watchedIds: Set<string>;
  emptyLabel: string;
  viewAllHref: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">{title}</h2>
        <Link href={viewAllHref} className="text-xs font-medium text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>
      {products.length === 0 ? (
        <EmptyState message={emptyLabel} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} isWatching={watchedIds.has(p.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-sm text-muted-foreground">{message}</CardContent>
    </Card>
  );
}

function AlertRow({
  product,
  icon: Icon,
  tone,
  reason,
}: {
  product: Awaited<ReturnType<typeof getDashboardData>>["losingMomentum"][number];
  icon: typeof TrendingDown;
  tone: "destructive" | "warning";
  reason: string;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 text-sm hover:bg-muted/50"
    >
      <Icon className={tone === "destructive" ? "size-4 shrink-0 text-destructive" : "size-4 shrink-0 text-warning"} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{product.title}</div>
        <div className="text-xs text-muted-foreground">{reason}</div>
      </div>
      <Badge variant={tone === "destructive" ? "destructive" : "warning"}>
        {formatPercent(product.searchGrowthPercent, { signed: true })}
      </Badge>
    </Link>
  );
}
