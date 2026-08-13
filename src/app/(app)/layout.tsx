import { redirect } from "next/navigation";

import { requireSession } from "@/lib/session";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { Topbar } from "@/components/shell/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  if (!session.settings?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-svh overflow-hidden">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar md:block">
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={session.name} email={session.email} image={session.image} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
