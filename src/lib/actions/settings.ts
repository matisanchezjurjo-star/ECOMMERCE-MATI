"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

const SettingsSchema = z.object({
  targetCountries: z.array(z.string()).default([]),
  preferredCategories: z.array(z.string()).default([]),
  adBudgetMonthly: z.coerce.number().min(0).optional(),
  desiredSellingPrice: z.coerce.number().min(0).optional(),
  maxSupplierCost: z.coerce.number().min(0).optional(),
  minMarginPercent: z.coerce.number().min(0).max(100).optional(),
  businessModel: z.enum(["DROPSHIPPING", "STOCK", "PRIVATE_LABEL", "HYBRID"]),
  riskTolerance: z.enum(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]),
  storePlatform: z.enum(["SHOPIFY", "TIENDANUBE", "UNDECIDED"]),
  aiProvider: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE"]),
  aiModel: z.string().optional(),
});

export interface SettingsState {
  error?: string;
  success?: boolean;
}

export async function updateSettings(_prevState: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await requireSession();

  const parsed = SettingsSchema.safeParse({
    targetCountries: formData.getAll("targetCountries"),
    preferredCategories: formData.getAll("preferredCategories"),
    adBudgetMonthly: formData.get("adBudgetMonthly") || undefined,
    desiredSellingPrice: formData.get("desiredSellingPrice") || undefined,
    maxSupplierCost: formData.get("maxSupplierCost") || undefined,
    minMarginPercent: formData.get("minMarginPercent") || undefined,
    businessModel: formData.get("businessModel"),
    riskTolerance: formData.get("riskTolerance"),
    storePlatform: formData.get("storePlatform"),
    aiProvider: formData.get("aiProvider"),
    aiModel: formData.get("aiModel") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  await db.userSettings.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, organizationId: session.organizationId, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/settings");
  return { success: true };
}
