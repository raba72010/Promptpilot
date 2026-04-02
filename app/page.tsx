"use client";

import { useState, useCallback } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { generatePrompt } from "@/lib/prompt-engine";
import type { UserInput, EngineOutput } from "@/lib/prompt-engine";

type AppState = "idle" | "loading" | "result";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [output, setOutput] = useState<EngineOutput | null>(null);

  const handleSubmit = useCallback((input: UserInput) => {
    setState("loading");
    // Small artificial delay for UX — signals that something is being processed
    setTimeout(() => {
      const result = generatePrompt(input);
      setOutput(result);
      setState("result");
    }, 1200);
  }, []);

  const handleStartOver = useCallback(() => {
    setState("idle");
    setOutput(null);
  }, []);

  if (state === "result" && output) {
    return <ResultPanel output={output} onStartOver={handleStartOver} />;
  }

  return <InputPanel onSubmit={handleSubmit} isLoading={state === "loading"} />;
}
