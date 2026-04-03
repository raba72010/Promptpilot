"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Sparkles, Loader2, Zap, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ToolSelector } from "@/components/ToolSelector";
import { OutputTypeSelector } from "@/components/OutputTypeSelector";
import { FileUpload } from "@/components/FileUpload";
import type { UserInput, ToolOverride, OutputTypeOverride } from "@/lib/prompt-engine";
import type { ProviderConfig } from "@/components/ProviderSettings";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  { label: "SaaS app",    text: "Build a Next.js SaaS app with auth, Stripe, and a dashboard" },
  { label: "Cold email",  text: "Write a cold outreach email for a B2B software product" },
  { label: "Image gen",   text: "Generate a photorealistic image of a futuristic city at dusk" },
  { label: "System prompt", text: "Create a system prompt for a customer support AI agent" },
  { label: "Research",    text: "Research and compare the top 5 vector databases for production use" },
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
  const [toolOverride, setToolOverride] = useState<ToolOverride>("auto");
  const [outputTypeOverride, setOutputTypeOverride] = useState<OutputTypeOverride>("auto");
  const [contextText, setContextText] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(true);
  const [focused, setFocused] = useState(false);

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
      setError("Open Settings ⚙ (top right) and add a free API key first.");
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
  const charOver = charCount > MAX_CHARS;

  return (
    <main className="page-bg min-h-screen flex flex-col items-center justify-center px-4 py-16 fade-in">
      <div className="w-full max-w-2xl">

        {/* Logo pill */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 backdrop-blur-sm px-4 py-1.5 shadow-sm">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-semibold tracking-widest text-gray-600 uppercase">PromptPilot</span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-5xl sm:text-[58px] font-semibold tracking-tight leading-[1.1]">
            <span className="gradient-text">Perfect your AI request</span>
            <br />
            <span className="gradient-text-muted">before you hit send</span>
          </h1>
          <p className="mt-5 text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
            Describe your goal in plain language. Get an expert-crafted prompt and the right AI tool — instantly.
          </p>
        </div>

        {/* API key nudge */}
        {!hasApiKey && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 backdrop-blur-sm px-4 py-3 text-sm text-amber-800 shadow-sm fade-in-fast">
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
            <span>
              Click <strong>⚙</strong> top-right to add a free API key (Groq, Gemini, etc.) and get started.
            </span>
          </div>
        )}

        {/* Form card */}
        <div className={cn(
          "rounded-3xl border bg-white/80 backdrop-blur-sm shadow-sm transition-shadow duration-300",
          focused ? "shadow-[0_0_0_3px_rgba(139,92,246,0.12),0_8px_32px_rgba(0,0,0,0.08)]" : "shadow-[0_2px_16px_rgba(0,0,0,0.06)]",
          "border-gray-200"
        )}>
          <form onSubmit={handleSubmit} noValidate className="p-5">

            {/* Textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={idea}
                onChange={(e) => { setIdea(e.target.value); if (error) setError(null); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Build an app, generate an image, write content, create a system prompt…"
                className={cn(
                  "min-h-[148px] text-[15px] leading-relaxed border-0 shadow-none bg-transparent focus-visible:ring-0 resize-none pb-7 px-0 placeholder:text-gray-400",
                  charOver && "text-red-600"
                )}
                aria-label="Describe your idea"
                aria-invalid={!!error}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
              <div className={cn(
                "absolute bottom-2 right-0 text-xs tabular-nums pointer-events-none transition-colors",
                charOver ? "text-red-500 font-medium" : charCount > 1600 ? "text-amber-500" : "text-gray-300"
              )}>
                {charCount > 0 && `${charCount}/${MAX_CHARS}`}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 -mx-5 mb-3" />

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-2">
              <ToolSelector value={toolOverride} onChange={setToolOverride} />
              <OutputTypeSelector value={outputTypeOverride} onChange={setOutputTypeOverride} />
              <button
                type="button"
                onClick={() => setContextOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 h-9"
                aria-expanded={contextOpen}
              >
                {contextOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                Context
              </button>
              <FileUpload
                onFileLoad={(c, n) => { setFileContent(c); setFileName(n); }}
                onFileRemove={() => { setFileContent(null); setFileName(null); }}
                currentFile={fileName ? { name: fileName } : null}
              />

              {/* Active provider pill */}
              {hasApiKey && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  {activeProviderLabel}
                </span>
              )}
            </div>

            {/* Optional context */}
            {contextOpen && (
              <div className="mt-3 fade-in-fast">
                <Textarea
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  placeholder="Paste background info, constraints, style notes, or technical details…"
                  className="min-h-[88px] text-sm bg-gray-50 border-gray-200 rounded-xl"
                  aria-label="Optional context"
                  disabled={isLoading}
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  More context = more accurate prompt. You can also upload a file above.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5 fade-in-fast" role="alert">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || charOver}
              className={cn(
                "btn-glow mt-4 w-full h-12 rounded-2xl text-sm font-semibold text-white",
                "inline-flex items-center justify-center gap-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              )}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Optimizing your request…</>
              ) : (
                <><Sparkles className="h-4 w-4" />Perfect My Request<ArrowRight className="h-3.5 w-3.5 ml-1 opacity-70" /></>
              )}
            </button>

            {submitError && (
              <p className="mt-3 text-center text-sm text-red-600 fade-in-fast" role="alert">{submitError}</p>
            )}
          </form>
        </div>

        {/* Example chips */}
        {!idea && (
          <div className="mt-6 fade-in">
            <p className="text-xs text-gray-400 text-center mb-3">Try an example</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => handleExample(ex.text)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm px-3.5 py-1.5 text-xs text-gray-500 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all duration-150 shadow-sm"
                >
                  <span className="h-1 w-1 rounded-full bg-gray-300 group-hover:bg-violet-400 transition-colors" />
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard hint */}
        <p className="mt-5 text-center text-xs text-gray-400">
          {isMac ? "⌘↵" : "Ctrl+↵"} to submit &nbsp;·&nbsp; Your key stays in your browser
        </p>

      </div>
    </main>
  );
}
