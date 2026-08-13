import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  icon: Icon,
  title,
  phase,
  description,
  plannedFeatures,
  availableNow,
}: {
  icon: LucideIcon;
  title: string;
  phase: string;
  description: string;
  plannedFeatures: string[];
  availableNow?: { label: string; href: string };
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <Badge variant="outline">{phase}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 pt-6">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Planned for this page</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {plannedFeatures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {availableNow && (
        <div className="flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href={availableNow.href}>{availableNow.label}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
