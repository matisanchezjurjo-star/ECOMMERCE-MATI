"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">No images</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        <Image src={images[selected]} alt={title} fill unoptimized className="object-cover" sizes="400px" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "relative size-14 overflow-hidden rounded-md border",
                i === selected && "ring-2 ring-ring"
              )}
            >
              <Image src={src} alt="" fill unoptimized className="object-cover" sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
