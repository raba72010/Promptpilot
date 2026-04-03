import { CheckCircle2, Sparkles, Zap } from "lucide-react";
import type { ToolRecommendation, IntentResult } from "@/lib/prompt-engine";
import { cn } from "@/lib/utils";

const CONFIDENCE_CONFIG = {
  low:    { label: "Low confidence",    cls: "bg-amber-100 text-amber-700 border-amber-200",  dot: "bg-amber-400" },
  medium: { label: "Medium confidence", cls: "bg-blue-100 text-blue-700 border-blue-200",    dot: "bg-blue-400" },
  high:   { label: "High confidence",   cls: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
};

interface DecisionSummaryProps {
  intent: IntentResult;
  recommendation: ToolRecommendation;
  providerLabel?: string;
}

export function DecisionSummary({ intent, recommendation, providerLabel }: DecisionSummaryProps) {
  const conf = CONFIDENCE_CONFIG[recommendation.confidence];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary tool chip */}
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-1.5 text-sm font-semibold text-white">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            {recommendation.primaryTool}
          </span>
          {/* Confidence */}
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", conf.cls)}>
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", conf.dot)} />
            {conf.label}
          </span>
        </div>

        {/* Provider badge */}
        {providerLabel && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 shrink-0">
            <Sparkles className="h-3 w-3" />
            via {providerLabel}
          </div>
        )}
      </div>

      {/* Alternative */}
      {recommendation.alternativeTool && (
        <p className="mb-3 text-xs text-gray-400">
          Also works in:{" "}
          <span className="font-medium text-gray-500 bg-gray-100 rounded-md px-1.5 py-0.5">
            {recommendation.alternativeTool}
          </span>
        </p>
      )}

      {/* Reasoning bullets */}
      <div className="space-y-2">
        {recommendation.reasoning.map((reason, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" />
            <p className="text-sm text-gray-600 leading-relaxed">{reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
