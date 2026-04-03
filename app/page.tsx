"use client";

import { useState, useCallback } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { ProviderSettings } from "@/components/ProviderSettings";
import { getProvider } from "@/lib/providers";
import type { UserInput, EngineOutput, IntentResult, ToolRecommendation } from "@/lib/prompt-engine";
import type { ProviderConfig } from "@/components/ProviderSettings";

type AppState = "idle" | "analyzing" | "streaming" | "result" | "error";

interface PartialOutput {
  intent: IntentResult;
  recommendation: ToolRecommendation;
}

export default function Home() {
  const [state, setState]                   = useState<AppState>("idle");
  const [partialOutput, setPartialOutput]   = useState<PartialOutput | null>(null);
  const [streamedPrompt, setStreamedPrompt] = useState("");
  const [output, setOutput]                 = useState<EngineOutput | null>(null);
  const [providerLabel, setProviderLabel]   = useState("");
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
    providerId: "groq",
    apiKey: "",
  });

  const handleProviderChange = useCallback((config: ProviderConfig) => {
    setProviderConfig(config);
  }, []);

  const handleSubmit = useCallback(async (input: UserInput, provider: ProviderConfig) => {
    // Reset everything
    setState("analyzing");
    setSubmitError(null);
    setPartialOutput(null);
    setStreamedPrompt("");
    setOutput(null);

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, ...provider }),
      });

      if (!res.ok || !res.body) {
        // Non-streaming error response
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = "";

      // Accumulated streamed text — used as fallback if done.pack.optimizedPrompt differs
      let accumulated = "";
      let latestPartial: PartialOutput | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split("\n");
        lineBuffer  = lines.pop() ?? "";          // keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          let msg: Record<string, unknown>;
          try { msg = JSON.parse(line); } catch { continue; }

          if (msg.type === "meta") {
            // Intent + recommendation arrived — show the result skeleton
            latestPartial = {
              intent:         msg.intent as IntentResult,
              recommendation: msg.recommendation as ToolRecommendation,
            };
            setPartialOutput(latestPartial);
            setState("streaming");

          } else if (msg.type === "delta") {
            // Live token — append to streamed text
            const text = msg.text as string;
            accumulated += text;
            setStreamedPrompt((p) => p + text);

          } else if (msg.type === "done") {
            // Full pack arrived — use streamed text (more accurate) or fallback
            const pack = msg.pack as Record<string, unknown> & { optimizedPrompt?: string };
            const finalPrompt = accumulated.trim() || (pack.optimizedPrompt as string) || "";
            setOutput({
              intent:         latestPartial!.intent,
              recommendation: latestPartial!.recommendation,
              promptPack: {
                optimizedPrompt:    finalPrompt,
                systemInstructions: pack.systemInstructions as string | undefined,
                outputFormat:       pack.outputFormat       as string | undefined,
                contextNotes:       pack.contextNotes       as string | undefined,
                qualityChecklist:   (pack.qualityChecklist  as string[]) ?? [],
                alternativeVersion: pack.alternativeVersion as string | undefined,
              },
            });
            setProviderLabel(msg.providerLabel as string);
            setState("result");

          } else if (msg.type === "error") {
            throw new Error(msg.message as string);
          }
        }
      }

      // If state never reached "result" (e.g. stream ended without done packet)
      setState((s) => (s === "streaming" ? "error" : s));
      setSubmitError((e) => e ?? "Stream ended unexpectedly. Please try again.");

    } catch (err) {
      console.error("Enhance request failed:", err);
      setState("error");
      setSubmitError(
        err instanceof Error && err.message.length < 300
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }, []);

  const handleStartOver = useCallback(() => {
    setState("idle");
    setOutput(null);
    setPartialOutput(null);
    setStreamedPrompt("");
    setProviderLabel("");
    setSubmitError(null);
  }, []);

  const activeProviderLabel = getProvider(providerConfig.providerId).label;
  const hasApiKey           = providerConfig.apiKey.trim().length > 0;

  return (
    <>
      {/* Fixed settings — always visible */}
      <div className="fixed top-4 right-4 z-40">
        <ProviderSettings onChange={handleProviderChange} />
      </div>

      {state === "result" && output ? (
        <ResultPanel
          output={output}
          providerLabel={providerLabel}
          onStartOver={handleStartOver}
        />
      ) : state === "streaming" && partialOutput ? (
        <ResultPanel
          output={{
            intent:         partialOutput.intent,
            recommendation: partialOutput.recommendation,
            promptPack: {
              optimizedPrompt:  streamedPrompt,
              qualityChecklist: [],
            },
          }}
          providerLabel={activeProviderLabel}
          onStartOver={handleStartOver}
          streaming
        />
      ) : (
        <InputPanel
          onSubmit={handleSubmit}
          isLoading={state === "analyzing"}
          submitError={state === "error" ? submitError : null}
          providerConfig={providerConfig}
          activeProviderLabel={activeProviderLabel}
          hasApiKey={hasApiKey}
        />
      )}
    </>
  );
}
