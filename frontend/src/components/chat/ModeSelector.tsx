"use client";

import { ChatMode } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Sparkles, Brain } from "lucide-react";

interface ModeSelectorProps {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

const modes: { value: ChatMode; label: string; icon: typeof Brain; color: string }[] = [
  { value: "deepseek-chat", label: "对话", icon: Sparkles, color: "text-amber-400" },
  { value: "deepseek-reasoner", label: "推理", icon: Brain, color: "text-orange-400" },
];

export default function ModeSelector({ mode, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/[0.03] border border-border/50 p-0.5">
      {modes.map((m) => {
        const Icon = m.icon;
        const active = mode === m.value;
        return (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              active
                ? "bg-primary/15 text-foreground glow-border"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", active ? m.color : "")} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
