"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Loader2, Send, Clock, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ToolSelector } from "@/components/ToolSelector";
import { OutputTypeSelector } from "@/components/OutputTypeSelector";
import { FileUpload } from "@/components/FileUpload";
import type { UserInput, ToolOverride, OutputTypeOverride } from "@/lib/prompt-engine";
import type { ProviderConfig } from "@/components/ProviderSettings";
import type { HistoryEntry } from "@/hooks/usePromptHistory";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  { label: "SaaS boilerplate",   text: "Build a Next.js SaaS app with auth, Stripe, and a dashboard" },
  { label: "Cold email",         text: "Write a cold outreach email for a B2B software product" },
  { label: "Image prompt",       text: "Generate a photorealistic image of a futuristic city at dusk" },
  { label: "System prompt",      text: "Create a system prompt for a customer support AI agent" },
  { label: "Research brief",     text: "Research and compare the top 5 vector databases for production use" },
];

const LOADING_STAGES = [
  "Detecting intent…",
  "Selecting the right AI tool…",
  "Writing your prompt…",
];

const MAX_CHARS = 2000;

interface InputPanelProps {
  onSubmit: (input: UserInput, provider: ProviderConfig) => void;
  isLoading: boolean;
  submitError?: string | null;
  providerConfig: ProviderConfig;
  activeProviderLabel: string;
  hasApiKey: boolean;
  history?: HistoryEntry[];
}

