import { createDemoAdapter } from "../shared/create-demo-adapter";

/** Reddit's official API requires a registered "script" app (client id/secret) and OAuth. */
export const redditAdapter = createDemoAdapter({
  key: "reddit",
  name: "Reddit",
  category: "social",
  integrationType: "OFFICIAL_API",
  integrationNotes:
    "Official Reddit API (OAuth2 script app). Used to search relevant subreddits for organic product mentions and sentiment.",
  requiredEnvVars: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
  urlDomain: "reddit.com",
});
