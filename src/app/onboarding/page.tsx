import { redirect } from "next/navigation";

import { requireSession } from "@/lib/session";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const session = await requireSession();
  if (session.settings?.onboardingCompletedAt) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-8 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Let&apos;s personalize EcomHunter AI</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A few quick questions so we never ask twice — the AI Agent remembers these preferences everywhere in the app.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
