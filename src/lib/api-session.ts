import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/** Auth check for route handlers — returns a 401 JSON response instead of redirecting. */
export async function requireApiSession(): Promise<
  { organizationId: string; userId: string } | NextResponse
> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { organizationId: true } });
  if (!user?.organizationId) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  return { organizationId: user.organizationId, userId: session.user.id };
}

export function isApiSessionError(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
