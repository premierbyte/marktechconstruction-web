"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupportOpening, sendSupportMessage } from "../../api/client";
import type { ChatMessage, SupportReference } from "../../types";

const FALLBACK_STARTERS = [
  "What services do you offer?",
  "How do I start a project?",
  "Where do you work?",
  "How can I contact you?",
];

let messageCounter = 0;

function nextId(): string {
  messageCounter += 1;
  return `support-${Date.now()}-${messageCounter}`;
}

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_STARTERS);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    if (loadedRef.current) return;
    loadedRef.current = true;

    let cancelled = false;

    getSupportOpening()
      .then((opening) => {
        if (cancelled) return;
        setMessages([{ id: nextId(), role: "assistant", text: opening.greeting }]);
        setSuggestions(opening.starters.length > 0 ? opening.starters : FALLBACK_STARTERS);
      })
      .catch(() => {
        if (cancelled) return;
        setMessages([
          {
            id: nextId(),
            role: "assistant",
            text: "Hi! Ask me about our services, sectors or how to start a project.",
          },
        ]);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    const element = scrollRef.current;
    element?.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();

    if (trimmed === "" || busy) return;

    setInput("");
    setFailed(false);
    setMessages((previous) => [...previous, { id: nextId(), role: "user", text: trimmed }]);
    setBusy(true);

    try {
      const reply = await sendSupportMessage(trimmed);
      setMessages((previous) => [
        ...previous,
        { id: nextId(), role: "assistant", text: reply.answer, references: reply.references },
      ]);
      setSuggestions(reply.suggestions.length > 0 ? reply.suggestions : FALLBACK_STARTERS);
    } catch {
      setFailed(true);
      setMessages((previous) => [
        ...previous,
        {
          id: nextId(),
          role: "assistant",
          text: "Sorry, I could not reach the support service just now. Please try again, or use the enquiry form to reach the team.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open ? (
        <section
          id={panelId}
          role="dialog"
          aria-label="Customer support"
          className="fixed inset-x-3 bottom-24 z-50 flex max-h-[min(80vh,40rem)] flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-lift sm:inset-x-auto sm:right-5 sm:w-[24rem]"
        >
          <header className="relative overflow-hidden bg-gradient-to-br from-forest via-forest-soft to-clay px-5 py-4 text-white">
            <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-white/15 blur-2xl" aria-hidden />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                  <Sparkles aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">Support assistant</p>
                  <p className="flex items-center gap-1.5 text-xs text-white/80">
                    <span className="inline-block size-1.5 rounded-full bg-emerald-300" aria-hidden />
                    Online · answers from our knowledge base
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close support chat"
                className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "hero-fade max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm",
                    message.role === "user"
                      ? "rounded-br-sm bg-forest text-white"
                      : "rounded-bl-sm border border-line bg-white text-ink",
                  )}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  {message.references && message.references.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {message.references.map((reference: SupportReference) => (
                        <Link
                          key={`${reference.url}-${reference.label}`}
                          href={reference.url}
                          className="text-xs font-semibold text-clay underline decoration-clay/40 underline-offset-2 hover:text-forest"
                        >
                          {reference.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {busy ? (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-line bg-white px-3.5 py-3"
                  aria-label="Assistant is typing"
                >
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className="size-1.5 animate-bounce rounded-full bg-muted"
                      style={{ animationDelay: `${index * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {suggestions.length > 0 ? (
            <div className="border-t border-line/60 px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Suggested</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    disabled={busy}
                    className="rounded-full border border-forest/20 bg-white px-3 py-1.5 text-left text-xs font-semibold text-forest transition-colors hover:border-forest/40 hover:bg-forest/5 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="border-t border-line bg-white p-3"
          >
            <div className="flex items-end gap-2">
              <label htmlFor="support-input" className="sr-only">
                Your message
              </label>
              <input
                id="support-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question..."
                maxLength={1000}
                autoComplete="off"
                aria-invalid={failed}
                className="min-h-11 flex-1 rounded-full border border-line bg-paper px-4 text-sm text-ink placeholder:text-muted/70"
              />
              <button
                type="submit"
                disabled={busy || input.trim() === ""}
                aria-label="Send message"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-white transition-colors hover:bg-forest-soft disabled:opacity-50"
              >
                <Send aria-hidden className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted">
              Automated replies from our knowledge base. Conversations are not stored.
            </p>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className={cn(
          "fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-gradient-to-br from-forest via-forest-soft to-clay text-white shadow-lift transition-transform hover:scale-105 active:scale-95",
          open && "rotate-90",
        )}
      >
        {!open ? (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-clay/30" aria-hidden />
        ) : null}
        {open ? <X aria-hidden className="size-6" /> : <MessageCircle aria-hidden className="size-6" />}
      </button>
    </>
  );
}