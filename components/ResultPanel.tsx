"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Copy, Check, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecisionSummary } from "@/components/DecisionSummary";
import { PromptCard } from "@/components/PromptCard";
import { SecondaryCard } from "@/components/SecondaryCard";
import type { EngineOutput } from "@/lib/prompt-engine";

const INTENT_HEADERS: Record<string, string> = {
  coding: "Your coding prompt is ready",
  writing: "Your writing prompt is ready",
  research: "Your research prompt is ready",
  image: "Your image prompt is ready",
  video: "Your video prompt is ready",
  system_prompt: "Your system prompt is ready",
  agent_instructions: "Your agent instructions are ready",
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

  // Scroll to top when result loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function toggleCheck(i: number) {
    setCheckedItems((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  function copyAll() {
    const sections: string[] = [`=== Your Optimized Prompt ===\n${optimizedPrompt}`];
    if (systemInstructions) sections.push(`=== System Instructions ===\n${systemInstructions}`);
    if (outputFormat) sections.push(`=== Output Format ===\n${outputFormat}`);
    if (alternativeVersion) sections.push(`=== Alternative Version (${recommendation.alternativeTool}) ===\n${alternativeVersion}`);
    navigator.clipboard.writeText(sections.join("\n\n")).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  }

  const header = INTENT_HEADERS[intent.intent] ?? "Your prompt is ready";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 space-y-4 fade-in">

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{header}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paste into{" "}
            <span className="font-medium text-gray-700">{recommendation.primaryTool}</span>
            {" "}and go.
          </p>
        </div>
        <button
          onClick={copyAll}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
          aria-label="Copy everything"
        >
          {copiedAll ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedAll ? "Copied!" : "Copy all"}
        </button>
      </div>

      {/* 1. Decision summary */}
      <DecisionSummary intent={intent} recommendation={recommendation} providerLabel={providerLabel} />

      {/* 2. Main prompt */}
      <PromptCard prompt={optimizedPrompt} />

      {/* 3. Secondary sections */}
      {systemInstructions && (
        <SecondaryCard title="System Instructions" content={systemInstructions} />
      )}
      {outputFormat && (
        <SecondaryCard title="Output Format" content={outputFormat} />
      )}
      {contextNotes && (
        <SecondaryCard title="Context Notes" content={contextNotes} copyable={false} />
      )}

      {/* 4. Quality checklist — interactive */}
      {qualityChecklist.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Quality Checklist
            </h3>
            <span className="text-xs text-gray-400 tabular-nums">
              {checkedCount}/{qualityChecklist.length}
            </span>
          </div>
          <ul className="space-y-2">
            {qualityChecklist.map((item, i) => (
              <li key={i}>
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={!!checkedItems[i]}
                    onChange={() => toggleCheck(i)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-gray-900 cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${checkedItems[i] ? "text-gray-400 line-through" : "text-gray-600 group-hover:text-gray-900"}`}>
                    {item}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {checkedCount === qualityChecklist.length && checkedCount > 0 && (
            <p className="mt-3 text-xs text-green-600 font-medium flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              All checks passed — your prompt is ready to use!
            </p>
          )}
        </div>
      )}

      {/* 5. Alternative version */}
      {alternativeVersion && recommendation.alternativeTool && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
            Alternative — {recommendation.alternativeTool}
          </p>
          <PromptCard prompt={alternativeVersion} title={`For ${recommendation.alternativeTool}`} />
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onStartOver} className="text-gray-500 hover:text-gray-900 gap-2">
          <RotateCcw className="h-4 w-4" />
          Start over
        </Button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none"
          aria-label="Back to top"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          Top
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-6 text-center">
        <p className="text-xs text-gray-400">
          PromptPilot · Your key stays in your browser · No data stored
        </p>
      </div>
    </div>
  );
}
