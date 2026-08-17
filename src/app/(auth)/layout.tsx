import { Mountain } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
          <Mountain className="size-4" />
        </div>
        Cumbre
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
