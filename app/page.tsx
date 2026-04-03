"use client";

import { useState, useCallback } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import type { UserInput, EngineOutput } from "@/lib/prompt-engine";
import type { ProviderConfig } from "@/components/ProviderSettings";

type AppState = "idle" | "loading" | "result" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [output, setOutput] = useState<EngineOutput | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (input: UserInput, provider: ProviderConfig) => {
    setState("loading");
    setSubmitError(null);

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, ...provider }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data: EngineOutput = await res.json();
      setOutput(data);
      setState("result");
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
    setSubmitError(null);
  }, []);

  if (state === "result" && output) {
    return <ResultPanel output={output} onStartOver={handleStartOver} />;
  }

  return (
    <InputPanel
      onSubmit={handleSubmit}
      isLoading={state === "loading"}
      submitError={state === "error" ? submitError : null}
    />
  );
}
