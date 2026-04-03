"use client";

import { useEffect, useState, useRef } from "react";
import { RotateCcw, Copy, Check, ArrowUp, Pencil, X, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecisionSummary } from "@/components/DecisionSummary";
import { SecondaryCard } from "@/components/SecondaryCard";
import { CopyButton } from "@/components/CopyButton";
import type { EngineOutput } from "@/lib/prompt-engine";
import { TOOL_URLS, estimateTokens } from "@/lib/tool-urls";
import { cn } from "@/lib/utils";

interface IntentMeta {
  label: string;
  header: string;
  emoji: string;
  colorClass: string;
}

const INTENT_META: Record<string, IntentMeta> = {
  coding:             { label: "Code",         header: "Your coding prompt is ready",       emoji: "⌨️", colorClass: "intent-coding" },
  writing:            { label: "Writing",       header: "Your writing prompt is ready",      emoji: "✍️", colorClass: "intent-writing" },
  research:           { label: "Research",      header: "Your research prompt is ready",     emoji: "🔍", colorClass: "intent-research" },
  image:              { label: "Image",         header: "Your image prompt is ready",        emoji: "🎨", colorClass: "intent-image" },
  video:              { label: "Video",         header: "Your video prompt is ready",        emoji: "🎬", colorClass: "intent-video" },
  system_prompt:      { label: "System Prompt", header: "Your system prompt is ready",       emoji: "🤖", colorClass: "intent-system_prompt" },
  agent_instructions: { label: "Agent",         header: "Your agent instructions are ready", emoji: "🧠", colorClass: "intent-agent_instructions" },
};

interface ResultPanelProps {
  output: EngineOutput;
  providerLabel: string;
  onStartOver: () => void;
  onRegenerate?: () => void;
  streaming?: boolean;
}

