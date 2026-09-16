"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, User as UserIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import type { MentorChatMessage, MentorChatResponse } from "@/types";

const STARTER_PROMPTS = [
  "I don't understand DNS",
  "Review my code approach for the port scanner project",
  "What should I learn next?",
  "Give me a mock interview question",
];

export default function MentorPage() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<MentorChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    setError(null);
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: text, created_at: new Date().toISOString() }]);
    setInput("");
    try {
      const res = await api.post<MentorChatResponse>("/mentor/chat", { conversation_id: conversationId, message: text });
      setConversationId(res.conversation_id);
      setMessages(res.history);
      setFollowUps(res.follow_up_questions);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reach the AI Mentor right now.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="eyebrow">AI Mentor · software, on call 24/7</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-100">Your patient senior engineer</h1>
        <p className="mt-1 text-sm text-ink-500">Explains simply, gives hints before answers, and remembers where you&apos;re stuck.</p>
      </div>

      <Card className="flex h-[65vh] flex-col overflow-hidden shadow-raised">
        <div ref={scrollRef} role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent-light">
                <Bot className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-ink-100">Ask me anything about your roadmap</p>
              <p className="mt-1 max-w-xs text-xs text-ink-500">I&apos;ll explain with plain language first, then build up to the technical version.</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="focus-ring rounded-lg border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] px-3.5 py-2 text-left text-xs text-ink-300 transition-all duration-150 ease-smooth hover:border-[rgb(var(--fg-tint)/0.2)] hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100 active:translate-y-px"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex animate-fade-in-up gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-light">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-accent text-white" : "bg-[rgb(var(--fg-tint)/0.05)] text-ink-200"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[rgb(var(--fg-tint)/0.08)] text-xs text-ink-300">
                  {user ? initials(user.full_name) : <UserIcon className="h-3.5 w-3.5" />}
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-light">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-[rgb(var(--fg-tint)/0.05)] px-4 py-3">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-500" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-500 [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-500 [animation-delay:0.3s]" />
              </div>
            </div>
          )}
        </div>

        {followUps.length > 0 && !sending && (
          <div className="flex flex-wrap gap-2 border-t border-[rgb(var(--fg-tint)/0.06)] px-6 py-3">
            {followUps.map((f) => (
              <button
                key={f}
                onClick={() => sendMessage(f)}
                className="focus-ring flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent-light transition-all duration-150 ease-smooth hover:bg-accent/15 active:translate-y-px"
              >
                <Sparkles className="h-3 w-3" /> {f}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="px-6 pt-3">
            <Alert>{error}</Alert>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-end gap-3 border-t border-[rgb(var(--fg-tint)/0.06)] p-4"
        >
          <Textarea
            rows={1}
            placeholder="Ask your AI mentor anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            className="flex-1 resize-none"
          />
          <Button type="submit" loading={sending} disabled={!input.trim()} className="gap-1.5">
            <Send className="h-3.5 w-3.5" /> Send
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
