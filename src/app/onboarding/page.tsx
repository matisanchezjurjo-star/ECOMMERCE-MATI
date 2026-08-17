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
        <h1 className="text-2xl font-semibold tracking-tight">Personalicemos Cumbre</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unas pocas preguntas rápidas para no volver a pedírtelas — el Agente IA recuerda estas preferencias en toda la app.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
