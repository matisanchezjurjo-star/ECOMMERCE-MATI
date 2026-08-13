import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { BrandGenerator } from "@/components/brand/brand-generator";
import { Card, CardContent } from "@/components/ui/card";

export default async function BrandBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  const session = await requireSession();

  const [products, existingBrands] = await Promise.all([
    db.product.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { winnerScore: "desc" },
      take: 50,
      select: { id: true, title: true },
    }),
    db.brand.findMany({
      where: { organizationId: session.organizationId },
      include: { product: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Brand Builder</h1>
        <p className="text-sm text-muted-foreground">
          Generate a name, positioning, story, and visual identity for any discovered product.
        </p>
      </div>

      <BrandGenerator products={products} defaultProductId={productId} />

      {existingBrands.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            Previously generated
          </h2>
          <Card>
            <CardContent className="divide-y p-0">
              {existingBrands.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">for {b.product?.title ?? "—"}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{b.tagline}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
