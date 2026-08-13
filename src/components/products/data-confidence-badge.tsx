import { BadgeCheck, FlaskConical, Sparkles, TestTube } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CONFIG = {
  REAL: { label: "Real data", icon: BadgeCheck, variant: "success" as const, hint: "Sourced directly from a connected API or feed." },
  ESTIMATED: { label: "Estimated", icon: FlaskConical, variant: "warning" as const, hint: "Derived from real inputs using a heuristic — not directly verified." },
  AI_INFERRED: { label: "AI-inferred", icon: Sparkles, variant: "info" as const, hint: "Produced by an AI model with no directly verifiable source." },
  DEMO: { label: "Demo data", icon: TestTube, variant: "outline" as const, hint: "Synthetic seed data for exploring the app — not live market data." },
};

/** Spec section 49 — never present an estimate as a verified fact. */
export function DataConfidenceBadge({ confidence }: { confidence: keyof typeof CONFIG }) {
  const c = CONFIG[confidence];
  const Icon = c.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={c.variant} className="cursor-default gap-1">
          <Icon className="size-3" />
          {c.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{c.hint}</TooltipContent>
    </Tooltip>
  );
}
