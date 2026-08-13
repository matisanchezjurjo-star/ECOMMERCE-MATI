import { createDemoAdapter } from "../shared/create-demo-adapter";

/** Meta Ad Library API is official and public for political/social ads; commercial ad search needs an access token. */
export const metaAdsLibraryAdapter = createDemoAdapter({
  key: "meta-ads-library",
  name: "Meta Ads Library",
  category: "ads",
  integrationType: "OFFICIAL_API",
  integrationNotes:
    "Official Meta Ad Library API. Requires a Meta developer app and access token. Provides real advertiser/creative data once configured.",
  requiredEnvVars: ["META_AD_LIBRARY_ACCESS_TOKEN"],
  urlDomain: "facebook.com/ads/library",
});
