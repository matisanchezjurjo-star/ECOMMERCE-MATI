"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

const OnboardingSchema = z.object({
  targetCountries: z.array(z.string()).min(1, "Select at least one country"),
  preferredCategories: z.array(z.string()).min(1, "Select at least one category"),
  adBudgetMonthly: z.coerce.number().min(0).optional(),
  desiredSellingPrice: z.coerce.number().min(0).optional(),
  maxSupplierCost: z.coerce.number().min(0).optional(),
  businessModel: z.enum(["DROPSHIPPING", "STOCK", "PRIVATE_LABEL", "HYBRID"]),
  storePlatform: z.enum(["SHOPIFY", "TIENDANUBE", "UNDECIDED"]),
});

export interface OnboardingState {
  error?: string;
}

export async function completeOnboarding(_prevState: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const session = await requireSession();

  const parsed = OnboardingSchema.safeParse({
    targetCountries: formData.getAll("targetCountries"),
    preferredCategories: formData.getAll("preferredCategories"),
    adBudgetMonthly: formData.get("adBudgetMonthly") || undefined,
    desiredSellingPrice: formData.get("desiredSellingPrice") || undefined,
    maxSupplierCost: formData.get("maxSupplierCost") || undefined,
    businessModel: formData.get("businessModel"),
    storePlatform: formData.get("storePlatform"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete all required fields" };
  }

  await db.userSettings.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      organizationId: session.organizationId,
      ...parsed.data,
      onboardingCompletedAt: new Date(),
    },
    update: {
      ...parsed.data,
      onboardingCompletedAt: new Date(),
    },
  });

  redirect("/");
}
