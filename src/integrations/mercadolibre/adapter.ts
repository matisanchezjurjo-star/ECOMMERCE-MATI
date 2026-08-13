import { createDemoAdapter } from "../shared/create-demo-adapter";

/**
 * Mercado Libre has a public, official REST API (api.mercadolibre.com).
 * Basic item search works unauthenticated; registering an app (client
 * id/secret) unlocks higher rate limits and order/seller data.
 */
export const mercadoLibreAdapter = createDemoAdapter({
  key: "mercadolibre",
  name: "Mercado Libre",
  category: "marketplace",
  integrationType: "OFFICIAL_API",
  integrationNotes:
    "Official public Mercado Libre API. Item search works without auth; set client credentials for higher rate limits and richer seller/order data.",
  requiredEnvVars: ["MERCADOLIBRE_CLIENT_ID", "MERCADOLIBRE_CLIENT_SECRET"],
  urlDomain: "mercadolibre.com",
});
