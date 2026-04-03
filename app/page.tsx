"use client";

import { useState, useCallback, useRef } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { ProviderSettings } from "@/components/ProviderSettings";
import { getProvider } from "@/lib/providers";
import { usePromptHistory } from "@/hooks/usePromptHistory";
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
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({ providerId: "groq", apiKey: "" });

  // Remember last input so Regenerate can replay it
  const lastInputRef    = useRef<UserInput | null>(null);
  const lastProviderRef = useRef<ProviderConfig | null>(null);

  const { history, addEntry } = usePromptHistory();

  const handleProviderChange = useCallback((config: ProviderConfig) => {
    setProviderConfig(config);
  }, []);

  const runEnhance = useCallback(async (input: UserInput, provider: ProviderConfig) => {
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
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = "";
      let accumulated = "";
      let latestPartial: PartialOutput | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split("\n");
        lineBuffer  = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let msg: Record<string, unknown>;
          try { msg = JSON.parse(line); } catch { continue; }

          if (msg.type === "meta") {
            latestPartial = { intent: msg.intent as IntentResult, recommendation: msg.recommendation as ToolRecommendation };
            setPartialOutput(latestPartial);
            setState("streaming");

          } else if (msg.type === "delta") {
            const text = msg.text as string;
            accumulated += text;
            setStreamedPrompt((p) => p + text);

          } else if (msg.type === "done") {
            const pack = msg.pack as Record<string, unknown> & { optimizedPrompt?: string };
            const finalPrompt = accumulated.trim() || (pack.optimizedPrompt as string) || "";
            const finalOutput: EngineOutput = {
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
            };
            setOutput(finalOutput);
            setProviderLabel(msg.providerLabel as string);
            setState("result");
            // Save to history
            addEntry(input.rawIdea, latestPartial!.recommendation.primaryTool);

          } else if (msg.type === "error") {
            throw new Error(msg.message as string);
          }
        }
      }

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
  }, [addEntry]);

  const handleSubmit = useCallback((input: UserInput, provider: ProviderConfig) => {
    lastInputRef.current    = input;
    lastProviderRef.current = provider;
    return runEnhance(input, provider);
  }, [runEnhance]);

  const handleRegenerate = useCallback(() => {
    if (lastInputRef.current && lastProviderRef.current) {
      runEnhance(lastInputRef.current, lastProviderRef.current);
    }
  }, [runEnhance]);

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
      <div className="fixed top-4 right-4 z-40">
        <ProviderSettings onChange={handleProviderChange} />
      </div>

      {state === "result" && output ? (
        <ResultPanel
          output={output}
          providerLabel={providerLabel}
          onStartOver={handleStartOver}
          onRegenerate={handleRegenerate}
        />
      ) : state === "streaming" && partialOutput ? (
        <ResultPanel
          output={{
            intent:         partialOutput.intent,
            recommendation: partialOutput.recommendation,
            promptPack:     { optimizedPrompt: streamedPrompt, qualityChecklist: [] },
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
          history={history}
        />
      )}
    </>
  );
}
