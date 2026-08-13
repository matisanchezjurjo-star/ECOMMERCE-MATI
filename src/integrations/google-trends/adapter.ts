import { createDemoAdapter } from "../shared/create-demo-adapter";

/**
 * Google has no official Trends API. Reliable structured access means going
 * through a licensed data provider (e.g. SerpApi's Google Trends API) —
 * this adapter is wired for that partner path rather than scraping the
 * undocumented public widget.
 */
export const googleTrendsAdapter = createDemoAdapter({
  key: "google-trends",
  name: "Google Trends",
  category: "search",
  integrationType: "PARTNER_API",
  integrationNotes:
    "No official Google Trends API exists. Wired for a licensed partner data provider (e.g. SerpApi Google Trends API) rather than scraping the undocumented public widget. Demo data until a provider key is set.",
  requiredEnvVars: ["SERPAPI_API_KEY"],
  urlDomain: "trends.google.com",
});
