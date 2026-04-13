"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Brain } from "lucide-react";

interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
  thinkingSeconds?: number;
}

export default function ThinkingBlock({
  content,
  isStreaming = false,
  thinkingSeconds,
}: ThinkingBlockProps) {
  const [isOpen, setIsOpen] = useState(isStreaming);
  const expanded = isStreaming || isOpen;

  if (!content && !isStreaming) return null;

  return (
    <div className="mb-3 rounded-xl border border-amber-600/30 bg-amber-950/20 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-amber-300 hover:bg-amber-900/15 transition-colors"
      >
        <Brain className={cn("h-4 w-4 shrink-0", isStreaming && "animate-pulse")} />
        <span className="flex-1 text-left text-xs">
          {isStreaming
            ? "思考中..."
            : thinkingSeconds
              ? `思考完成 · ${thinkingSeconds}s`
              : "思考过程"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-amber-600/20 px-4 py-3">
          <div className="text-sm text-amber-100/90 whitespace-pre-wrap break-words leading-relaxed">
            {content}
            {isStreaming && <span className="cursor-blink ml-0.5 text-amber-400">▊</span>}
          </div>
        </div>
      )}
    </div>
  );
}
