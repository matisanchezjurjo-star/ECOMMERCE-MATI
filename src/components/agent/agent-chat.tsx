"use client";

import { useRef, useState, useTransition } from "react";
import { Bot, Loader2, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { sendAgentMessage } from "@/lib/actions/agent";

export interface AgentChatMessage {
  id: string;
  role: string;
  content: string;
}

const SUGGESTIONS = [
  "Find products under $15 with score above 70",
  "Calculate margin for cost 10 price 35",
  "Find suppliers for my top product",
  "What should I launch this week?",
];

export function AgentChat({ threadId, initialMessages }: { threadId: string; initialMessages: AgentChatMessage[] }) {
  const [messages, setMessages] = useState<AgentChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextLocalId = useRef(0);

  function localId(suffix: string) {
    nextLocalId.current += 1;
    return `local-${nextLocalId.current}-${suffix}`;
  }

  function send(text: string) {
    if (!text.trim() || isPending) return;
    const userMessage: AgentChatMessage = { id: localId("u"), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    startTransition(async () => {
      try {
        const result = await sendAgentMessage(threadId, text);
        setMessages((prev) => [...prev, { id: localId("a"), role: "assistant", content: result.reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: localId("e"), role: "assistant", content: "Something went wrong — please try again." },
        ]);
      } finally {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Bot className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Ask the AI Agent anything about your products</p>
              <p className="text-sm text-muted-foreground">
                It can search discovered products, find suppliers, calculate profitability, and generate brands.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  {m.role === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                </div>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user" ? "bg-foreground text-background" : "bg-muted"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="size-3.5" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex max-w-2xl items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about products, suppliers, margins, brands..."
            className="min-h-11 resize-none"
            rows={1}
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
