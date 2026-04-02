"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import type { ToolOverride } from "@/lib/prompt-engine";

const TOOL_OPTIONS: { value: ToolOverride; label: string; group: string }[] = [
  { value: "auto", label: "Auto-detect tool", group: "auto" },
  { value: "Claude", label: "Claude", group: "text" },
  { value: "ChatGPT", label: "ChatGPT", group: "text" },
  { value: "Gemini", label: "Gemini", group: "text" },
  { value: "Claude Code", label: "Claude Code", group: "code" },
  { value: "Generic Code Agent", label: "Generic Code Agent", group: "code" },
  { value: "Midjourney", label: "Midjourney", group: "creative" },
  { value: "DALL·E", label: "DALL·E", group: "creative" },
  { value: "Runway", label: "Runway", group: "creative" },
];

interface ToolSelectorProps {
  value: ToolOverride;
  onChange: (value: ToolOverride) => void;
}

export function ToolSelector({ value, onChange }: ToolSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ToolOverride)}>
      <SelectTrigger className="w-[170px] h-9 text-sm" aria-label="Select AI tool">
        <SelectValue placeholder="Auto-detect tool" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto-detect tool</SelectItem>
        <SelectGroup>
          <SelectLabel>Text & Writing</SelectLabel>
          <SelectItem value="Claude">Claude</SelectItem>
          <SelectItem value="ChatGPT">ChatGPT</SelectItem>
          <SelectItem value="Gemini">Gemini</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Code</SelectLabel>
          <SelectItem value="Claude Code">Claude Code</SelectItem>
          <SelectItem value="Generic Code Agent">Generic Code Agent</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Creative</SelectLabel>
          <SelectItem value="Midjourney">Midjourney</SelectItem>
          <SelectItem value="DALL·E">DALL·E</SelectItem>
          <SelectItem value="Runway">Runway</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
