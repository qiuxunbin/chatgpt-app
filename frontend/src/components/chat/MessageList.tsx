"use client";

import { useEffect, useRef, useCallback } from "react";
import { Message } from "@/types/chat";
import { Zap, Sparkles, Brain } from "lucide-react";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  streamingMessageId?: string | null;
  isThinking?: boolean;
}

export default function MessageList({
  messages,
  streamingMessageId,
  isThinking = false,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    messages.length,
    messages[messages.length - 1]?.content,
    messages[messages.length - 1]?.reasoning_content,
  ]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-dots">
        <div className="text-center max-w-lg">
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-primary/5 animate-pulse" />
            </div>
            <div className="relative flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-primary shadow-[0_0_40px_-10px_rgba(232,135,58,0.5)] animate-float">
              <Zap className="h-9 w-9 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gradient mb-2">DeepSeek AI</h2>
          <p className="text-muted-foreground/60 text-sm mb-8">选择模式开始对话，AI 将为你提供智能回答</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="group relative rounded-xl border border-border/30 bg-card/50 p-4 text-left transition-all hover:border-amber-500/30 hover:shadow-[0_0_20px_-5px_rgba(232,135,58,0.12)] cursor-default">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 mb-3">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                </div>
                <div className="font-medium text-sm text-foreground mb-1">对话模式</div>
                <div className="text-xs text-muted-foreground/60 leading-relaxed">快速响应，适合日常聊天、问答和创作</div>
              </div>
            </div>
            <div className="group relative rounded-xl border border-border/30 bg-card/50 p-4 text-left transition-all hover:border-orange-500/30 hover:shadow-[0_0_20px_-5px_rgba(234,88,12,0.12)] cursor-default">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 mb-3">
                  <Brain className="h-4 w-4 text-orange-400" />
                </div>
                <div className="font-medium text-sm text-foreground mb-1">推理模式</div>
                <div className="text-xs text-muted-foreground/60 leading-relaxed">深度思考，可视化推理过程，适合复杂问题</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-dots">
      <div className="mx-auto max-w-3xl py-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={message.id === streamingMessageId}
            isThinking={message.id === streamingMessageId && isThinking}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
