import { db } from "@/lib/db";

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "workspace"}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Every user belongs to exactly one organization for data isolation
 * (spec section 4/36). Called on first sign-up, whichever auth path.
 */
export async function ensureOrganizationForUser(userId: string, displayName: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  if (user.organizationId) return user.organizationId;

  const organization = await db.organization.create({
    data: {
      name: `${displayName}'s Workspace`,
      slug: slugify(displayName),
    },
  });

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { organizationId: organization.id } }),
    db.userSettings.create({
      data: {
        userId,
        organizationId: organization.id,
      },
    }),
  ]);

  return organization.id;
}
