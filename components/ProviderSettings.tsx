"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, Eye, EyeOff, ExternalLink, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { FREE_PROVIDERS, PAID_PROVIDERS, CHINESE_PROVIDERS, DEFAULT_PROVIDER_ID } from "@/lib/providers";
import type { ProviderId } from "@/lib/providers";
import { cn } from "@/lib/utils";

const STORAGE_KEY_PROVIDER = "pp_provider_id";
const STORAGE_KEY_KEYS = "pp_api_keys";

export interface ProviderConfig {
  providerId: ProviderId;
  apiKey: string;
}

interface ProviderSettingsProps {
  onChange: (config: ProviderConfig) => void;
}

export function ProviderSettings({ onChange }: ProviderSettingsProps) {
  const [open, setOpen] = useState(false);
  const [providerId, setProviderId] = useState<ProviderId>(DEFAULT_PROVIDER_ID);
  const [apiKeys, setApiKeys] = useState<Partial<Record<ProviderId, string>>>({});
  const [showKey, setShowKey] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER) as ProviderId | null;
      const storedKeys = localStorage.getItem(STORAGE_KEY_KEYS);
      const keys: Partial<Record<ProviderId, string>> = storedKeys ? JSON.parse(storedKeys) : {};
      const pid = storedProvider ?? DEFAULT_PROVIDER_ID;
      setProviderId(pid);
      setApiKeys(keys);
      onChange({ providerId: pid, apiKey: keys[pid] ?? "" });
    } catch {
      // ignore storage errors
    }
  }, [onChange]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleProviderChange(pid: ProviderId) {
    setProviderId(pid);
    setShowKey(false);
    try {
      localStorage.setItem(STORAGE_KEY_PROVIDER, pid);
    } catch {}
    onChange({ providerId: pid, apiKey: apiKeys[pid] ?? "" });
  }

  function handleKeyChange(value: string) {
    const updated = { ...apiKeys, [providerId]: value };
    setApiKeys(updated);
    try {
      localStorage.setItem(STORAGE_KEY_KEYS, JSON.stringify(updated));
    } catch {}
    onChange({ providerId, apiKey: value });
  }

  const allProviders = [...FREE_PROVIDERS, ...PAID_PROVIDERS, ...CHINESE_PROVIDERS];
  const provider = allProviders.find((p) => p.id === providerId) ?? FREE_PROVIDERS[0];
  const currentKey = apiKeys[providerId] ?? "";
  const hasKey = currentKey.trim().length > 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger — icon-only, clean */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="AI provider settings"
        className={cn(
          "inline-flex items-center justify-center rounded-xl w-10 h-10 border transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900",
          hasKey
            ? "border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100"
            : "border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
        )}
      >
        <Settings className="h-4 w-4" />
        {!hasKey && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-yellow-400 border border-white" />
        )}
      </button>

      {/* Panel — opens bottom-left from button */}
      {open && (
        <div className="absolute right-0 top-12 z-50 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl" style={{ width: "22rem" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">AI Provider</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Provider selector — grouped */}
          <div className="space-y-1.5 mb-4">
            <label className="text-xs font-medium text-gray-500">Provider</label>
            <Select value={providerId} onValueChange={(v) => handleProviderChange(v as ProviderId)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Free tier</SelectLabel>
                  {FREE_PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2 w-full">
                        <span className="rounded-full bg-green-100 text-green-700 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                          FREE
                        </span>
                        <span>{p.name}</span>
                        {apiKeys[p.id]?.trim() && (
                          <span className="ml-auto text-xs text-green-600 font-medium">✓</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Paid</SelectLabel>
                  {PAID_PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2 w-full">
                        <span>{p.name}</span>
                        {apiKeys[p.id]?.trim() && (
                          <span className="ml-auto text-xs text-green-600 font-medium">✓</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Chinese models</SelectLabel>
                  {CHINESE_PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2 w-full">
                        {p.freeTier && (
                          <span className="rounded-full bg-green-100 text-green-700 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                            FREE
                          </span>
                        )}
                        <span>{p.name}</span>
                        {apiKeys[p.id]?.trim() && (
                          <span className="ml-auto text-xs text-green-600 font-medium">✓</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Free tier note */}
            {provider.freeTier && provider.freeTierNote && (
              <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                {provider.freeTierNote}
              </p>
            )}
          </div>

          {/* API key input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500">{provider.apiKeyLabel}</label>
              <a
                href={provider.apiKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition-colors"
              >
                Get key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={currentKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder={provider.apiKeyPlaceholder}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Stored in your browser only. Never saved on our servers.
            </p>
          </div>

          {hasKey ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs text-green-700 font-medium">{provider.label} is active</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-xs text-amber-700">Paste your API key above to get started</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
