import { createDemoAdapter } from "../shared/create-demo-adapter";

/** Temu has no public product-search or affiliate data API available to third-party developers. */
export const temuAdapter = createDemoAdapter({
  key: "temu",
  name: "Temu",
  category: "marketplace",
  integrationType: "SCRAPING",
  integrationNotes:
    "No public API. Any structured access would require scraping, which is not implemented here (no auth/anti-bot bypass). Demo data only until an approved data provider exists.",
  requiredEnvVars: [],
  urlDomain: "temu.com",
});
