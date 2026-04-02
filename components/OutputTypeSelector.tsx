"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import type { OutputTypeOverride } from "@/lib/prompt-engine";

const OUTPUT_OPTIONS: { value: OutputTypeOverride; label: string }[] = [
  { value: "auto", label: "Auto output type" },
  { value: "Text", label: "Text" },
  { value: "Code", label: "Code" },
  { value: "Research", label: "Research" },
  { value: "Image", label: "Image" },
  { value: "Video", label: "Video" },
  { value: "System Prompt", label: "System Prompt" },
  { value: "Agent Instructions", label: "Agent Instructions" },
];

interface OutputTypeSelectorProps {
  value: OutputTypeOverride;
  onChange: (value: OutputTypeOverride) => void;
}

export function OutputTypeSelector({ value, onChange }: OutputTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as OutputTypeOverride)}>
      <SelectTrigger className="w-[170px] h-9 text-sm" aria-label="Select output type">
        <SelectValue placeholder="Auto output type" />
      </SelectTrigger>
      <SelectContent>
        {OUTPUT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
