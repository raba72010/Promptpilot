import { CopyButton } from "@/components/CopyButton";

interface SecondaryCardProps {
  title: string;
  content: string;
  copyable?: boolean;
  monospace?: boolean;
}

export function SecondaryCard({
  title,
  content,
  copyable = true,
  monospace = false,
}: SecondaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </h3>
        {copyable && <CopyButton text={content} />}
      </div>
      {monospace ? (
        <pre
          className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-mono bg-gray-50 rounded-xl p-4 overflow-x-auto"
          style={{ fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace" }}
        >
          {content}
        </pre>
      ) : (
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}
