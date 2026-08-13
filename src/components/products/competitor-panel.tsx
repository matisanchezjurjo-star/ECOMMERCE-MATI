import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/scoring/format";
import type { ProductDetail } from "@/lib/products/detail-queries";

export function CompetitorPanel({ competitors }: { competitors: ProductDetail["competitors"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competition</CardTitle>
      </CardHeader>
      <CardContent>
        {competitors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No competitor data yet for this product.</p>
        ) : (
          <div className="flex flex-col divide-y">
            {competitors.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      {c.isDemoData && (
                        <Badge variant="outline" className="text-[10px]">
                          Demo
                        </Badge>
                      )}
                    </div>
                    {c.website && <div className="text-xs text-muted-foreground">{c.website}</div>}
                  </div>
                  <div className="text-right text-sm font-medium tabular-nums">{formatCurrency(c.price)}</div>
                </div>
                {c.offer && <p className="text-xs text-muted-foreground">Offer: {c.offer}</p>}
                {c.marketingAngle && <p className="text-xs text-muted-foreground">Angle: {c.marketingAngle}</p>}
                {c.opportunityScore !== null && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Opportunity score: </span>
                    <span className="font-medium">{c.opportunityScore.toFixed(0)}/100</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
