import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCompactNumber } from "@/lib/scoring/format";
import type { ProductDetail } from "@/lib/products/detail-queries";

export function AdPanel({ ads }: { ads: ProductDetail["advertisements"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advertising Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {ads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No ad activity detected for this product yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ads.map((ad) => (
              <div key={ad.id} className="flex flex-col gap-1.5 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize">
                    {ad.platform.toLowerCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{ad.daysActive}d active</span>
                </div>
                <div className="truncate text-xs font-medium">{ad.advertiser}</div>
                {ad.copy && <p className="line-clamp-2 text-xs text-muted-foreground">{ad.copy}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {ad.views !== null && <span>{formatCompactNumber(ad.views)} views</span>}
                  {ad.likes !== null && <span>{formatCompactNumber(ad.likes)} likes</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
