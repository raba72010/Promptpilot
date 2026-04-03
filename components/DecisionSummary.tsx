import { Check } from "lucide-react";
import type { ToolRecommendation, IntentResult } from "@/lib/prompt-engine";
import { cn } from "@/lib/utils";

const CONFIDENCE_CONFIG = {
  low:    { label: "Low confidence",    bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  medium: { label: "Medium confidence", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  high:   { label: "High confidence",   bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
};

interface DecisionSummaryProps {
  intent: IntentResult;
  recommendation: ToolRecommendation;
  providerLabel?: string;
}

export function DecisionSummary({ recommendation }: DecisionSummaryProps) {
  const conf = CONFIDENCE_CONFIG[recommendation.confidence];

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)"
      }}
    >

      {/* Tool row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Primary tool — amber stamp */}
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold"
          style={{
            background: "var(--brand)",
            color: "#fff",
            letterSpacing: "-0.01em"
          }}
        >
          {recommendation.primaryTool}
        </span>

        {/* Confidence */}
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
          style={{ background: conf.bg, color: conf.text, borderColor: conf.border }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: conf.text }}
          />
          {conf.label}
        </span>

        {/* Alt tool */}
        {recommendation.alternativeTool && (
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs"
            style={{
              background: "var(--bg-subtle)",
              color: "var(--fg-muted)",
              border: "1px solid var(--border)"
            }}
          >
            Also: {recommendation.alternativeTool}
          </span>
        )}
      </div>

      {/* Reasoning */}
      <div className="space-y-2.5">
        {recommendation.reasoning.map((reason, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Check
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              style={{ color: "var(--brand)" }}
            />
            <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
