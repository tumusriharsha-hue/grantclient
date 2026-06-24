"use client";

import { Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { AppHeader, AppShell } from "@/components/layout";
import { Button } from "@/components/ui";

const quickTools = [
  "Write grant intro",
  "Fix grammar",
  "Summarize requirements",
  "Check eligibility",
  "Formal tone check",
  "Make more concise",
];

const initialMessages = [
  {
    role: "user" as const,
    content: "How should I describe our impact for a youth literacy grant?",
  },
  {
    role: "assistant" as const,
    content:
      "Here's a strong framework: lead with a specific number (students served), describe the measurable outcome (literacy score improvement), and connect it to the funder's stated priorities. For example: 'In 2023, our after-school program served 1,500 students across 12 schools, achieving a 25% increase in reading proficiency scores.'",
  },
];

export function AssistantPage() {
  const [messages] = useState(initialMessages);
  const [input, setInput] = useState("");

  return (
    <AppShell header={<AppHeader showSearch={false} title="AI Assistant" />}>
      <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-3">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:col-span-2">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary-light text-text"
                      : "border border-border bg-surface text-text-secondary"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && (
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="text-text-muted hover:text-text">
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button type="button" className="text-text-muted hover:text-text">
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border bg-surface p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about grants..."
                className="flex-1 rounded-md border border-border bg-bg px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
              />
              <Button aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="border-t border-border bg-bg p-6 lg:border-l lg:border-t-0">
          <h3 className="mb-4 text-sm font-semibold text-text">Quick tools</h3>
          <div className="space-y-2">
            {quickTools.map((tool) => (
              <button
                key={tool}
                type="button"
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-left text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                {tool}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
