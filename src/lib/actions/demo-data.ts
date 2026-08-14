"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/session";
import { populateDemoDataForOrg } from "@/lib/discovery/populate-demo-data";

export async function loadDemoData() {
  const session = await requireSession();
  const result = await populateDemoDataForOrg(session.organizationId, session.userId);

  revalidatePath("/");
  revalidatePath("/radar");
  revalidatePath("/winners");
  revalidatePath("/watchlist");

  return result;
}
