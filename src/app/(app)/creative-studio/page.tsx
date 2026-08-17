import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { CreativeGenerator } from "@/components/creative/creative-generator";
import { Card, CardContent } from "@/components/ui/card";

const TYPE_LABELS: Record<string, string> = {
  TIKTOK_SCRIPT: "TikTok",
  INSTAGRAM_REEL_SCRIPT: "Reel",
  META_VIDEO_AD: "Meta ad",
  UGC_SCRIPT: "UGC",
  YOUTUBE_SHORTS_SCRIPT: "YouTube Shorts",
};

export default async function CreativeStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  const session = await requireSession();

  const [products, orgProductIds] = await Promise.all([
    db.product.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { winnerScore: "desc" },
      take: 50,
      select: { id: true, title: true },
    }),
    db.product.findMany({
      where: { organizationId: session.organizationId },
      select: { id: true, title: true },
    }),
  ]);

  const productTitleById = new Map(orgProductIds.map((p) => [p.id, p.title]));
  const existingCreatives = await db.creative.findMany({
    where: { productId: { in: orgProductIds.map((p) => p.id) } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Estudio Creativo</h1>
        <p className="text-sm text-muted-foreground">
          Generá guiones de TikTok, Reels y UGC con prompts listos para pegar en Sora, Veo, Runway,
          Kling, Pika o CapCut.
        </p>
      </div>

      <CreativeGenerator products={products} defaultProductId={productId} />

      {existingCreatives.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            Generados anteriormente
          </h2>
          <Card>
            <CardContent className="divide-y p-0">
              {existingCreatives.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {(c.productId && productTitleById.get(c.productId)) ?? "—"}
                      {c.durationSeconds ? ` · ${c.durationSeconds}s` : ""}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{TYPE_LABELS[c.type] ?? c.type}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
