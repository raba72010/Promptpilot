"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "pp_history";
const MAX_ENTRIES = 6;

export interface HistoryEntry {
  id: string;
  idea: string;
  tool: string;
  createdAt: number;
}

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function usePromptHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(load());
  }, []);

  const addEntry = useCallback((idea: string, tool: string) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      idea: idea.length > 80 ? idea.slice(0, 80) + "…" : idea,
      tool,
      createdAt: Date.now(),
    };
    setHistory((prev) => {
      const updated = [entry, ...prev.filter((e) => e.idea !== entry.idea)].slice(0, MAX_ENTRIES);
      save(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    save([]);
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
