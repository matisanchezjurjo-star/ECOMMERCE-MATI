import { createDemoAdapter } from "../shared/create-demo-adapter";

/** TikTok Creative Center's Top Ads/trending pages are public but have no official data API. */
export const tiktokCreativeCenterAdapter = createDemoAdapter({
  key: "tiktok-creative-center",
  name: "TikTok Creative Center",
  category: "ads",
  integrationType: "BROWSER_AUTOMATION",
  integrationNotes:
    "The Creative Center's Top Ads / trending pages are publicly viewable but expose no official data API. Structured access would require sanctioned browser automation — not implemented here. Demo data only.",
  requiredEnvVars: [],
  urlDomain: "ads.tiktok.com",
});
