import { createDemoAdapter } from "../shared/create-demo-adapter";

/** Etsy Open API v3 is official and requires a registered API key. */
export const etsyAdapter = createDemoAdapter({
  key: "etsy",
  name: "Etsy",
  category: "marketplace",
  integrationType: "OFFICIAL_API",
  integrationNotes: "Etsy Open API v3. Official, requires a registered API key (keystring).",
  requiredEnvVars: ["ETSY_API_KEY"],
  urlDomain: "etsy.com",
});
