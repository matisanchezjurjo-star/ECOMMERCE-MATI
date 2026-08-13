import { createDemoAdapter } from "../shared/create-demo-adapter";

/**
 * Instagram Graph API is official but scoped to content owned/managed by
 * the connected business account — it cannot discover arbitrary third-party
 * posts. Useful once the org connects their own Instagram Business account.
 */
export const instagramAdapter = createDemoAdapter({
  key: "instagram",
  name: "Instagram",
  category: "social",
  integrationType: "OFFICIAL_API",
  integrationNotes:
    "Instagram Graph API (via Meta). Official, but scoped to the connected business account's own content — not general competitor/trend discovery. Requires a Meta app + access token.",
  requiredEnvVars: ["META_APP_ID", "META_APP_SECRET", "META_ACCESS_TOKEN"],
  urlDomain: "instagram.com",
});
