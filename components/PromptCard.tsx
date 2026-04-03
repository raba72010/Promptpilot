import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  prompt: string;
  title?: string;
  intentClass?: string;
}

export function PromptCard({ prompt, title = "Your Optimized Prompt", intentClass }: PromptCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className={cn(
        "flex items-center justify-between px-5 py-3 border-b",
        intentClass ? "border-gray-100" : "border-gray-100"
      )}
        style={intentClass ? {
          background: "var(--intent-bg, #f9fafb)",
          borderColor: "var(--intent-border, #e5e7eb)"
        } : { background: "#f9fafb" }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={intentClass ? { color: "var(--intent-text, #374151)" } : { color: "#6b7280" }}
        >
          {title}
        </h2>
        <CopyButton text={prompt} />
      </div>

      {/* Content */}
      <div className="p-5">
        <div
          className="whitespace-pre-wrap text-[13px] leading-[1.75] text-gray-700 font-mono bg-gray-50 rounded-xl p-4 overflow-x-auto border border-gray-100"
        >
          {prompt}
        </div>
      </div>
    </div>
  );
}
