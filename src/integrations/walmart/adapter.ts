import { createDemoAdapter } from "../shared/create-demo-adapter";

/** Walmart's official Open/Affiliate API requires a registered API key. */
export const walmartAdapter = createDemoAdapter({
  key: "walmart",
  name: "Walmart",
  category: "marketplace",
  integrationType: "OFFICIAL_API",
  integrationNotes: "Walmart Open API / Affiliate API. Official, requires a registered API key.",
  requiredEnvVars: ["WALMART_API_KEY"],
  urlDomain: "walmart.com",
});
