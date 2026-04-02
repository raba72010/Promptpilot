import { CopyButton } from "@/components/CopyButton";

interface PromptCardProps {
  prompt: string;
  title?: string;
}

export function PromptCard({ prompt, title = "Your Optimized Prompt" }: PromptCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <CopyButton text={prompt} />
      </div>
      <div
        className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-mono bg-gray-50 rounded-xl p-4 overflow-x-auto"
        style={{ fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace" }}
      >
        {prompt}
      </div>
    </div>
  );
}
