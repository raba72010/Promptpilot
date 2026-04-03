import { CopyButton } from "@/components/CopyButton";

interface PromptCardProps {
  prompt: string;
  title?: string;
  intentClass?: string;
}

export function PromptCard({ prompt, title = "Your Optimized Prompt", intentClass }: PromptCardProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)"
      }}
    >
      {/* Header */}
      <div
        className={intentClass ?? ""}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: intentClass ? "var(--intent-bg)" : "var(--bg-subtle)",
          borderBottom: "1px solid",
          borderColor: intentClass ? "var(--intent-border)" : "var(--border)",
        }}
      >
        <h2
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: intentClass ? "var(--intent-text)" : "var(--fg-faint)" }}
        >
          {title}
        </h2>
        <CopyButton text={prompt} />
      </div>

      {/* Prompt content */}
      <div className="p-4">
        <pre
          className="whitespace-pre-wrap text-[13px] leading-[1.8] overflow-x-auto rounded-xl p-4"
          style={{
            fontFamily: "var(--font-geist-mono), 'Fira Code', 'Cascadia Code', monospace",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            color: "var(--fg-default)",
          }}
        >
          {prompt}
        </pre>
      </div>
    </div>
  );
}
