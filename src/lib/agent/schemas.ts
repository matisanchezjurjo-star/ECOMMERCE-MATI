import { z } from "zod";

export const AgentDecisionSchema = z.object({
  thinking: z.string().describe("One short sentence on how you'll answer."),
  tool: z.string().describe('The tool name to call, or the literal string "none" to answer directly.'),
  toolArgs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  directAnswer: z
    .string()
    .optional()
    .describe('Only set when tool is "none" — a direct conversational answer to the user.'),
});
export type AgentDecision = z.infer<typeof AgentDecisionSchema>;
