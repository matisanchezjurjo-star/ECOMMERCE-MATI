import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ensureOrganizationForUser } from "@/lib/org";

/**
 * Resolves the current user + their organization for a server
 * component/action, redirecting to /login if unauthenticated. Every
 * data-fetching call in the app should scope its `where` clause by the
 * returned `organizationId` — that's the tenant isolation boundary.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { settings: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (!user.organizationId) {
    const organizationId = await ensureOrganizationForUser(user.id, user.name ?? user.email ?? "My Workspace");
    user = await db.user.findUnique({ where: { id: user.id }, include: { settings: true } });
    if (!organizationId || !user) redirect("/login");
  }

  return {
    userId: user!.id,
    organizationId: user!.organizationId!,
    email: user!.email,
    name: user!.name,
    image: user!.image,
    settings: user!.settings,
  };
}
