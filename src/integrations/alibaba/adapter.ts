import { createDemoAdapter } from "../shared/create-demo-adapter";

/**
 * Alibaba.com has no general-purpose public product-search API. Its Open
 * Platform program exists for approved business partners only — outside
 * that program, structured access means scraping, which this adapter does
 * NOT do (no bypass of auth/anti-bot). Runs on synthetic data until an
 * approved Partner API integration is wired in.
 */
export const alibabaAdapter = createDemoAdapter({
  key: "alibaba",
  name: "Alibaba.com",
  category: "supplier",
  integrationType: "SCRAPING",
  integrationNotes:
    "No public product-search API for general developers. Alibaba.com Open Platform exists for approved partners only. Marked as scraping-tier; real integration requires partner approval, not implemented here — demo data only.",
  requiredEnvVars: [],
  urlDomain: "alibaba.com",
  supplierPlatformName: "Alibaba.com",
});