export function ResultPanel({ output, providerLabel, onStartOver, onRegenerate, streaming = false }: ResultPanelProps) {
  const { intent, recommendation, promptPack } = output;
  const { optimizedPrompt, systemInstructions, outputFormat, contextNotes, qualityChecklist, alternativeVersion } = promptPack;

  const [checkedItems, setCheckedItems]   = useState<Record<number, boolean>>({});
  const [copiedAll, setCopiedAll]         = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [editedText, setEditedText]       = useState(optimizedPrompt);
  const [displayPrompt, setDisplayPrompt] = useState(optimizedPrompt);
  const [openedTool, setOpenedTool]       = useState(false);

  const promptEndRef  = useRef<HTMLDivElement>(null);
  const editareaRef   = useRef<HTMLTextAreaElement>(null);

  const meta    = INTENT_META[intent.intent] ?? { label: intent.intent, header: "Your prompt is ready", emoji: "✨", colorClass: "" };
  const toolUrl = TOOL_URLS[recommendation.primaryTool] ?? null;
  const tokens  = estimateTokens(displayPrompt);

  // Scroll to top on first load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Auto-scroll prompt as tokens stream in
  useEffect(() => {
    if (streaming) {
      promptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [optimizedPrompt, streaming]);

  // Stagger-reveal secondary sections once streaming finishes
  useEffect(() => {
    if (!streaming) {
      const t = setTimeout(() => setSectionsVisible(true), 150);
      return () => clearTimeout(t);
    }
    setSectionsVisible(false);
  }, [streaming]);

  // Sync display prompt when new output arrives
  useEffect(() => {
    setDisplayPrompt(optimizedPrompt);
    setEditedText(optimizedPrompt);
    setEditingPrompt(false);
  }, [optimizedPrompt]);

  // Auto-resize edit textarea
  useEffect(() => {
    if (editingPrompt && editareaRef.current) {
      editareaRef.current.focus();
      const el = editareaRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [editingPrompt]);

  function startEdit() {
    setEditedText(displayPrompt);
    setEditingPrompt(true);
  }

  function saveEdit() {
    setDisplayPrompt(editedText);
    setEditingPrompt(false);
  }

  function cancelEdit() {
    setEditedText(displayPrompt);
    setEditingPrompt(false);
  }

  function toggleCheck(i: number) {
    setCheckedItems((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const allChecked   = checkedCount === qualityChecklist.length && qualityChecklist.length > 0;

  function openInTool() {
    if (!toolUrl) return;
    navigator.clipboard.writeText(displayPrompt).catch(() => {});
    setOpenedTool(true);
    setTimeout(() => setOpenedTool(false), 3000);
    window.open(toolUrl, "_blank", "noopener,noreferrer");
  }

  function copyAll() {
    const sections: string[] = [`=== Your Optimized Prompt ===\n${displayPrompt}`];
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

        {/* ── Intent banner ── */}
        <div
          className={cn("rounded-2xl p-5", meta.colorClass)}
          style={{ background: "var(--intent-bg)", border: "1px solid var(--intent-border)" }}
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
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--intent-text)", opacity: 0.6 }}>
                  {meta.label}
                </p>
                <h1 className="text-lg font-semibold leading-tight" style={{ color: "var(--intent-text)" }}>
                  {streaming ? (
                    <span className="inline-flex items-center gap-2">
                      <span>Writing your prompt</span>
                      <span className="inline-flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="h-1.5 w-1.5 rounded-full inline-block"
                            style={{ background: "var(--intent-text)", opacity: 0.5, animation: `bounce-dot 1.2s ${i * 0.2}s infinite` }} />
                        ))}
                      </span>
                    </span>
                  ) : meta.header}
                </h1>
              </div>
            </div>
            {!streaming && (
              <button onClick={copyAll}
                className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors shrink-0"
                style={{ background: "rgba(255,255,255,0.7)", borderColor: "var(--intent-border)", color: "var(--intent-text)" }}
              >
                {copiedAll ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedAll ? "Copied!" : "Copy all"}
              </button>
            )}
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--intent-text)", opacity: 0.55 }}>
            {streaming
              ? `Generating via ${providerLabel}…`
              : <>Enhanced by <strong style={{ opacity: 0.9 }}>{providerLabel}</strong>{" · "}Paste into <strong style={{ opacity: 0.9 }}>{recommendation.primaryTool}</strong></>
            }
          </p>
        </div>

        {/* ── Decision summary ── */}
        <DecisionSummary intent={intent} recommendation={recommendation} providerLabel={providerLabel} />

        {/* ── Main prompt card ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          {/* Header */}
          <div className={cn(meta.colorClass)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px",
            background: meta.colorClass ? "var(--intent-bg)" : "var(--bg-subtle)",
            borderBottom: "1px solid",
            borderColor: meta.colorClass ? "var(--intent-border)" : "var(--border)"
          }}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: meta.colorClass ? "var(--intent-text)" : "var(--fg-faint)" }}>
              {streaming ? "Generating…" : "Optimized Prompt"}
            </h2>
            {!streaming && !editingPrompt && (
              <div className="flex items-center gap-1.5">
                {/* Token count */}
                <span className="text-[10px] tabular-nums rounded-md px-2 py-0.5"
                  style={{ background: "rgba(0,0,0,0.05)", color: "var(--fg-faint)" }}>
                  ~{tokens} tokens
                </span>
                <button onClick={startEdit}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors"
                  style={{ color: meta.colorClass ? "var(--intent-text)" : "var(--fg-muted)", opacity: 0.7 }}
                  title="Edit prompt"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <CopyButton text={displayPrompt} />
              </div>
            )}
            {editingPrompt && (
              <div className="flex items-center gap-1.5">
                <button onClick={saveEdit}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white transition-colors"
                  style={{ background: "var(--brand)" }}>
                  <Check className="h-3 w-3" /> Save
                </button>
                <button onClick={cancelEdit}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px]"
                  style={{ color: "var(--fg-muted)" }}>
                  <X className="h-3 w-3" /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Prompt body */}
          <div className="p-4">
            {editingPrompt ? (
              <div>
                <textarea
                  ref={editareaRef}
                  value={editedText}
                  onChange={(e) => {
                    setEditedText(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  className="w-full rounded-xl p-4 text-[13px] leading-[1.8] resize-none focus:outline-none focus:ring-2"
                  style={{
                    fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--fg-strong)",
                    minHeight: "120px",
                    // @ts-expect-error custom property
                    "--tw-ring-color": "var(--brand)",
                  }}
                  spellCheck={false}
                />
                <p className="mt-1.5 text-xs" style={{ color: "var(--fg-faint)" }}>
                  ~{estimateTokens(editedText)} tokens · Changes stay in this session
                </p>
              </div>
            ) : (
              <pre
                className="whitespace-pre-wrap text-[13px] leading-[1.8] overflow-x-auto rounded-xl p-4"
                style={{
                  fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
                  background: "var(--bg-subtle)", border: "1px solid var(--border)",
                  color: "var(--fg-default)", minHeight: "80px",
                }}
              >
                {displayPrompt || (streaming ? "" : "(empty)")}
                {streaming && (
                  <span className="inline-block w-[2px] h-[1em] ml-0.5 align-middle"
                    style={{ background: "var(--brand)", animation: "blink-cursor 0.8s step-end infinite" }} />
                )}
              </pre>
            )}
            <div ref={promptEndRef} />
          </div>

          {/* Open in tool footer — only when not streaming */}
          {!streaming && toolUrl && (
            <div style={{ borderTop: "1px solid var(--border)", padding: "10px 16px", background: "var(--bg-subtle)" }}>
              <button onClick={openInTool}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold w-full justify-center transition-colors"
                style={{
                  background: openedTool ? "#d1fae5" : "var(--brand)",
                  color: openedTool ? "#065f46" : "#fff",
                  border: openedTool ? "1px solid #6ee7b7" : "1px solid var(--brand-hover)"
                }}
              >
                {openedTool ? (
                  <><Check className="h-3.5 w-3.5" />Prompt copied — {recommendation.primaryTool} is opening</>
                ) : (
                  <><ExternalLink className="h-3.5 w-3.5" />Open in {recommendation.primaryTool}</>
                )}
              </button>
              <p className="text-center text-[10px] mt-1.5" style={{ color: "var(--fg-faint)" }}>
                Copies your prompt to clipboard and opens {recommendation.primaryTool} in a new tab
              </p>
            </div>
          )}
        </div>

        {/* ── Secondary sections (staggered after streaming done) ── */}
        {sectionsVisible && (
          <>
            {systemInstructions && (
              <div className="fade-in" style={{ animationDelay: "0.05s" }}>
                <SecondaryCard title="System Instructions" content={systemInstructions} />
              </div>
            )}
            {outputFormat && (
              <div className="fade-in" style={{ animationDelay: "0.1s" }}>
                <SecondaryCard title="Output Format" content={outputFormat} />
              </div>
            )}
            {contextNotes && (
              <div className="fade-in" style={{ animationDelay: "0.15s" }}>
                <SecondaryCard title="Context Notes" content={contextNotes} copyable={false} />
              </div>
            )}

            {/* Quality checklist */}
            {qualityChecklist.length > 0 && (
              <div className="rounded-2xl p-5 fade-in" style={{ animationDelay: "0.2s", background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>Quality Checklist</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--fg-faint)" }}>Review before you submit</p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums rounded-md px-2 py-0.5"
                    style={{ background: allChecked ? "#d1fae5" : "var(--bg-subtle)", color: allChecked ? "#065f46" : "var(--fg-muted)" }}>
                    {checkedCount}/{qualityChecklist.length}
                  </span>
                </div>
                <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${qualityChecklist.length > 0 ? (checkedCount / qualityChecklist.length) * 100 : 0}%`, background: allChecked ? "#10b981" : "var(--brand)" }} />
                </div>
                <ul className="space-y-3">
                  {qualityChecklist.map((item, i) => (
                    <li key={i}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!checkedItems[i]} onChange={() => toggleCheck(i)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded cursor-pointer"
                          style={{ accentColor: "var(--brand)" }} />
                        <span className={cn("text-sm leading-relaxed transition-colors", checkedItems[i] ? "line-through" : "")}
                          style={{ color: checkedItems[i] ? "var(--fg-faint)" : "var(--fg-default)" }}>
                          {item}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                {allChecked && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 fade-in-fast" style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}>
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium">All checks passed — your prompt is ready to use.</p>
                  </div>
                )}
              </div>
            )}

            {/* Alternative version */}
            {alternativeVersion && recommendation.alternativeTool && (
              <div className="fade-in" style={{ animationDelay: "0.25s" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--fg-faint)" }}>
                  Alternative · {recommendation.alternativeTool}
                </p>
                <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                    <h2 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>
                      For {recommendation.alternativeTool}
                    </h2>
                    <CopyButton text={alternativeVersion} />
                  </div>
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap text-[13px] leading-[1.8] overflow-x-auto rounded-xl p-4"
                      style={{ fontFamily: "var(--font-geist-mono), monospace", background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--fg-default)" }}>
                      {alternativeVersion}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between gap-3 fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="ghost" onClick={onStartOver} className="gap-2 rounded-xl" style={{ color: "var(--fg-muted)" }}>
                <RotateCcw className="h-4 w-4" />
                Start over
              </Button>
              <div className="flex items-center gap-2">
                {onRegenerate && (
                  <button onClick={onRegenerate}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
                    style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--fg-muted)" }}
                    title="Re-run with the same input"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                )}
                <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="inline-flex items-center gap-1.5 text-xs transition-colors rounded-lg p-2"
                  style={{ color: "var(--fg-faint)" }}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-4 pb-4 text-center fade-in" style={{ animationDelay: "0.35s", borderTop: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--fg-faint)" }}>
                PromptPilot · Your key stays in your browser · No data stored
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
