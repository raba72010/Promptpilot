"use client";

import { useState, useCallback } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import type { UserInput, EngineOutput } from "@/lib/prompt-engine";

type AppState = "idle" | "loading" | "result" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [output, setOutput] = useState<EngineOutput | null>(null);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (input: UserInput) => {
    setState("loading");
    setSubmitError(null);

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: EngineOutput & { aiEnhanced: boolean } = await res.json();
      const { aiEnhanced: enhanced, ...engineOutput } = data;

      setOutput(engineOutput);
      setAiEnhanced(enhanced ?? false);
      setState("result");
    } catch (err) {
      console.error("Enhance request failed:", err);
      setState("error");
      setSubmitError("Something went wrong. Please try again.");
    }
  }, []);

  const handleStartOver = useCallback(() => {
    setState("idle");
    setOutput(null);
    setAiEnhanced(false);
    setSubmitError(null);
  }, []);

  if (state === "result" && output) {
    return (
      <ResultPanel
        output={output}
        aiEnhanced={aiEnhanced}
        onStartOver={handleStartOver}
      />
    );
  }

  return (
    <InputPanel
      onSubmit={handleSubmit}
      isLoading={state === "loading"}
      submitError={state === "error" ? submitError : null}
    />
  );
}
