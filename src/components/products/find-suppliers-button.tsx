"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { findSuppliersForProduct } from "@/lib/actions/suppliers";

export function FindSuppliersButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await findSuppliersForProduct(productId);
        toast.success(`Found ${result.linkedCount} supplier option${result.linkedCount === 1 ? "" : "s"}.`);
        router.refresh();
      } catch {
        toast.error("Couldn't search for suppliers. Please try again.");
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      {isPending ? <Loader2 className="animate-spin" /> : <Truck />}
      Find Suppliers
    </Button>
  );
}
