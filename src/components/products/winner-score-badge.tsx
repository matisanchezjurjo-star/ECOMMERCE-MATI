import { cn } from "@/lib/utils";
import { CLASSIFICATION_LABEL, CLASSIFICATION_TEXT_CLASS } from "@/lib/scoring/format";
import type { WinnerClassificationValue } from "@/lib/scoring/types";

/** The big score treatment from spec section 48 — score gets strong visual weight. */
export function WinnerScoreBadge({
  score,
  classification,
  size = "md",
}: {
  score: number | null;
  classification: WinnerClassificationValue | null;
  size?: "sm" | "md" | "lg";
}) {
  if (score === null || classification === null) {
    return <span className="text-sm text-muted-foreground">Not yet scored</span>;
  }

  const sizeClass = { sm: "text-xl", md: "text-3xl", lg: "text-5xl" }[size];

  return (
    <div className="flex flex-col gap-0.5">
      <div className={cn("font-bold leading-none tabular-nums", sizeClass, CLASSIFICATION_TEXT_CLASS[classification])}>
        {score.toFixed(0)}
        <span className="ml-0.5 text-[0.4em] font-medium text-muted-foreground">/100</span>
      </div>
      <div className={cn("text-xs font-semibold tracking-wide uppercase", CLASSIFICATION_TEXT_CLASS[classification])}>
        {CLASSIFICATION_LABEL[classification]}
      </div>
    </div>
  );
}
