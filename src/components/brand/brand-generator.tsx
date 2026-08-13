"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Palette } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateBrandForProduct } from "@/lib/actions/brand";
import type { BrandKitOutput } from "@/lib/ai/schemas";

export function BrandGenerator({
  products,
  defaultProductId,
}: {
  products: { id: string; title: string }[];
  defaultProductId?: string;
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(defaultProductId ?? products[0]?.id ?? "");
  const [result, setResult] = useState<{ data: BrandKitOutput; usedDemoProvider: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    if (!productId) return;
    startTransition(async () => {
      try {
        const res = await generateBrandForProduct(productId);
        setResult({ data: res.data, usedDemoProvider: res.usedDemoProvider });
        toast.success("Brand generated");
        router.refresh();
      } catch {
        toast.error("Couldn't generate a brand. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate a brand</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Choose a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={!productId || isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Palette />}
            Generate Brand
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{result.data.chosenName}</CardTitle>
            <Badge variant={result.usedDemoProvider ? "outline" : "info"}>
              {result.usedDemoProvider ? "Demo brand" : "AI-generated"}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="text-sm italic text-muted-foreground">&quot;{result.data.tagline}&quot;</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Positioning" value={result.data.positioning} />
              <Field label="USP" value={result.data.usp} />
            </div>
            <Field label="Brand story" value={result.data.story} />
            <Field label="Tone of voice" value={result.data.toneOfVoice} />

            <div className="flex flex-wrap gap-2">
              {Object.entries(result.data.colorPalette).map(([key, hex]) => (
                <div key={key} className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                  <span className="size-4 rounded-full border" style={{ backgroundColor: hex }} />
                  <span className="text-muted-foreground capitalize">{key}</span>
                  <span className="font-mono">{hex}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ListField label="Other name ideas" items={result.data.names} />
              <ListField label="Domain suggestions" items={result.data.domainSuggestions} />
              <ListField label="Logo concepts" items={result.data.logoConcepts} />
              <ListField label="Social handles" items={result.data.socialHandles} />
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-md bg-muted/40 p-3 text-center text-xs sm:grid-cols-4">
              <ScoreStat label="Memorability" value={result.data.memorabilityScore} />
              <ScoreStat label="Premium perception" value={result.data.premiumPerceptionScore} />
              <ScoreStat label="Trademark risk" value={result.data.trademarkRiskScore} />
              <ScoreStat label="Domain potential" value={result.data.domainPotentialScore} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
      <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ScoreStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-semibold">{value.toFixed(0)}/100</div>
    </div>
  );
}
