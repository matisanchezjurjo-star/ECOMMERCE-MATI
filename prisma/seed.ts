/**
 * CLI demo seed (spec section 53). Creates a fixed demo org/login, then
 * delegates the actual data generation to `populateDemoDataForOrg` — the
 * same function the in-app "Load Demo Data" action uses, so any
 * organization can get realistic-shaped synthetic data, not just this one.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";

import { db } from "../src/lib/db";
import { populateDemoDataForOrg } from "../src/lib/discovery/populate-demo-data";

const DEMO_EMAIL = "demo@ecomhunter.ai";
const DEMO_PASSWORD = "demo12345";

async function main() {
  console.log("Seeding Cumbre demo data...\n");

  const organization = await db.organization.upsert({
    where: { slug: "demo-workspace" },
    create: { name: "Demo Workspace", slug: "demo-workspace", plan: "pro" },
    update: {},
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      email: DEMO_EMAIL,
      name: "Demo Founder",
      passwordHash,
      organizationId: organization.id,
    },
    update: { organizationId: organization.id, passwordHash },
  });

  await db.userSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      organizationId: organization.id,
      targetCountries: ["US", "AR", "MX"],
      preferredCategories: ["Home & Kitchen", "Tech Accessories", "Pet Supplies"],
      maxSupplierCost: 15,
      minMarginPercent: 55,
      preferredPlatforms: ["META", "TIKTOK"],
      riskTolerance: "BALANCED",
      businessModel: "DROPSHIPPING",
      adBudgetMonthly: 1500,
      desiredSellingPrice: 35,
      storePlatform: "SHOPIFY",
      aiProvider: "ANTHROPIC",
      onboardingCompletedAt: new Date(),
    },
    update: {},
  });

  console.log(`Demo login -> email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}\n`);

  const result = await populateDemoDataForOrg(organization.id, user.id);

  for (const [key, summary] of Object.entries(result.bySource)) {
    console.log(`  [${key}] created=${summary.created} updated=${summary.updated}${summary.error ? ` error=${summary.error}` : ""}`);
  }

  console.log(`\nTotal products: ${result.productCount}`);
  console.log(`Created ${result.supplierCount} suppliers, competitors for ${result.competitorTargets} products, ads for ${result.adTargets} products.`);
  console.log(`Added ${result.watchlistCount} products to watchlist + default alert rules.\n`);

  console.log("Seed complete.");
  console.log(`  Organization: ${organization.name} (${organization.id})`);
  console.log(`  Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
