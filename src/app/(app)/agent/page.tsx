import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { AgentChat } from "@/components/agent/agent-chat";

const DEFAULT_THREAD_ID = "default";

export default async function AgentPage() {
  const session = await requireSession();

  const messages = await db.agentMessage.findMany({
    where: { organizationId: session.organizationId, userId: session.userId, threadId: DEFAULT_THREAD_ID },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">AI Agent</h1>
        <p className="text-sm text-muted-foreground">
          Tool-calling assistant with access to your discovered products, suppliers, and profitability calculator.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <AgentChat
          threadId={DEFAULT_THREAD_ID}
          initialMessages={messages.map((m) => ({ id: m.id, role: m.role, content: m.content }))}
        />
      </div>
    </div>
  );
}
