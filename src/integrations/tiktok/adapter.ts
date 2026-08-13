import { createDemoAdapter } from "../shared/create-demo-adapter";

/**
 * TikTok has no general product-discovery API. TikTok Shop's Partner API
 * covers sellers who onboard to TikTok Shop specifically, not open product
 * research. General trend discovery would require sanctioned browser
 * automation against public pages, not implemented here.
 */
export const tiktokAdapter = createDemoAdapter({
  key: "tiktok",
  name: "TikTok",
  category: "social",
  integrationType: "BROWSER_AUTOMATION",
  integrationNotes:
    "No public product/trend-discovery API. TikTok Shop Partner API only covers onboarded sellers. Structured research access would require sanctioned browser automation against public pages — not implemented here. Demo data only.",
  requiredEnvVars: [],
  urlDomain: "tiktok.com",
});
