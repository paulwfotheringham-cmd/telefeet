"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { INTAKE_STEPS, INTAKE_WELCOME } from "@/lib/patient-intake/steps";
import { savePatientIntake } from "./actions";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  body: string;
};

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type Props = {
  viewAsCareHomeId: string | null;
};

export function AddPatientIntakeChat({ viewAsCareHomeId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: nextId(), role: "assistant", body: INTAKE_WELCOME },
    { id: nextId(), role: "assistant", body: INTAKE_STEPS[0].prompt },
  ]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answersRef = useRef<Record<string, string>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const backHref =
    viewAsCareHomeId != null
      ? `/client/dashboard?viewAs=${encodeURIComponent(viewAsCareHomeId)}`
      : "/client/dashboard";

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, finished]);

  useEffect(() => {
    if (!finished) {
      inputRef.current?.focus();
    }
  }, [stepIndex, finished]);

  const onSend = useCallback(() => {
    const text = input.trim();
    if (!text || finished || pending) return;

    const step = INTAKE_STEPS[stepIndex];
    setInput("");
    setError(null);

    const userMsg: ChatMessage = { id: nextId(), role: "user", body: text };
    setMessages((m) => [...m, userMsg]);
    setAnswers((a) => {
      const next = { ...a, [step.fieldKey]: text };
      answersRef.current = next;
      return next;
    });

    if (stepIndex < INTAKE_STEPS.length - 1) {
      const next = INTAKE_STEPS[stepIndex + 1];
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "assistant", body: next.prompt },
      ]);
      setStepIndex((i) => i + 1);
    } else {
      setFinished(true);
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "assistant",
          body: "**Intake complete**\n\nReview the thread above, then save to create the patient record. You can refine details later in the chart.",
        },
      ]);
    }
  }, [finished, input, pending, stepIndex]);

  const onSave = () => {
    setError(null);
    if (!finished) return;

    const merged = answersRef.current;
    for (const s of INTAKE_STEPS) {
      if (!merged[s.fieldKey]?.trim()) {
        setError(
          "Some answers are missing. Please scroll back through the chat.",
        );
        return;
      }
    }

    startTransition(async () => {
      const res = await savePatientIntake(merged, viewAsCareHomeId);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div
        ref={listRef}
        className="max-h-[min(560px,calc(100vh-280px))] space-y-3 overflow-y-auto rounded-2xl border border-brand-line bg-brand-surface/90 p-4 shadow-card ring-1 ring-brand-gold/10 sm:p-5"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === "assistant"
                ? "mr-8 rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-sm leading-relaxed text-brand-cream/95"
                : "ml-8 rounded-2xl border border-brand-gold/30 bg-brand-ink px-4 py-3 text-sm leading-relaxed text-brand-cream"
            }
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              {msg.role === "assistant" ? "Assistant" : "You"}
            </p>
            <p className="whitespace-pre-wrap">{msg.body}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p
          className="rounded-xl border border-red-900/60 bg-red-950/50 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {!finished ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="sr-only" htmlFor="intake-reply">
            Your answer
          </label>
          <textarea
            id="intake-reply"
            ref={inputRef}
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Type your answer… (Shift+Enter for new line)"
            className="min-h-[88px] flex-1 resize-y rounded-xl border border-brand-line bg-brand-panel px-3 py-2.5 text-sm text-brand-cream outline-none transition placeholder:text-brand-muted/70 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25"
            disabled={pending}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!input.trim() || pending}
            className="rounded-xl border border-brand-goldLo/60 bg-gradient-to-b from-brand-goldHi to-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-ink shadow-lux transition hover:from-brand-gold hover:to-brand-goldHi disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-xl border border-brand-line px-4 py-2.5 text-center text-sm font-medium text-brand-cream transition hover:border-brand-gold/40 hover:bg-brand-panel"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={onSave}
            disabled={pending}
            className="rounded-xl border border-brand-goldLo/60 bg-gradient-to-b from-brand-goldHi to-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-ink shadow-lux transition hover:from-brand-gold hover:to-brand-goldHi disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save patient"}
          </button>
        </div>
      )}
    </div>
  );
}
