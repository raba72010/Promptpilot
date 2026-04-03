import { CopyButton } from "@/components/CopyButton";

interface SecondaryCardProps {
  title: string;
  content: string;
  copyable?: boolean;
}

export function SecondaryCard({ title, content, copyable = true }: SecondaryCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>
          {title}
        </h3>
        {copyable && <CopyButton text={content} />}
      </div>
      <div className="p-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--fg-default)" }}>
          {content}
        </p>
      </div>
    </div>
  );
}
