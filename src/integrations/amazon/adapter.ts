import { createDemoAdapter } from "../shared/create-demo-adapter";

/**
 * Amazon Product Advertising API (PA-API 5.0) — official, requires an
 * approved Associates account plus access/secret keys and a partner tag.
 * Runs on synthetic data until those credentials are supplied.
 */
export const amazonAdapter = createDemoAdapter({
  key: "amazon",
  name: "Amazon",
  category: "marketplace",
  integrationType: "OFFICIAL_API",
  integrationNotes:
    "Amazon Product Advertising API (PA-API 5.0). Requires an approved Associates account. Search/trending data is real once credentials are set; falls back to demo data otherwise.",
  requiredEnvVars: ["AMAZON_PAAPI_ACCESS_KEY", "AMAZON_PAAPI_SECRET_KEY", "AMAZON_PAAPI_PARTNER_TAG"],
  urlDomain: "amazon.com",
});
