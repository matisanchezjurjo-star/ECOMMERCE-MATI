import { createDemoAdapter } from "../shared/create-demo-adapter";

/**
 * Google doesn't offer a public "search Google Shopping results" API for
 * arbitrary queries. Wired for a licensed partner provider (e.g. SerpApi
 * Google Shopping API) rather than scraping search result pages.
 */
export const googleShoppingAdapter = createDemoAdapter({
  key: "google-shopping",
  name: "Google Shopping",
  category: "search",
  integrationType: "PARTNER_API",
  integrationNotes:
    "No public Google Shopping search API for arbitrary queries. Wired for a licensed partner provider (e.g. SerpApi Google Shopping API). Demo data until a provider key is set.",
  requiredEnvVars: ["SERPAPI_API_KEY"],
  urlDomain: "shopping.google.com",
});
