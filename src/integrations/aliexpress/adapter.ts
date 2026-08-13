import { createDemoAdapter } from "../shared/create-demo-adapter";

/** AliExpress Affiliate API (Ali Affiliate Portal) is an official partner program — requires app key/secret. */
export const aliexpressAdapter = createDemoAdapter({
  key: "aliexpress",
  name: "AliExpress",
  category: "supplier",
  integrationType: "PARTNER_API",
  integrationNotes:
    "AliExpress Affiliate API via the Ali Affiliate Portal. Official partner program, requires app key/secret and affiliate account approval. Demo data until credentials are supplied.",
  requiredEnvVars: ["ALIEXPRESS_APP_KEY", "ALIEXPRESS_APP_SECRET"],
  urlDomain: "aliexpress.com",
  supplierPlatformName: "AliExpress",
});
