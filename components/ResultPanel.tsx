"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Copy, Check, ArrowUp } from "lucide-react";
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
  coding:             { label: "Code",          header: "Your coding prompt is ready",        emoji: "⌨️",  colorClass: "intent-coding" },
  writing:            { label: "Writing",        header: "Your writing prompt is ready",       emoji: "✍️",  colorClass: "intent-writing" },
  research:           { label: "Research",       header: "Your research prompt is ready",      emoji: "🔍",  colorClass: "intent-research" },
  image:              { label: "Image",          header: "Your image prompt is ready",         emoji: "🎨",  colorClass: "intent-image" },
  video:              { label: "Video",          header: "Your video prompt is ready",         emoji: "🎬",  colorClass: "intent-video" },
  system_prompt:      { label: "System Prompt",  header: "Your system prompt is ready",        emoji: "🤖",  colorClass: "intent-system_prompt" },
  agent_instructions: { label: "Agent",          header: "Your agent instructions are ready",  emoji: "🧠",  colorClass: "intent-agent_instructions" },
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
  const allChecked   = checkedCount === qualityChecklist.length && qualityChecklist.length > 0;

  function copyAll() {
    const sections: string[] = [`=== Your Optimized Prompt ===\n${optimizedPrompt}`];
    if (systemInstructions) sections.push(`=== System Instructions ===\n${systemInstructions}`);
    if (outputFormat)       sections.push(`=== Output Format ===\n${outputFormat}`);
    if (alternativeVersion) sections.push(`=== Alternative (${recommendation.alternativeTool}) ===\n${alternativeVersion}`);
    navigator.clipboard.writeText(sections.join("\n\n")).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  }

  return (
    <div className="page-bg min-h-screen">
      <div className="w-full max-w-2xl mx-auto px-4 py-10 space-y-4 fade-in">

        {/* ── Intent header ── */}
        <div
          className={cn("rounded-2xl p-5", meta.colorClass)}
          style={{
            background: "var(--intent-bg)",
            border: "1px solid var(--intent-border)",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--intent-border)" }}
              >
                {meta.emoji}
              </div>
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-0.5"
                  style={{ color: "var(--intent-text)", opacity: 0.6 }}
                >
                  {meta.label}
                </p>
                <h1
                  className="text-lg font-semibold leading-tight"
                  style={{ color: "var(--intent-text)" }}
                >
                  {meta.header}
                </h1>
              </div>
            </div>
            <button
              onClick={copyAll}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2"
              style={{
                background: "rgba(255,255,255,0.7)",
                borderColor: "var(--intent-border)",
                color: "var(--intent-text)"
              }}
            >
              {copiedAll ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedAll ? "Copied!" : "Copy all"}
            </button>
          </div>

          {/* Provenance line */}
          <p
            className="mt-3 text-xs"
            style={{ color: "var(--intent-text)", opacity: 0.55 }}
          >
            Enhanced by <strong style={{ opacity: 0.9 }}>{providerLabel}</strong>
            {" · "}Paste into <strong style={{ opacity: 0.9 }}>{recommendation.primaryTool}</strong> to use
          </p>
        </div>

        {/* ── Decision summary ── */}
        <DecisionSummary intent={intent} recommendation={recommendation} providerLabel={providerLabel} />

        {/* ── Main prompt ── */}
        <PromptCard prompt={optimizedPrompt} intentClass={meta.colorClass} />

        {/* ── Secondary sections ── */}
        {systemInstructions && <SecondaryCard title="System Instructions" content={systemInstructions} />}
        {outputFormat       && <SecondaryCard title="Output Format"       content={outputFormat} />}
        {contextNotes       && <SecondaryCard title="Context Notes"       content={contextNotes} copyable={false} />}

        {/* ── Quality checklist ── */}
        {qualityChecklist.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)"
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--fg-faint)" }}
                >
                  Quality Checklist
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--fg-faint)" }}>
                  Review before you submit
                </p>
              </div>
              <span
                className="text-xs font-semibold tabular-nums rounded-md px-2 py-0.5"
                style={{
                  background: allChecked ? "#d1fae5" : "var(--bg-subtle)",
                  color: allChecked ? "#065f46" : "var(--fg-muted)",
                }}
              >
                {checkedCount}/{qualityChecklist.length}
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="h-1 rounded-full mb-4 overflow-hidden"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${qualityChecklist.length > 0 ? (checkedCount / qualityChecklist.length) * 100 : 0}%`,
                  background: allChecked ? "#10b981" : "var(--brand)",
                }}
              />
            </div>

            <ul className="space-y-3">
              {qualityChecklist.map((item, i) => (
                <li key={i}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!checkedItems[i]}
                      onChange={() => toggleCheck(i)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded cursor-pointer"
                      style={{ accentColor: "var(--brand)" }}
                    />
                    <span
                      className={cn(
                        "text-sm leading-relaxed transition-colors",
                        checkedItems[i] ? "line-through" : ""
                      )}
                      style={{
                        color: checkedItems[i] ? "var(--fg-faint)" : "var(--fg-default)"
                      }}
                    >
                      {item}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            {allChecked && (
              <div
                className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 fade-in-fast"
                style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}
              >
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">
                  All checks passed — your prompt is ready to use.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Alternative version ── */}
        {alternativeVersion && recommendation.alternativeTool && (
          <div className="scale-in">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
              style={{ color: "var(--fg-faint)" }}
            >
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
            className="gap-2 rounded-xl"
            style={{ color: "var(--fg-muted)" }}
          >
            <RotateCcw className="h-4 w-4" />
            Start over
          </Button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 text-xs transition-colors focus-visible:outline-none rounded-lg p-1"
            style={{ color: "var(--fg-faint)" }}
            aria-label="Back to top"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Top
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="pt-4 pb-4 text-center" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--fg-faint)" }}>
            PromptPilot · Your key stays in your browser · No data stored
          </p>
        </div>

      </div>
    </div>
  );
}
