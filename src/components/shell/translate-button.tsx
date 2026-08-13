"use client";

import { useRef, useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  collectTextNodes,
  applyTranslations,
  restoreOriginal,
  translatableStrings,
  type CapturedNode,
} from "@/lib/i18n/translate-dom";

/**
 * Translates the currently visible page to Spanish in place. Walks the
 * rendered DOM (not a build-time i18n catalog), batches unique strings to
 * `/api/translate`, and swaps text nodes — so it works across every page
 * without every component needing to be wired into a translation system.
 */
export function TranslateButton() {
  const [state, setState] = useState<"original" | "translating" | "translated">("original");
  const capturedRef = useRef<CapturedNode[] | null>(null);

  async function handleClick() {
    if (state === "translated") {
      if (capturedRef.current) restoreOriginal(capturedRef.current);
      setState("original");
      return;
    }

    const root = document.querySelector("main") ?? document.body;
    const nodes = collectTextNodes(root as HTMLElement);
    const texts = translatableStrings(nodes);

    if (texts.length === 0) {
      toast.info("Nothing on this page to translate.");
      return;
    }

    setState("translating");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, targetLanguage: "Spanish" }),
      });
      if (!res.ok) throw new Error("Translation request failed");
      const data: { translations: string[]; usedDemoProvider: boolean } = await res.json();

      const map = new Map<string, string>();
      texts.forEach((original, i) => map.set(original, data.translations[i] ?? original));

      applyTranslations(nodes, map);
      capturedRef.current = nodes;
      setState("translated");

      if (data.usedDemoProvider) {
        toast.info("Demo translation: common labels only. Connect an AI provider in Settings for full-page translation.");
      }
    } catch {
      toast.error("Couldn't translate this page. Please try again.");
      setState("original");
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={state === "translated" ? "Show original language" : "Translate page to Spanish"}
      title={state === "translated" ? "Show original (English)" : "Translate to Spanish"}
      onClick={handleClick}
      disabled={state === "translating"}
    >
      {state === "translating" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Languages className={state === "translated" ? "size-4 text-foreground" : "size-4"} />
      )}
    </Button>
  );
}
