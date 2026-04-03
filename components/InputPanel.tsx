"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Loader2, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ToolSelector } from "@/components/ToolSelector";
import { OutputTypeSelector } from "@/components/OutputTypeSelector";
import { FileUpload } from "@/components/FileUpload";
import type { UserInput, ToolOverride, OutputTypeOverride } from "@/lib/prompt-engine";
import type { ProviderConfig } from "@/components/ProviderSettings";
import { cn } from "@/lib/utils";

// Short, scannable labels → prevent chip overflow
const EXAMPLES = [
  { label: "SaaS boilerplate",  text: "Build a Next.js SaaS app with auth, Stripe, and a dashboard" },
  { label: "Cold email",        text: "Write a cold outreach email for a B2B software product" },
  { label: "Image prompt",      text: "Generate a photorealistic image of a futuristic city at dusk" },
  { label: "System prompt",     text: "Create a system prompt for a customer support AI agent" },
  { label: "Research brief",    text: "Research and compare the top 5 vector databases for production use" },
];

const MAX_CHARS = 2000;

interface InputPanelProps {
  onSubmit: (input: UserInput, provider: ProviderConfig) => void;
  isLoading: boolean;
  submitError?: string | null;
  providerConfig: ProviderConfig;
  activeProviderLabel: string;
  hasApiKey: boolean;
}

export function InputPanel({
  onSubmit,
  isLoading,
  submitError,
  providerConfig,
  activeProviderLabel,
  hasApiKey,
}: InputPanelProps) {
  const [idea, setIdea] = useState("");
  const [toolOverride, setToolOverride]       = useState<ToolOverride>("auto");
  const [outputTypeOverride, setOutputTypeOverride] = useState<OutputTypeOverride>("auto");
  const [contextText, setContextText] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName]       = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [isMac, setIsMac]             = useState(true);
  const [focused, setFocused]         = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

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
    textareaRef.current?.focus();
  }

  const charCount = idea.length;
  const charOver  = charCount > MAX_CHARS;

  return (
    <main className="page-bg min-h-screen flex flex-col items-center justify-center px-4 py-16 fade-in">
      <div className="w-full max-w-xl">

        {/* ── Wordmark ─────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {/* Square logotype — like a rubber stamp, not a startup neon pill */}
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center text-white text-xs font-bold tracking-tight select-none"
            style={{ background: "var(--brand)", letterSpacing: "-0.02em" }}
          >
            PP
          </div>
          <span
            className="text-sm font-semibold tracking-tight select-none"
            style={{ color: "var(--fg-strong)" }}
          >
            PromptPilot
          </span>
          {/* Editorial tagline — horizontal rule style */}
          <span className="hidden sm:block h-px w-8 bg-[var(--border-strong)]" />
          <span className="hidden sm:block text-xs" style={{ color: "var(--fg-faint)" }}>
            Prompt engineering, done right
          </span>
        </div>

        {/* ── Headline ─────────────────────────────── */}
        <div className="text-center mb-8">
          <h1
            className="text-[44px] sm:text-[52px] font-semibold leading-[1.1] tracking-[-0.03em]"
            style={{ color: "var(--fg-strong)" }}
          >
            Turn a rough idea
            <br />
            <span style={{ color: "var(--brand)" }}>into the right prompt.</span>
          </h1>
          <p
            className="mt-4 text-[15px] leading-relaxed max-w-sm mx-auto"
            style={{ color: "var(--fg-muted)" }}
          >
            Describe what you want in plain language. PromptPilot detects intent, picks the right AI tool, and writes the prompt for you.
          </p>
        </div>

        {/* ── API key nudge ─────────────────────────── */}
        {!hasApiKey && (
          <div
            className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm fade-in-fast"
            style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              color: "var(--brand-text)"
            }}
          >
            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-[#D97706] flex items-center justify-center text-[10px] font-bold" style={{ color: "#D97706" }}>!</span>
            <span>
              Click <strong>⚙</strong> top-right to add a free API key (Groq or Gemini are free to start).
            </span>
          </div>
        )}

        {/* ── Input card ───────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden transition-shadow duration-200"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: focused
              ? "var(--shadow-input-focus)"
              : "var(--shadow-card)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate>

            {/* Textarea — borderless inside card */}
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
                aria-invalid={!!error}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
              {/* Char counter */}
              {charCount > 0 && (
                <div
                  className="absolute bottom-3 right-4 text-xs tabular-nums pointer-events-none"
                  style={{ color: charOver ? "#dc2626" : charCount > 1600 ? "#d97706" : "var(--fg-faint)" }}
                >
                  {charCount}/{MAX_CHARS}
                </div>
              )}
            </div>

            {/* Thin rule */}
            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
              <ToolSelector value={toolOverride} onChange={setToolOverride} />
              <OutputTypeSelector value={outputTypeOverride} onChange={setOutputTypeOverride} />
              <button
                type="button"
                onClick={() => setContextOpen((o) => !o)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium h-8",
                  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                )}
                style={{
                  borderColor: contextOpen ? "var(--border-strong)" : "var(--border)",
                  background: contextOpen ? "var(--bg-subtle)" : "transparent",
                  color: "var(--fg-muted)"
                }}
                aria-expanded={contextOpen}
              >
                {contextOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                Context
              </button>
              <FileUpload
                onFileLoad={(c, n) => { setFileContent(c); setFileName(n); }}
                onFileRemove={() => { setFileContent(null); setFileName(null); }}
                currentFile={fileName ? { name: fileName } : null}
              />

              {/* Active provider — right-aligned */}
              {hasApiKey && (
                <span
                  className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
                  style={{
                    background: "var(--brand-light)",
                    color: "var(--brand-text)",
                    border: "1px solid var(--brand-mid)"
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: "var(--brand)" }}
                  />
                  {activeProviderLabel}
                </span>
              )}
            </div>

            {/* Optional context textarea */}
            {contextOpen && (
              <div className="px-4 pb-3 fade-in-fast">
                <Textarea
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  placeholder="Paste background info, constraints, style notes, or technical details…"
                  className="min-h-[80px] text-sm rounded-xl"
                  style={{
                    background: "var(--bg-subtle)",
                    borderColor: "var(--border)",
                    color: "var(--fg-default)"
                  }}
                  aria-label="Optional context"
                  disabled={isLoading}
                />
                <p className="mt-1.5 text-xs" style={{ color: "var(--fg-faint)" }}>
                  More context = more accurate prompt.
                </p>
              </div>
            )}

            {/* Inline error */}
            {error && (
              <p className="px-4 pb-3 text-sm text-red-600 fade-in-fast flex items-center gap-1.5" role="alert">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </p>
            )}

            {/* Thin rule */}
            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Submit footer */}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-xs" style={{ color: "var(--fg-faint)" }}>
                {isMac ? "⌘↵" : "Ctrl+↵"} to submit
              </span>
              <button
                type="submit"
                disabled={isLoading || charOver}
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 h-9 text-sm"
              >
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

        {/* ── Example chips (below card) ─────────────── */}
        {!idea && (
          <div className="mt-5 fade-in">
            <p className="text-xs text-center mb-2.5" style={{ color: "var(--fg-faint)" }}>
              Not sure where to start? Pick an example:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => handleExample(ex.text)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--fg-muted)",
                  }}
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

        {/* ── Footer note ───────────────────────────── */}
        <p className="mt-6 text-center text-xs" style={{ color: "var(--fg-faint)" }}>
          Your API key never leaves your browser
        </p>

      </div>
    </main>
  );
}
