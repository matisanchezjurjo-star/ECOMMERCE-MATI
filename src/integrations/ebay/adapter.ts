import { createDemoAdapter } from "../shared/create-demo-adapter";

/** eBay Browse API is official, OAuth-based (client credentials grant). */
export const ebayAdapter = createDemoAdapter({
  key: "ebay",
  name: "eBay",
  category: "marketplace",
  integrationType: "OFFICIAL_API",
  integrationNotes: "eBay Browse API. Official, OAuth client-credentials flow, requires a registered developer app.",
  requiredEnvVars: ["EBAY_CLIENT_ID", "EBAY_CLIENT_SECRET"],
  urlDomain: "ebay.com",
});
