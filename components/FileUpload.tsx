"use client";

import { useRef, useState } from "react";
import { Paperclip, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_EXTENSIONS = [".txt", ".md", ".json"];
const ALLOWED_MIME_TYPES = ["text/plain", "text/markdown", "application/json", "text/x-markdown"];
const MAX_SIZE_BYTES = 500 * 1024; // 500 KB

interface FileUploadProps {
  onFileLoad: (content: string, name: string) => void;
  onFileRemove: () => void;
  currentFile: { name: string } | null;
}

export function FileUpload({ onFileLoad, onFileRemove, currentFile }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function isAllowedFile(file: File): boolean {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME_TYPES.includes(file.type);
  }

  function handleFile(file: File) {
    setError(null);

    if (!isAllowedFile(file)) {
      setError(`Unsupported file type. Please upload .txt, .md, or .json files.`);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("File is too large. Maximum size is 500 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    setError(null);
    onFileRemove();
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.json"
        onChange={handleInputChange}
        className="sr-only"
        id="file-upload"
        aria-label="Upload a context file"
      />

      {currentFile ? (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <Paperclip className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate max-w-[180px] text-gray-700 font-medium">
            {currentFile.name}
          </span>
          <button
            onClick={handleRemove}
            className="ml-auto shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
            aria-label="Remove file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 cursor-pointer transition-colors",
            "hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-900"
          )}
        >
          <Paperclip className="h-3.5 w-3.5" />
          <span>Upload file</span>
          <span className="text-gray-400 text-xs">(.txt .md .json)</span>
        </label>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
