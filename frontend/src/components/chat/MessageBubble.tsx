"use client";

import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { User, Zap } from "lucide-react";
import ThinkingBlock from "./ThinkingBlock";
import MarkdownRenderer from "./MarkdownRenderer";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export default function MessageBubble({
  message,
  isStreaming = false,
  isThinking = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          isUser
            ? "bg-gradient-to-br from-amber-500 to-orange-600"
            : "bg-gradient-primary shadow-[0_0_12px_-3px_rgba(232,135,58,0.4)]"
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5 text-white" /> : <Zap className="h-3.5 w-3.5 text-white" />}
      </div>

      <div className={cn("flex flex-col max-w-[78%]", isUser ? "items-end" : "items-start")}>
        {!isUser && (message.reasoning_content || isThinking) && (
          <ThinkingBlock
            content={message.reasoning_content || ""}
            isStreaming={isThinking}
            thinkingSeconds={message.thinking_seconds}
          />
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
            isUser
              ? "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 text-foreground whitespace-pre-wrap"
              : "bg-card/80 border border-border/30 text-foreground"
          )}
        >
          {isUser ? (
            message.content
          ) : message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : null}

          {isStreaming && !isThinking && (
            <span className="cursor-blink ml-0.5 text-primary">▊</span>
          )}

          {!isUser && !message.content && isThinking && (
            <div className="flex items-center gap-1.5 py-1">
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-amber-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
