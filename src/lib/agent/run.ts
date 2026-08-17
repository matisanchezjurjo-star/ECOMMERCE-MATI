import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/factory";
import type { AIProvider } from "@/lib/ai/types";
import { recordAIUsage } from "@/lib/ai/usage";
import { DEMO_CATEGORIES } from "@/integrations/shared/catalog";
import { AGENT_TOOLS, getToolByName, type AgentToolContext } from "./tools";
import { AgentDecisionSchema } from "./schemas";

interface RunAgentTurnParams {
  message: string;
  threadId: string;
  ctx: AgentToolContext;
}

const TOOLS_DESCRIPTION = AGENT_TOOLS.map((t) => `- ${t.name}(${t.argsShape}): ${t.description}`).join("\n");

export async function runAgentTurn({ message, threadId, ctx }: RunAgentTurnParams) {
  const settings = await db.userSettings.findUnique({ where: { userId: ctx.userId } });
  const provider = getAIProvider({ provider: settings?.aiProvider ?? "ANTHROPIC", model: settings?.aiModel });

  await db.agentMessage.create({
    data: { organizationId: ctx.organizationId, userId: ctx.userId, threadId, role: "user", content: message },
  });

  const history = await db.agentMessage.findMany({
    where: { organizationId: ctx.organizationId, threadId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  let toolName = "none";
  let toolArgs: Record<string, unknown> = {};
  let directAnswer: string | undefined;
  let usedKeywordRouting = provider.isDemo;

  if (!provider.isDemo) {
    try {
      const prompt = buildDecisionPrompt(message, settings, history.reverse());
      const decision = await provider.generateStructuredOutput(prompt, AgentDecisionSchema, {
        feature: "agentDecision",
      });
      await recordAIUsage({
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        feature: "agentDecision",
        usage: decision.usage,
      });
      toolName = decision.data.tool;
      toolArgs = decision.data.toolArgs ?? {};
      directAnswer = decision.data.directAnswer;
    } catch {
      // Structured decision failed even after the provider's own retry —
      // degrade to keyword routing rather than erroring the whole turn.
      usedKeywordRouting = true;
    }
  }

  if (usedKeywordRouting) {
    const routed = keywordRoute(message);
    toolName = routed.tool;
    toolArgs = routed.args;
  }

  let toolOutput: string | undefined;
  if (toolName !== "none") {
    const tool = getToolByName(toolName);
    if (!tool) {
      toolOutput = `Unknown tool "${toolName}".`;
    } else {
      try {
        toolOutput = await tool.run(toolArgs, ctx);
      } catch (err) {
        toolOutput = `That didn't work: ${err instanceof Error ? err.message : "unknown error"}`;
      }
    }
  }

  const reply = await synthesizeReply({ provider, message, toolName, toolOutput, directAnswer, ctx, isDemo: usedKeywordRouting });

  await db.agentMessage.create({
    data: {
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      threadId,
      role: "assistant",
      content: reply,
      toolCalls: toolName !== "none" ? JSON.parse(JSON.stringify({ tool: toolName, args: toolArgs })) : undefined,
    },
  });

  return { reply, toolUsed: toolName !== "none" ? toolName : null };
}

function buildDecisionPrompt(
  message: string,
  settings: { targetCountries: string[]; preferredCategories: string[]; businessModel: string; riskTolerance: string } | null,
  history: { role: string; content: string }[]
): string {
  const historyText = history.map((h) => `${h.role}: ${h.content}`).join("\n");
  const prefs = settings
    ? `Known user preferences (do not ask for these again): target countries ${settings.targetCountries.join(", ") || "unspecified"}; preferred categories ${settings.preferredCategories.join(", ") || "unspecified"}; business model ${settings.businessModel}; risk tolerance ${settings.riskTolerance}.`
    : "No saved preferences yet.";

  return `You are the AI Agent inside Cumbre, an ecommerce product-research and brand-building platform for entrepreneurs. You have access to these tools:
${TOOLS_DESCRIPTION}

${prefs}

Recent conversation:
${historyText || "(none)"}

User's new message: "${message}"

Decide whether to call exactly one tool to answer this, or answer directly. Return JSON with keys:
thinking (one short sentence), tool (a tool name from the list above, or "none"), toolArgs (object matching the
tool's args shape, only if calling a tool), directAnswer (only if tool is "none" — answer the user directly and
conversationally using what you already know).`;
}

function keywordRoute(message: string): { tool: string; args: Record<string, unknown> } {
  const lower = message.toLowerCase();

  if (/(find|search|show|winners?|products?|trending|opportunit)/.test(lower)) {
    const maxCost = lower.match(/under\s*\$?(\d+(?:\.\d+)?)/)?.[1];
    const minScore = lower.match(/score\s*(?:of|above|over)?\s*(\d+)/)?.[1];
    const category = DEMO_CATEGORIES.find((c) => lower.includes(c.toLowerCase().split(" ")[0]));
    return {
      tool: "searchProducts",
      args: {
        ...(maxCost ? { maxCost: Number(maxCost) } : {}),
        ...(minScore ? { minWinnerScore: Number(minScore) } : {}),
        ...(category ? { category } : {}),
      },
    };
  }

  if (/(margin|profit|break.?even|roas|cpa)/.test(lower)) {
    const numbers = lower.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    return { tool: "calculateProfitability", args: { productCost: numbers[0] ?? 10, sellingPrice: numbers[1] ?? 30 } };
  }

  return { tool: "none", args: {} };
}

async function synthesizeReply(params: {
  provider: AIProvider;
  message: string;
  toolName: string;
  toolOutput: string | undefined;
  directAnswer: string | undefined;
  ctx: AgentToolContext;
  isDemo: boolean;
}): Promise<string> {
  const { provider, message, toolName, toolOutput, directAnswer, isDemo } = params;

  if (toolName === "none") {
    if (directAnswer) return directAnswer;
    if (isDemo) {
      return `I'm running in demo mode (no AI provider connected), so I can only handle a few direct commands right now: try "find products under $15 with score above 70", or "calculate margin for cost 10 price 35". For full conversational tool use — suppliers, brand generation, and freeform questions — connect an AI provider in Settings.`;
    }
    return "I'm not sure how to help with that yet.";
  }

  if (!toolOutput) return "I tried to help with that but didn't get a usable result — try rephrasing.";

  if (isDemo) {
    return `${toolOutput}`;
  }

  try {
    const prompt = `The user asked: "${message}"\n\nYou called the "${toolName}" tool and got this result:\n${toolOutput}\n\nWrite a short, natural, conversational reply (2-5 sentences) summarizing this for the user. Don't repeat raw data dumps verbatim — synthesize it.`;
    const { text, usage } = await provider.generateText(prompt, { feature: "agentReply" });
    await recordAIUsage({ organizationId: params.ctx.organizationId, userId: params.ctx.userId, feature: "agentReply", usage });
    return text.trim() || toolOutput;
  } catch {
    return toolOutput;
  }
}
