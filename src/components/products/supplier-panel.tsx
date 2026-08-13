import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FindSuppliersButton } from "./find-suppliers-button";
import { formatCurrency } from "@/lib/scoring/format";
import type { ProductDetail } from "@/lib/products/detail-queries";

const BADGE_LABEL: Record<string, string> = {
  BEST_PRICE: "Best price",
  BEST_QUALITY: "Best quality",
  BEST_FOR_TESTING: "Best for testing",
  BEST_FOR_SCALING: "Best for scaling",
};

export function SupplierPanel({ productId, suppliers }: { productId: string; suppliers: ProductDetail["productSuppliers"] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Supplier Options</CardTitle>
        <FindSuppliersButton productId={productId} />
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No suppliers linked yet. Click &quot;Find Suppliers&quot; to search connected supplier sources.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>MOQ</TableHead>
                <TableHead>Lead time</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((ps) => (
                <TableRow key={ps.id}>
                  <TableCell>
                    <div className="font-medium">{ps.supplier.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {ps.supplier.platform.replace(/_/g, " ")} · {ps.supplier.country ?? "—"}
                      {ps.supplier.isDemoData && " · Demo"}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(ps.price)}</TableCell>
                  <TableCell>{ps.moq ?? "—"}</TableCell>
                  <TableCell>{ps.leadTimeDays ? `${ps.leadTimeDays}d` : "—"}</TableCell>
                  <TableCell>{ps.supplier.rating ? `${ps.supplier.rating.toFixed(1)}/5` : "—"}</TableCell>
                  <TableCell>
                    {ps.badge && <Badge variant="secondary">{BADGE_LABEL[ps.badge] ?? ps.badge}</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
