"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Copy, Check, ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecisionSummary } from "@/components/DecisionSummary";
import { PromptCard } from "@/components/PromptCard";
import { SecondaryCard } from "@/components/SecondaryCard";
import type { EngineOutput } from "@/lib/prompt-engine";
import { cn } from "@/lib/utils";

interface IntentMeta {
  label: string;
  header: string;
  emoji: string;
  colorClass: string;
}

const INTENT_META: Record<string, IntentMeta> = {
  coding:      { label: "Code",             header: "Your coding prompt is ready",           emoji: "⌨️", colorClass: "intent-coding" },
  writing:     { label: "Writing",          header: "Your writing prompt is ready",          emoji: "✍️", colorClass: "intent-writing" },
  research:    { label: "Research",         header: "Your research prompt is ready",         emoji: "🔍", colorClass: "intent-research" },
  image:       { label: "Image",            header: "Your image prompt is ready",            emoji: "🎨", colorClass: "intent-image" },
  video:       { label: "Video",            header: "Your video prompt is ready",            emoji: "🎬", colorClass: "intent-video" },
  system_prompt: { label: "System Prompt", header: "Your system prompt is ready",           emoji: "🤖", colorClass: "intent-system_prompt" },
  agent_instructions: { label: "Agent",    header: "Your agent instructions are ready",     emoji: "🧠", colorClass: "intent-agent_instructions" },
};

interface ResultPanelProps {
  output: EngineOutput;
  providerLabel: string;
  onStartOver: () => void;
}

export function ResultPanel({ output, providerLabel, onStartOver }: ResultPanelProps) {
  const { intent, recommendation, promptPack } = output;
  const { optimizedPrompt, systemInstructions, outputFormat, contextNotes, qualityChecklist, alternativeVersion } = promptPack;

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [copiedAll, setCopiedAll] = useState(false);

  const meta = INTENT_META[intent.intent] ?? { label: intent.intent, header: "Your prompt is ready", emoji: "✨", colorClass: "" };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function toggleCheck(i: number) {
    setCheckedItems((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const allChecked = checkedCount === qualityChecklist.length && qualityChecklist.length > 0;

  function copyAll() {
    const sections: string[] = [`=== Your Optimized Prompt ===\n${optimizedPrompt}`];
    if (systemInstructions) sections.push(`=== System Instructions ===\n${systemInstructions}`);
    if (outputFormat) sections.push(`=== Output Format ===\n${outputFormat}`);
    if (alternativeVersion) sections.push(`=== Alternative (${recommendation.alternativeTool}) ===\n${alternativeVersion}`);
    navigator.clipboard.writeText(sections.join("\n\n")).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  }

  return (
    <div className="page-bg min-h-screen">
      <div className="w-full max-w-2xl mx-auto px-4 py-10 space-y-4 fade-in">

        {/* ── Intent banner ── */}
        <div className={cn(
          "rounded-3xl p-5 flex items-center justify-between gap-4",
          meta.colorClass
        )}
          style={{ background: "var(--intent-bg)", border: "1px solid var(--intent-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
              style={{ background: "rgba(255,255,255,0.7)" }}
            >
              {meta.emoji}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--intent-text)", opacity: 0.7 }}>
                {meta.label}
              </p>
              <h1 className="text-lg font-semibold leading-tight" style={{ color: "var(--intent-text)" }}>
                {meta.header}
              </h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyAll}
              className="inline-flex items-center gap-1.5 rounded-xl border bg-white/60 backdrop-blur-sm px-3 py-2 text-xs font-medium transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              style={{ borderColor: "var(--intent-border)", color: "var(--intent-text)" }}
              aria-label="Copy everything"
            >
              {copiedAll ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedAll ? "Copied!" : "Copy all"}
            </button>
          </div>
        </div>

        {/* ── Used AI provider chip ── */}
        <div className="flex items-center gap-2 px-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            <Sparkles className="h-3 w-3" />
            Enhanced via {providerLabel}
          </div>
          <span className="text-xs text-gray-400">
            Paste into <span className="font-medium text-gray-600">{recommendation.primaryTool}</span> to use
          </span>
        </div>

        {/* ── Decision summary ── */}
        <DecisionSummary intent={intent} recommendation={recommendation} providerLabel={providerLabel} />

        {/* ── Main prompt ── */}
        <PromptCard prompt={optimizedPrompt} intentClass={meta.colorClass} />

        {/* ── Secondary sections ── */}
        {systemInstructions && <SecondaryCard title="System Instructions" content={systemInstructions} />}
        {outputFormat && <SecondaryCard title="Output Format" content={outputFormat} />}
        {contextNotes && <SecondaryCard title="Context Notes" content={contextNotes} copyable={false} />}

        {/* ── Quality checklist ── */}
        {qualityChecklist.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Quality Checklist</h3>
                <p className="text-xs text-gray-400 mt-0.5">Work through these before you submit</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Progress ring–style pill */}
                <span className={cn(
                  "text-xs font-semibold tabular-nums rounded-full px-2.5 py-0.5",
                  allChecked
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                )}>
                  {checkedCount}/{qualityChecklist.length}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-gray-100 mb-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${qualityChecklist.length > 0 ? (checkedCount / qualityChecklist.length) * 100 : 0}%`,
                  background: allChecked
                    ? "linear-gradient(90deg, #10b981, #059669)"
                    : "linear-gradient(90deg, #8b5cf6, #6366f1)"
                }}
              />
            </div>

            <ul className="space-y-2.5">
              {qualityChecklist.map((item, i) => (
                <li key={i}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!checkedItems[i]}
                      onChange={() => toggleCheck(i)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-violet-600 cursor-pointer"
                    />
                    <span className={cn(
                      "text-sm leading-relaxed transition-colors",
                      checkedItems[i]
                        ? "text-gray-350 line-through text-gray-400"
                        : "text-gray-600 group-hover:text-gray-900"
                    )}>
                      {item}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            {allChecked && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 py-2 fade-in-fast">
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <p className="text-xs text-green-700 font-medium">All checks passed — your prompt is ready to use!</p>
              </div>
            )}
          </div>
        )}

        {/* ── Alternative version ── */}
        {alternativeVersion && recommendation.alternativeTool && (
          <div className="scale-in">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
              Alternative · {recommendation.alternativeTool}
            </p>
            <PromptCard prompt={alternativeVersion} title={`For ${recommendation.alternativeTool}`} />
          </div>
        )}

        {/* ── Actions ── */}
        <div className="pt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onStartOver}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 gap-2 rounded-xl"
          >
            <RotateCcw className="h-4 w-4" />
            Start over
          </Button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none rounded-lg p-1"
            aria-label="Back to top"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Top
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 pt-6 text-center pb-4">
          <p className="text-xs text-gray-400">
            PromptPilot · Your key stays in your browser · No data stored
          </p>
        </div>

      </div>
    </div>
  );
}
