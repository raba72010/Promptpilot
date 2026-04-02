"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecisionSummary } from "@/components/DecisionSummary";
import { PromptCard } from "@/components/PromptCard";
import { SecondaryCard } from "@/components/SecondaryCard";
import type { EngineOutput } from "@/lib/prompt-engine";

interface ResultPanelProps {
  output: EngineOutput;
  onStartOver: () => void;
}

export function ResultPanel({ output, onStartOver }: ResultPanelProps) {
  const { intent, recommendation, promptPack } = output;
  const {
    optimizedPrompt,
    systemInstructions,
    outputFormat,
    contextNotes,
    qualityChecklist,
    alternativeVersion,
  } = promptPack;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Your prompt is ready
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Copy the prompt below and paste it into{" "}
          <span className="font-medium text-gray-700">{recommendation.primaryTool}</span>.
        </p>
      </div>

      {/* 1. Decision Summary */}
      <DecisionSummary intent={intent} recommendation={recommendation} />

      {/* 2. Main Prompt */}
      <PromptCard prompt={optimizedPrompt} />

      {/* 3. Secondary sections */}
      {systemInstructions && (
        <SecondaryCard
          title="System Instructions"
          content={systemInstructions}
          monospace={false}
        />
      )}

      {outputFormat && (
        <SecondaryCard
          title="Output Format"
          content={outputFormat}
          monospace={false}
        />
      )}

      {contextNotes && (
        <SecondaryCard
          title="Context Notes"
          content={contextNotes}
          copyable={false}
          monospace={false}
        />
      )}

      {/* 4. Quality Checklist */}
      {qualityChecklist.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Quality Checklist
          </h3>
          <ul className="space-y-2">
            {qualityChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border border-gray-300 bg-white flex items-center justify-center"
                  aria-hidden="true"
                />
                <span className="text-sm text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Alternative Version */}
      {alternativeVersion && recommendation.alternativeTool && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Alternative Version
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Optimized for {recommendation.alternativeTool}
              </p>
            </div>
          </div>
          <PromptCard
            prompt={alternativeVersion}
            title={`For ${recommendation.alternativeTool}`}
          />
        </div>
      )}

      {/* 6. Start Over */}
      <div className="pt-4 flex justify-center">
        <Button
          variant="ghost"
          onClick={onStartOver}
          className="text-gray-500 hover:text-gray-900 gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Start over
        </Button>
      </div>
    </div>
  );
}
