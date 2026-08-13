"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_CATEGORIES } from "@/integrations/shared/catalog";
import { updateSettings, type SettingsState } from "@/lib/actions/settings";

const COUNTRIES = [
  { value: "AR", label: "Argentina" },
  { value: "US", label: "United States" },
  { value: "ES", label: "Spain" },
  { value: "MX", label: "Mexico" },
  { value: "BR", label: "Brazil" },
  { value: "WORLDWIDE", label: "Worldwide" },
];

const AI_MODELS: Record<string, string[]> = {
  ANTHROPIC: ["claude-sonnet-5", "claude-opus-5", "claude-haiku-4-5-20251001"],
  OPENAI: ["gpt-5.1", "gpt-5.1-mini"],
  GOOGLE: ["gemini-2.5-pro", "gemini-2.5-flash"],
};

const initialState: SettingsState = {};

export interface SettingsFormData {
  targetCountries: string[];
  preferredCategories: string[];
  adBudgetMonthly: number | null;
  desiredSellingPrice: number | null;
  maxSupplierCost: number | null;
  minMarginPercent: number | null;
  businessModel: string;
  riskTolerance: string;
  storePlatform: string;
  aiProvider: string;
  aiModel: string | null;
}

type SettingsLike = SettingsFormData | null;

export function SettingsForm({ settings }: { settings: SettingsLike }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateSettings, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Settings saved");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Target countries</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COUNTRIES.map((c) => (
            <label key={c.value} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Checkbox
                name="targetCountries"
                value={c.value}
                defaultChecked={settings?.targetCountries.includes(c.value) ?? false}
              />
              {c.label}
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Preferred categories</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DEMO_CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Checkbox
                name="preferredCategories"
                value={c}
                defaultChecked={settings?.preferredCategories.includes(c) ?? false}
              />
              {c}
            </label>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="adBudgetMonthly" label="Monthly ad budget (USD)" defaultValue={settings?.adBudgetMonthly?.toString()} />
        <Field id="desiredSellingPrice" label="Desired selling price (USD)" defaultValue={settings?.desiredSellingPrice?.toString()} />
        <Field id="maxSupplierCost" label="Max sourcing cost (USD)" defaultValue={settings?.maxSupplierCost?.toString()} />
        <Field id="minMarginPercent" label="Minimum margin (%)" defaultValue={settings?.minMarginPercent?.toString()} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Business model</Label>
          <Select name="businessModel" defaultValue={settings?.businessModel ?? "DROPSHIPPING"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DROPSHIPPING">Dropshipping</SelectItem>
              <SelectItem value="STOCK">Stock / inventory</SelectItem>
              <SelectItem value="PRIVATE_LABEL">Private label</SelectItem>
              <SelectItem value="HYBRID">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Risk tolerance</Label>
          <Select name="riskTolerance" defaultValue={settings?.riskTolerance ?? "BALANCED"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CONSERVATIVE">Conservative</SelectItem>
              <SelectItem value="BALANCED">Balanced</SelectItem>
              <SelectItem value="AGGRESSIVE">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Store platform</Label>
          <Select name="storePlatform" defaultValue={settings?.storePlatform ?? "UNDECIDED"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SHOPIFY">Shopify</SelectItem>
              <SelectItem value="TIENDANUBE">Tiendanube</SelectItem>
              <SelectItem value="UNDECIDED">Not sure yet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">AI provider</Label>
          <Select name="aiProvider" defaultValue={settings?.aiProvider ?? "ANTHROPIC"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ANTHROPIC">Anthropic (Claude)</SelectItem>
              <SelectItem value="OPENAI">OpenAI (GPT)</SelectItem>
              <SelectItem value="GOOGLE">Google (Gemini)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Model</Label>
          <Select name="aiModel" defaultValue={settings?.aiModel ?? AI_MODELS[settings?.aiProvider ?? "ANTHROPIC"][0]}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.values(AI_MODELS)
                .flat()
                .map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <Button type="submit" disabled={pending} className="self-start">
        {pending && <Loader2 className="animate-spin" />}
        Save settings
      </Button>
    </form>
  );
}

function Field({ id, label, defaultValue }: { id: string; label: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input id={id} name={id} type="number" min={0} step="0.01" defaultValue={defaultValue} />
    </div>
  );
}
