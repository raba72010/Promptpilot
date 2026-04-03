"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Sparkles, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolSelector } from "@/components/ToolSelector";
import { OutputTypeSelector } from "@/components/OutputTypeSelector";
import { FileUpload } from "@/components/FileUpload";
import type { UserInput, ToolOverride, OutputTypeOverride } from "@/lib/prompt-engine";
import type { ProviderConfig } from "@/components/ProviderSettings";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Build a Next.js SaaS app with auth, Stripe, and a dashboard",
  "Write a cold outreach email for a B2B software product",
  "Generate a photorealistic image of a futuristic city at dusk",
  "Create a system prompt for a customer support AI agent",
  "Research and compare the top 5 vector databases for production use",
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
      setError("Open Settings (top right) and add your API key first.");
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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 fade-in">
      <div className="w-full max-w-2xl">

        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">PromptPilot</span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-[52px] font-semibold text-gray-900 tracking-tight leading-[1.15]">
            Perfect your AI request
            <br />
            <span className="text-gray-400">before you hit send</span>
          </h1>
          <p className="mt-4 text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
            Describe your goal. Get an optimized prompt and the right AI tool — instantly.
          </p>
        </div>

        {/* API key nudge */}
        {!hasApiKey && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
            <span>
              Open <strong>Settings ⚙</strong> (top right) to add a free API key and get started.
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={idea}
              onChange={(e) => {
                setIdea(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Build an app, generate an image, write content, create a system prompt…"
              className={cn(
                "min-h-[160px] text-base leading-relaxed shadow-sm pb-8",
                charOver && "border-red-300 focus-visible:ring-red-400"
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
            {/* Character counter */}
            <div className={cn(
              "absolute bottom-3 right-3 text-xs tabular-nums pointer-events-none",
              charOver ? "text-red-500 font-medium" : "text-gray-300"
            )}>
              {charCount > 0 && `${charCount}/${MAX_CHARS}`}
            </div>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
          )}

          {/* Example chips */}
          {!idea && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Try an example:</p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => handleExample(ex)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900 transition-colors text-left"
                  >
                    {ex.length > 48 ? ex.slice(0, 48) + "…" : ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controls row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ToolSelector value={toolOverride} onChange={setToolOverride} />
            <OutputTypeSelector value={outputTypeOverride} onChange={setOutputTypeOverride} />
            <button
              type="button"
              onClick={() => setContextOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 h-9"
              aria-expanded={contextOpen}
            >
              {contextOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Context
            </button>
            <FileUpload onFileLoad={(c, n) => { setFileContent(c); setFileName(n); }} onFileRemove={() => { setFileContent(null); setFileName(null); }} currentFile={fileName ? { name: fileName } : null} />

            {/* Active provider pill */}
            {hasApiKey && (
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                {activeProviderLabel}
              </span>
            )}
          </div>

          {/* Context */}
          {contextOpen && (
            <div className="mt-3">
              <Textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="Paste background info, constraints, style notes, or technical details…"
                className="min-h-[96px] text-sm"
                aria-label="Optional context"
                disabled={isLoading}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                More context = more accurate prompt. You can also upload a file.
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full h-13 text-base font-semibold shadow-sm gap-2 rounded-xl"
            disabled={isLoading || charOver}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Optimizing your request…</>
            ) : (
              <><Sparkles className="h-4 w-4" />Perfect My Request</>
            )}
          </Button>

          {submitError && (
            <p className="mt-3 text-center text-sm text-red-600" role="alert">{submitError}</p>
          )}

          <p className="mt-3 text-center text-xs text-gray-400">
            {isMac ? "⌘↵" : "Ctrl+↵"} to submit
          </p>
        </form>
      </div>
    </main>
  );
}
