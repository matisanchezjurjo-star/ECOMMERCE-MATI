"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getSupplierAdapters } from "@/integrations/registry";

const PLATFORM_KEY_TO_ENUM: Record<string, string> = {
  alibaba: "ALIBABA",
  "made-in-china": "MADE_IN_CHINA",
  "alibaba-1688": "ALIBABA_1688",
  aliexpress: "ALIEXPRESS",
  temu: "OTHER",
};

export async function findSuppliersForProduct(productId: string) {
  const session = await requireSession();

  const product = await db.product.findFirst({ where: { id: productId, organizationId: session.organizationId } });
  if (!product) throw new Error("Product not found");

  const adapters = getSupplierAdapters();
  let linkedCount = 0;

  for (const adapter of adapters) {
    const results = await adapter.getSupplierData(product.title);
    const platform = PLATFORM_KEY_TO_ENUM[adapter.key] ?? "OTHER";

    for (const result of results) {
      let supplier = await db.supplier.findFirst({
        where: { organizationId: session.organizationId, name: result.name, platform: platform as never },
      });

      if (!supplier) {
        supplier = await db.supplier.create({
          data: {
            organizationId: session.organizationId,
            name: result.name,
            platform: platform as never,
            country: result.country,
            rating: result.rating,
            yearsActive: result.yearsActive,
            tradeAssurance: result.tradeAssurance ?? false,
            supportsDropshipping: result.supportsDropshipping ?? false,
            supportsPrivateLabel: result.supportsPrivateLabel ?? false,
            supplierScore: result.rating ? result.rating * 20 : null,
            dataConfidence: adapter.isConfigured() ? "REAL" : "DEMO",
            isDemoData: !adapter.isConfigured(),
          },
        });
      }

      await db.productSupplier.upsert({
        where: { productId_supplierId: { productId: product.id, supplierId: supplier.id } },
        create: {
          productId: product.id,
          supplierId: supplier.id,
          price: result.price,
          moq: result.moq,
          leadTimeDays: result.leadTimeDays,
        },
        update: { price: result.price, moq: result.moq, leadTimeDays: result.leadTimeDays },
      });
      linkedCount++;
    }
  }

  revalidatePath(`/products/${productId}`);
  return { linkedCount };
}
