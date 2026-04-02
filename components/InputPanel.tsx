"use client";

import { useState, useRef } from "react";
import { ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolSelector } from "@/components/ToolSelector";
import { OutputTypeSelector } from "@/components/OutputTypeSelector";
import { FileUpload } from "@/components/FileUpload";
import type { UserInput, ToolOverride, OutputTypeOverride } from "@/lib/prompt-engine";

interface InputPanelProps {
  onSubmit: (input: UserInput) => void;
  isLoading: boolean;
  submitError?: string | null;
}

export function InputPanel({ onSubmit, isLoading, submitError }: InputPanelProps) {
  const [idea, setIdea] = useState("");
  const [toolOverride, setToolOverride] = useState<ToolOverride>("auto");
  const [outputTypeOverride, setOutputTypeOverride] = useState<OutputTypeOverride>("auto");
  const [contextText, setContextText] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim()) {
      setError("Please describe what you want to create.");
      textareaRef.current?.focus();
      return;
    }
    setError(null);
    onSubmit({
      rawIdea: idea.trim(),
      contextText: contextText.trim(),
      fileContent,
      fileName,
      toolOverride,
      outputTypeOverride,
    });
  }

  function handleFileLoad(content: string, name: string) {
    setFileContent(content);
    setFileName(name);
  }

  function handleFileRemove() {
    setFileContent(null);
    setFileName(null);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight leading-tight">
            Perfect your AI request
            <br className="hidden sm:block" />
            <span className="text-gray-500"> before you use the model</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed max-w-md mx-auto">
            Describe what you want once.
            <br />
            Get the best prompt and tool.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Main Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={idea}
              onChange={(e) => {
                setIdea(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Build an app, generate an image, write content, or create a system prompt…"
              className="min-h-[160px] text-base leading-relaxed pr-4 shadow-sm"
              aria-label="Describe your idea"
              aria-invalid={!!error}
              aria-describedby={error ? "idea-error" : undefined}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
            />
          </div>

          {error && (
            <p id="idea-error" className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Optional Controls Row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ToolSelector value={toolOverride} onChange={setToolOverride} />
            <OutputTypeSelector value={outputTypeOverride} onChange={setOutputTypeOverride} />
            <button
              type="button"
              onClick={() => setContextOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 h-9"
              aria-expanded={contextOpen}
              aria-controls="context-area"
            >
              {contextOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              <span>Add context</span>
            </button>
            <FileUpload
              onFileLoad={handleFileLoad}
              onFileRemove={handleFileRemove}
              currentFile={fileName ? { name: fileName } : null}
            />
          </div>

          {/* Context Textarea */}
          {contextOpen && (
            <div id="context-area" className="mt-3">
              <Textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="Paste any relevant context — background info, constraints, style notes, technical details…"
                className="min-h-[100px] text-sm text-gray-700"
                aria-label="Optional context"
                disabled={isLoading}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Additional context improves accuracy. You can also upload a file above.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full h-12 text-base font-medium shadow-sm gap-2"
            disabled={isLoading || !idea.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimizing your request…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Perfect My Request
              </>
            )}
          </Button>

          {submitError && (
            <p className="mt-3 text-center text-sm text-red-600" role="alert">
              {submitError}
            </p>
          )}

          <p className="mt-3 text-center text-xs text-gray-400">
            Press{" "}
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-500">
              ⌘↵
            </kbd>{" "}
            to submit
          </p>
        </form>
      </div>
    </main>
  );
}
