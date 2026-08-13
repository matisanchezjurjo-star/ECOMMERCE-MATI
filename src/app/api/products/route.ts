import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";
import { isApiSessionError, requireApiSession } from "@/lib/api-session";
import { buildProductOrderBy, buildProductWhere, parseProductFilters } from "@/lib/products/filters";
import { toProductDTO } from "@/lib/products/dto";

export async function GET(request: NextRequest) {
  const session = await requireApiSession();
  if (isApiSessionError(session)) return session;

  let filters;
  try {
    filters = parseProductFilters(request.nextUrl.searchParams);
  } catch {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  const where = buildProductWhere(session.organizationId, filters);

  if (filters.watchlistOnly) {
    where.watchlistItems = { some: { userId: session.userId } };
  }

  const [items, total, watchedRows] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: buildProductOrderBy(filters.sort),
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    db.product.count({ where }),
    db.watchlistItem.findMany({ where: { userId: session.userId }, select: { productId: true } }),
  ]);

  const watchedIds = new Set(watchedRows.map((w) => w.productId));

  return NextResponse.json({
    items: items.map((p) => ({ ...toProductDTO(p), isWatching: watchedIds.has(p.id) })),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  });
}
