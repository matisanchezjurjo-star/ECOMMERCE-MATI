"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/session";
import { runAgentTurn } from "@/lib/agent/run";

export async function sendAgentMessage(threadId: string, message: string) {
  const session = await requireSession();
  if (!message.trim()) throw new Error("Message is empty");

  const result = await runAgentTurn({
    message: message.trim(),
    threadId,
    ctx: { organizationId: session.organizationId, userId: session.userId },
  });

  revalidatePath("/agent");
  return result;
}
