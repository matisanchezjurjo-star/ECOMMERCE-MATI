"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { loadDemoData } from "@/lib/actions/demo-data";

export function DemoDataButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await loadDemoData();
        toast.success(`Loaded ${result.productCount} demo products across every source.`);
        router.refresh();
      } catch {
        toast.error("Couldn't load demo data. Please try again.");
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
      {isPending ? "Loading demo data..." : "Load Demo Data"}
    </Button>
  );
}
