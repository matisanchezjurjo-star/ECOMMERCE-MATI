"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Loader2 } from "lucide-react";
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
import { generateCreativeForProduct } from "@/lib/actions/creative";
import type { CreativeInput } from "@/lib/ai/schemas";
import type { CreativeScriptOutput } from "@/lib/ai/schemas";

const FORMATS: { value: CreativeInput["type"]; label: string }[] = [
  { value: "TIKTOK_SCRIPT", label: "Guion para TikTok" },
  { value: "INSTAGRAM_REEL_SCRIPT", label: "Reel de Instagram" },
  { value: "META_VIDEO_AD", label: "Video ad de Meta" },
  { value: "UGC_SCRIPT", label: "Guion UGC" },
  { value: "YOUTUBE_SHORTS_SCRIPT", label: "YouTube Shorts" },
];

const DURATIONS: CreativeInput["durationSeconds"][] = [15, 30, 45, 60];

const ENGINES: { value: NonNullable<CreativeInput["engine"]>; label: string }[] = [
  { value: "CAPCUT", label: "CapCut" },
  { value: "SORA", label: "Sora" },
  { value: "VEO", label: "Veo" },
  { value: "RUNWAY", label: "Runway" },
  { value: "KLING", label: "Kling" },
  { value: "PIKA", label: "Pika" },
];

export function CreativeGenerator({
  products,
  defaultProductId,
}: {
  products: { id: string; title: string }[];
  defaultProductId?: string;
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(defaultProductId ?? products[0]?.id ?? "");
  const [type, setType] = useState<CreativeInput["type"]>("TIKTOK_SCRIPT");
  const [durationSeconds, setDurationSeconds] = useState<CreativeInput["durationSeconds"]>(30);
  const [engine, setEngine] = useState<NonNullable<CreativeInput["engine"]>>("CAPCUT");
  const [result, setResult] = useState<{ data: CreativeScriptOutput; usedDemoProvider: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    if (!productId) return;
    startTransition(async () => {
      try {
        const res = await generateCreativeForProduct(productId, { type, durationSeconds, engine });
        setResult({ data: res.data, usedDemoProvider: res.usedDemoProvider });
        toast.success("Guion generado");
        router.refresh();
      } catch {
        toast.error("No pudimos generar el guion. Probá de nuevo.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generar contenido</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="sm:col-span-2">
                <SelectValue placeholder="Elegí un producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={(v) => setType(v as CreativeInput["type"])}>
              <SelectTrigger>
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(durationSeconds)}
              onValueChange={(v) => setDurationSeconds(Number(v) as CreativeInput["durationSeconds"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Duración" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}s
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select value={engine} onValueChange={(v) => setEngine(v as NonNullable<CreativeInput["engine"]>)}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Motor de video" />
              </SelectTrigger>
              <SelectContent>
                {ENGINES.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleGenerate} disabled={!productId || isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Clapperboard />}
              Generar guion
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{result.data.title}</CardTitle>
            <Badge variant={result.usedDemoProvider ? "outline" : "info"}>
              {result.usedDemoProvider ? "Contenido demo" : "Generado con IA"}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Field label="Hook" value={result.data.hook} />

            <div>
              <div className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Escenas</div>
              <div className="flex flex-col gap-3">
                {result.data.scenes.map((s, i) => (
                  <div key={i} className="rounded-md border p-3 text-sm">
                    <div className="mb-1 font-medium">Escena {i + 1}: {s.scene}</div>
                    <div className="grid grid-cols-1 gap-2 text-muted-foreground sm:grid-cols-2">
                      <div><span className="font-medium text-foreground">Voz en off:</span> {s.voiceover}</div>
                      <div><span className="font-medium text-foreground">Texto en pantalla:</span> {s.onScreenText}</div>
                      <div className="sm:col-span-2"><span className="font-medium text-foreground">Plano:</span> {s.shotDescription}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Demostración del producto" value={result.data.productDemonstration} />
              <Field label="CTA" value={result.data.cta} />
              <Field label="Instrucciones de edición" value={result.data.editingInstructions} />
              <Field label="Dirección musical" value={result.data.musicDirection} />
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Prompt para {ENGINES.find((e) => e.value === engine)?.label}
              </div>
              <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs leading-relaxed">
                {result.data.generatorPrompt}
              </pre>
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
