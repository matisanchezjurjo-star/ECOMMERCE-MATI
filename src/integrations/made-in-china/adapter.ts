import { createDemoAdapter } from "../shared/create-demo-adapter";

/** Made-in-China.com has no public API. Supplier data is demo-only until a manual import or licensed data feed is connected. */
export const madeInChinaAdapter = createDemoAdapter({
  key: "made-in-china",
  name: "Made-in-China.com",
  category: "supplier",
  integrationType: "MANUAL_IMPORT",
  integrationNotes:
    "No public API exists. Supported via manual CSV import of supplier listings, or a licensed third-party data feed if one becomes available. Demo data only for now.",
  requiredEnvVars: [],
  urlDomain: "made-in-china.com",
  supplierPlatformName: "Made-in-China.com",
});
