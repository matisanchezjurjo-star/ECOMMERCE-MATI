"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function toggleWatchlist(productId: string): Promise<{ watching: boolean }> {
  const session = await requireSession();

  const existing = await db.watchlistItem.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  });

  if (existing) {
    await db.watchlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/");
    revalidatePath("/watchlist");
    revalidatePath("/radar");
    return { watching: false };
  }

  const product = await db.product.findFirst({ where: { id: productId, organizationId: session.organizationId } });
  if (!product) throw new Error("Product not found");

  await db.watchlistItem.create({
    data: { organizationId: session.organizationId, userId: session.userId, productId },
  });
  revalidatePath("/");
  revalidatePath("/watchlist");
  revalidatePath("/radar");
  return { watching: true };
}
