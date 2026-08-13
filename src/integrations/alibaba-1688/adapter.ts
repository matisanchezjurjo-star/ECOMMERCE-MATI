import { createDemoAdapter } from "../shared/create-demo-adapter";

/** 1688.com (Alibaba's domestic Chinese marketplace) has no accessible public API for foreign developers. */
export const alibaba1688Adapter = createDemoAdapter({
  key: "alibaba-1688",
  name: "1688.com",
  category: "supplier",
  integrationType: "MANUAL_IMPORT",
  integrationNotes:
    "1688's open platform is restricted to Chinese-registered businesses. No accessible official API for this platform. Supported via manual import only. Demo data only for now.",
  requiredEnvVars: [],
  urlDomain: "1688.com",
  supplierPlatformName: "1688.com",
});
