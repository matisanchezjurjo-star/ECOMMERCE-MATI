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
  { value: "US", label: "Estados Unidos" },
  { value: "ES", label: "España" },
  { value: "MX", label: "México" },
  { value: "BR", label: "Brasil" },
  { value: "WORLDWIDE", label: "Todo el mundo" },
];

const BUSINESS_MODELS = [
  { value: "DROPSHIPPING", label: "Dropshipping" },
  { value: "STOCK", label: "Stock propio" },
  { value: "PRIVATE_LABEL", label: "Marca propia" },
  { value: "HYBRID", label: "Híbrido" },
];

const STORE_PLATFORMS = [
  { value: "SHOPIFY", label: "Shopify" },
  { value: "TIENDANUBE", label: "Tiendanube" },
  { value: "UNDECIDED", label: "Todavía no sé" },
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
          <h3 className="text-sm font-semibold">¿En qué países querés vender?</h3>
          <p className="text-xs text-muted-foreground">Se usa para personalizar el descubrimiento, proveedores y recomendaciones de tienda.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COUNTRIES.map((c) => (
            <label key={c.value} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Checkbox name="targetCountries" value={c.value} defaultChecked={c.value === "AR"} />
              {c.label}
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold">Categorías preferidas</h3>
          <p className="text-xs text-muted-foreground">Vamos a priorizar el descubrimiento en estas categorías.</p>
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
          <Label htmlFor="adBudgetMonthly">Presupuesto de ads mensual (USD)</Label>
          <Input id="adBudgetMonthly" name="adBudgetMonthly" type="number" min={0} step="1" placeholder="1000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="desiredSellingPrice">Precio de venta deseado (USD)</Label>
          <Input id="desiredSellingPrice" name="desiredSellingPrice" type="number" min={0} step="0.01" placeholder="35" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxSupplierCost">Costo máximo de abastecimiento (USD)</Label>
          <Input id="maxSupplierCost" name="maxSupplierCost" type="number" min={0} step="0.01" placeholder="12" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Modelo de negocio</h3>
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
        <h3 className="text-sm font-semibold">Plataforma de tienda</h3>
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
        Empezar a descubrir productos
      </Button>
    </form>
  );
}
