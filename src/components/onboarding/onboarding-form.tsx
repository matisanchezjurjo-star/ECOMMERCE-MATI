"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DEMO_CATEGORIES } from "@/integrations/shared/catalog";
import { completeOnboarding, type OnboardingState } from "@/lib/actions/onboarding";

const COUNTRIES = [
  { value: "AR", label: "Argentina" },
  { value: "US", label: "United States" },
  { value: "ES", label: "Spain" },
  { value: "MX", label: "Mexico" },
  { value: "BR", label: "Brazil" },
  { value: "WORLDWIDE", label: "Worldwide" },
];

const BUSINESS_MODELS = [
  { value: "DROPSHIPPING", label: "Dropshipping" },
  { value: "STOCK", label: "Stock / inventory" },
  { value: "PRIVATE_LABEL", label: "Private label" },
  { value: "HYBRID", label: "Hybrid" },
];

const STORE_PLATFORMS = [
  { value: "SHOPIFY", label: "Shopify" },
  { value: "TIENDANUBE", label: "Tiendanube" },
  { value: "UNDECIDED", label: "Not sure yet" },
];

const initialState: OnboardingState = {};

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(completeOnboarding, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold">What countries do you want to sell in?</h3>
          <p className="text-xs text-muted-foreground">Used to personalize discovery, suppliers, and store recommendations.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COUNTRIES.map((c) => (
            <label key={c.value} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Checkbox name="targetCountries" value={c.value} defaultChecked={c.value === "US"} />
              {c.label}
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold">Preferred categories</h3>
          <p className="text-xs text-muted-foreground">We&apos;ll prioritize discovery in these categories.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DEMO_CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Checkbox name="preferredCategories" value={c} defaultChecked={c === "Home & Kitchen" || c === "Tech Accessories"} />
              {c}
            </label>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="adBudgetMonthly">Monthly ad budget (USD)</Label>
          <Input id="adBudgetMonthly" name="adBudgetMonthly" type="number" min={0} step="1" placeholder="1000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="desiredSellingPrice">Desired selling price (USD)</Label>
          <Input id="desiredSellingPrice" name="desiredSellingPrice" type="number" min={0} step="0.01" placeholder="35" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxSupplierCost">Max sourcing cost (USD)</Label>
          <Input id="maxSupplierCost" name="maxSupplierCost" type="number" min={0} step="0.01" placeholder="12" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Business model</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BUSINESS_MODELS.map((b, i) => (
            <label key={b.value} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input type="radio" name="businessModel" value={b.value} defaultChecked={i === 0} className="size-3.5" />
              {b.label}
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Store platform</h3>
        <div className="grid grid-cols-3 gap-2">
          {STORE_PLATFORMS.map((s, i) => (
            <label key={s.value} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input type="radio" name="storePlatform" value={s.value} defaultChecked={i === 2} className="size-3.5" />
              {s.label}
            </label>
          ))}
        </div>
      </section>

      <Button type="submit" disabled={pending} size="lg" className="self-start">
        {pending && <Loader2 className="animate-spin" />}
        Start discovering products
      </Button>
    </form>
  );
}
