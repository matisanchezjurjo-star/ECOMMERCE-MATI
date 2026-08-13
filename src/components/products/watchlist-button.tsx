"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleWatchlist } from "@/lib/actions/watchlist";

export function WatchlistButton({
  productId,
  initialWatching,
  variant = "outline",
  size = "sm",
}: {
  productId: string;
  initialWatching: boolean;
  variant?: "outline" | "ghost" | "secondary";
  size?: "sm" | "icon";
}) {
  const [watching, setWatching] = useState(initialWatching);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !watching;
    setWatching(next);
    startTransition(async () => {
      try {
        const result = await toggleWatchlist(productId);
        setWatching(result.watching);
        toast.success(result.watching ? "Added to watchlist" : "Removed from watchlist");
      } catch {
        setWatching(!next);
        toast.error("Couldn't update watchlist");
      }
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={handleClick}
      aria-pressed={watching}
      className={cn(size === "sm" && "gap-1.5")}
    >
      {watching ? <BookmarkCheck className="size-4 text-foreground" /> : <Bookmark className="size-4" />}
      {size === "sm" && (watching ? "Watching" : "Save")}
    </Button>
  );
}
