"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { ChatMode } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Send, Square } from "lucide-react";
import ModeSelector from "./ModeSelector";

interface ChatInputProps {
  onSend: (content: string, mode: ChatMode) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("deepseek-chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed, mode);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [input, mode, isLoading, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border/30 bg-background/80 px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex items-center justify-between">
          <ModeSelector mode={mode} onChange={setMode} disabled={isLoading} />
        </div>

        <div className={cn(
          "relative flex items-end gap-2 rounded-xl border border-border/50 bg-card/50 p-2.5 transition-all duration-300",
          "focus-within:border-primary/40 focus-within:shadow-[0_0_20px_-5px_rgba(232,135,58,0.2)]"
        )}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "deepseek-reasoner"
                ? "输入需要深度推理的问题..."
                : "输入消息，按 Enter 发送..."
            }
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-2 py-1.5 text-sm",
              "placeholder:text-muted-foreground/50 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />

          {isLoading ? (
            <button
              onClick={onStop}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-all"
              title="停止生成"
            >
              <Square className="h-3 w-3" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                "disabled:opacity-20 disabled:cursor-not-allowed",
                input.trim()
                  ? "bg-gradient-primary text-white shadow-[0_0_15px_-3px_rgba(232,135,58,0.5)] hover:shadow-[0_0_20px_-3px_rgba(232,135,58,0.7)]"
                  : "bg-muted text-muted-foreground"
              )}
              title="发送消息"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
          {mode === "deepseek-reasoner" ? "推理模式 · 展示思考过程" : "对话模式 · 快速响应"}
          {" · Shift+Enter 换行"}
        </p>
      </div>
    </div>
  );
}
