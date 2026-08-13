"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { analyzeProductWithAI } from "@/lib/actions/ai-analysis";

export function AnalyzeButton({ productId, hasAnalysis }: { productId: string; hasAnalysis: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await analyzeProductWithAI(productId);
        toast.success(
          result.usedDemoProvider
            ? "Demo analysis generated — connect an AI provider in Settings for real output."
            : "AI analysis complete."
        );
        router.refresh();
      } catch {
        toast.error("Couldn't run AI analysis. Please try again.");
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending} variant={hasAnalysis ? "outline" : "default"}>
      {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
      {hasAnalysis ? "Re-analyze with AI" : "Analyze With AI"}
    </Button>
  );
}
