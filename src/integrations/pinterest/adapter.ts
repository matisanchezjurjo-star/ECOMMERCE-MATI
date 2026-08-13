import { createDemoAdapter } from "../shared/create-demo-adapter";

/** Pinterest API v5 is official but trend/discovery scope is limited outside the connected account's own data. */
export const pinterestAdapter = createDemoAdapter({
  key: "pinterest",
  name: "Pinterest",
  category: "social",
  integrationType: "OFFICIAL_API",
  integrationNotes:
    "Pinterest API v5. Official, requires an access token from a registered Pinterest app. Trend-scope is limited outside the connected account's own boards/pins.",
  requiredEnvVars: ["PINTEREST_ACCESS_TOKEN"],
  urlDomain: "pinterest.com",
});