export function InputPanel({
  onSubmit,
  isLoading,
  submitError,
  providerConfig,
  activeProviderLabel,
  hasApiKey,
  history = [],
}: InputPanelProps) {
  const [idea, setIdea]                             = useState("");
  const [toolOverride, setToolOverride]             = useState<ToolOverride>("auto");
  const [outputTypeOverride, setOutputTypeOverride] = useState<OutputTypeOverride>("auto");
  const [contextText, setContextText]               = useState("");
  const [contextOpen, setContextOpen]               = useState(false);
  const [fileContent, setFileContent]               = useState<string | null>(null);
  const [fileName, setFileName]                     = useState<string | null>(null);
  const [error, setError]                           = useState<string | null>(null);
  const [isMac, setIsMac]                           = useState(true);
  const [focused, setFocused]                       = useState(false);
  const [loadingStage, setLoadingStage]             = useState(0);
  const [showHistory, setShowHistory]               = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  // Cycle through loading stage labels while waiting for response
  useEffect(() => {
    if (!isLoading) { setLoadingStage(0); return; }
    setLoadingStage(0);
    const t1 = setTimeout(() => setLoadingStage(1), 600);
    const t2 = setTimeout(() => setLoadingStage(2), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isLoading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim()) {
      setError("Describe what you want to create.");
      textareaRef.current?.focus();
      return;
    }
    if (!hasApiKey) {
      setError("Open Settings ⚙ (top right) and paste a free API key first.");
      return;
    }
    setError(null);
    onSubmit(
      { rawIdea: idea.trim(), contextText: contextText.trim(), fileContent, fileName, toolOverride, outputTypeOverride },
      providerConfig
    );
  }

  function handleExample(text: string) {
    setIdea(text);
    setError(null);
    setShowHistory(false);
    textareaRef.current?.focus();
  }

  const charCount = idea.length;
  const charOver  = charCount > MAX_CHARS;

  return (
    <main className="page-bg min-h-screen flex flex-col items-center justify-center px-4 py-16 fade-in">
      <div className="w-full max-w-xl">

        {/* ── Wordmark ── */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="h-7 w-7 rounded-md flex items-center justify-center text-white text-xs font-bold select-none"
            style={{ background: "var(--brand)", letterSpacing: "-0.02em" }}>
            PP
          </div>
          <span className="text-sm font-semibold tracking-tight select-none" style={{ color: "var(--fg-strong)" }}>
            PromptPilot
          </span>
          <span className="hidden sm:block h-px w-8" style={{ background: "var(--border-strong)" }} />
          <span className="hidden sm:block text-xs" style={{ color: "var(--fg-faint)" }}>
            Prompt engineering, done right
          </span>
        </div>

        {/* ── Headline ── */}
        <div className="text-center mb-8">
          <h1 className="text-[44px] sm:text-[52px] font-semibold leading-[1.1] tracking-[-0.03em]" style={{ color: "var(--fg-strong)" }}>
            Turn a rough idea
            <br />
            <span style={{ color: "var(--brand)" }}>into the right prompt.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed max-w-sm mx-auto" style={{ color: "var(--fg-muted)" }}>
            Describe what you want in plain language. PromptPilot detects intent, picks the right AI tool, and writes the prompt for you.
          </p>
        </div>

        {/* ── API key nudge ── */}
        {!hasApiKey && (
          <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm fade-in-fast"
            style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "var(--brand-text)" }}>
            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
              style={{ borderColor: "#D97706", color: "#D97706" }}>!</span>
            <span>
              Click <strong>⚙</strong> top-right to add a free API key (Groq or Gemini are free to start).
            </span>
          </div>
        )}

        {/* ── Input card ── */}
        <div className="rounded-2xl overflow-hidden transition-shadow duration-200"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: focused ? "var(--shadow-input-focus)" : "var(--shadow-card)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            {/* Textarea */}
            <div className="relative px-4 pt-4 pb-2">
              <Textarea
                ref={textareaRef}
                value={idea}
                onChange={(e) => { setIdea(e.target.value); if (error) setError(null); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="What do you want to create or accomplish?"
                className={cn(
                  "min-h-[128px] text-[15px] leading-relaxed border-0 shadow-none bg-transparent",
                  "focus-visible:ring-0 resize-none px-0 placeholder:text-[var(--fg-faint)]",
                  charOver && "text-red-600"
                )}
                style={{ color: "var(--fg-strong)" }}
                aria-label="Describe your idea"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
              {charCount > 0 && (
                <div className="absolute bottom-3 right-4 text-xs tabular-nums pointer-events-none"
                  style={{ color: charOver ? "#dc2626" : charCount > 1600 ? "#d97706" : "var(--fg-faint)" }}>
                  {charCount}/{MAX_CHARS}
                </div>
              )}
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
              <ToolSelector value={toolOverride} onChange={setToolOverride} />
              <OutputTypeSelector value={outputTypeOverride} onChange={setOutputTypeOverride} />
              <button type="button" onClick={() => setContextOpen((o) => !o)}
                className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium h-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]")}
                style={{ borderColor: contextOpen ? "var(--border-strong)" : "var(--border)", background: contextOpen ? "var(--bg-subtle)" : "transparent", color: "var(--fg-muted)" }}
                aria-expanded={contextOpen}>
                {contextOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                Context
              </button>
              <FileUpload
                onFileLoad={(c, n) => { setFileContent(c); setFileName(n); }}
                onFileRemove={() => { setFileContent(null); setFileName(null); }}
                currentFile={fileName ? { name: fileName } : null}
              />
              {hasApiKey && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
                  style={{ background: "var(--brand-light)", color: "var(--brand-text)", border: "1px solid var(--brand-mid)" }}>
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--brand)" }} />
                  {activeProviderLabel}
                </span>
              )}
            </div>

            {/* Context textarea */}
            {contextOpen && (
              <div className="px-4 pb-3 fade-in-fast">
                <Textarea
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  placeholder="Paste background info, constraints, style notes, or technical details…"
                  className="min-h-[80px] text-sm rounded-xl"
                  style={{ background: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--fg-default)" }}
                  disabled={isLoading}
                />
                <p className="mt-1.5 text-xs" style={{ color: "var(--fg-faint)" }}>
                  More context = more accurate prompt.
                </p>
              </div>
            )}

            {error && (
              <p className="px-4 pb-3 text-sm text-red-600 fade-in-fast flex items-center gap-1.5" role="alert">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </p>
            )}

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Submit footer */}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-xs" style={{ color: "var(--fg-faint)" }}>
                {isLoading ? (
                  <span className="fade-in-fast" key={loadingStage} style={{ color: "var(--brand)" }}>
                    {LOADING_STAGES[loadingStage]}
                  </span>
                ) : (
                  <>{isMac ? "⌘↵" : "Ctrl+↵"} to submit</>
                )}
              </span>
              <button type="submit" disabled={isLoading || charOver}
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 h-9 text-sm">
                {isLoading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Working…</>
                ) : (
                  <><Send className="h-3.5 w-3.5" />Optimize Prompt</>
                )}
              </button>
            </div>

            {submitError && (
              <p className="px-4 pb-3 text-sm text-red-600 text-center fade-in-fast" role="alert">
                {submitError}
              </p>
            )}
          </form>
        </div>

        {/* ── Example chips ── */}
        {!idea && (
          <div className="mt-5 fade-in">
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <p className="text-xs" style={{ color: "var(--fg-faint)" }}>Try an example:</p>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory((s) => !s)}
                  className="inline-flex items-center gap-1 text-xs transition-colors"
                  style={{ color: showHistory ? "var(--brand)" : "var(--fg-faint)" }}
                >
                  <Clock className="h-3 w-3" />
                  Recent
                </button>
              )}
            </div>

            {/* History list */}
            {showHistory && history.length > 0 && (
              <div className="mb-3 rounded-xl overflow-hidden fade-in-fast"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleExample(entry.idea.endsWith("…") ? entry.idea.slice(0, -1) : entry.idea)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-subtle)] group"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs rounded-md px-1.5 py-0.5 shrink-0 font-medium"
                        style={{ background: "var(--brand-light)", color: "var(--brand-text)" }}>
                        {entry.tool}
                      </span>
                      <span className="text-sm truncate" style={{ color: "var(--fg-default)" }}>
                        {entry.idea}
                      </span>
                    </div>
                    <X className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--fg-faint)" }} />
                  </button>
                ))}
              </div>
            )}

            {/* Example chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex) => (
                <button key={ex.label} type="button" onClick={() => handleExample(ex.text)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                  style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--fg-muted)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--brand-text)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-light)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--fg-muted)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card)";
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs" style={{ color: "var(--fg-faint)" }}>
          Your API key never leaves your browser
        </p>

      </div>
    </main>
  );
}
