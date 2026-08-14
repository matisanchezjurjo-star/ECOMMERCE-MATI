import { CheckCircle2, XCircle } from "lucide-react";

import { requireSession } from "@/lib/session";
import { getConfiguredProviders } from "@/lib/ai/factory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";
import { DemoDataButton } from "@/components/settings/demo-data-button";

const PROVIDER_LABEL = { ANTHROPIC: "Anthropic (Claude)", OPENAI: "OpenAI (GPT)", GOOGLE: "Google (Gemini)" } as const;

export default async function SettingsPage() {
  const session = await requireSession();
  const configured = getConfiguredProviders();
  const settings = session.settings
    ? {
        targetCountries: session.settings.targetCountries,
        preferredCategories: session.settings.preferredCategories,
        adBudgetMonthly: session.settings.adBudgetMonthly?.toNumber() ?? null,
        desiredSellingPrice: session.settings.desiredSellingPrice?.toNumber() ?? null,
        maxSupplierCost: session.settings.maxSupplierCost?.toNumber() ?? null,
        minMarginPercent: session.settings.minMarginPercent?.toNumber() ?? null,
        businessModel: session.settings.businessModel,
        riskTolerance: session.settings.riskTolerance,
        storePlatform: session.settings.storePlatform,
        aiProvider: session.settings.aiProvider,
        aiModel: session.settings.aiModel,
      }
    : null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Preferences here power the AI Agent and personalize discovery — you won&apos;t be asked for them again.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Providers</CardTitle>
          <CardDescription>
            Configured via environment variables. Any provider without a key runs in demo mode with clearly labeled
            synthetic output instead of failing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(Object.keys(PROVIDER_LABEL) as (keyof typeof PROVIDER_LABEL)[]).map((key) => (
            <div key={key} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>{PROVIDER_LABEL[key]}</span>
              {configured[key] ? (
                <span className="flex items-center gap-1.5 text-success">
                  <CheckCircle2 className="size-4" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <XCircle className="size-4" /> Demo mode
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo Data</CardTitle>
          <CardDescription>
            Populate your workspace with 100+ synthetic products across every connected source — full history,
            suppliers, competitors, and ads — so there&apos;s something to explore immediately. Everything it creates is
            clearly labeled as demo data and never presented as live market data. Safe to run more than once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DemoDataButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Used across Product Radar, the AI Agent, and Store Builder recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
