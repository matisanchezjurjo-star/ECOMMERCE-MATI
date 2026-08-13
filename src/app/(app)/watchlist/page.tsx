import Link from "next/link";
import { Radar } from "lucide-react";

import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { toProductDTO } from "@/lib/products/dto";
import { ProductCard } from "@/components/products/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function WatchlistPage() {
  const session = await requireSession();

  const items = await db.watchlistItem.findMany({
    where: { organizationId: session.organizationId, userId: session.userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Watchlist</h1>
        <p className="text-sm text-muted-foreground">
          Products you&apos;re tracking — winner score, price, and trend changes will surface here as alerts.
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Radar className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You haven&apos;t saved any products yet. Browse Product Radar and click the bookmark icon to track one here.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/radar">Go to Product Radar</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <ProductCard key={item.id} product={toProductDTO(item.product)} isWatching />
          ))}
        </div>
      )}
    </div>
  );
}
