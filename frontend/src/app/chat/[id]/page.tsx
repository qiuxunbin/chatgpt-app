"use client";

import { useState, useCallback, useRef, useEffect, use } from "react";
import { Message, ChatMode } from "@/types/chat";
import { API_BASE_URL } from "@/lib/api";
import { getToken, clearAuth } from "@/lib/auth";
import { useChatStore } from "@/lib/store";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const conversationId = Number(id);

  const {
    messages: storeMessages,
    loadConversation,
    loading: storeLoading,
    refreshConversationInList,
  } = useChatStore();

  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const thinkingStartRef = useRef<number>(0);
  const isThinkingRef = useRef(false);

  useEffect(() => {
    loadConversation(conversationId).then(() => setInitialized(true));
  }, [conversationId, loadConversation]);

  useEffect(() => {
    if (initialized) {
      setLocalMessages(storeMessages);
    }
  }, [storeMessages, initialized]);

  const displayMessages = initialized ? localMessages : [];

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setStreamingMessageId(null);
    setIsThinking(false);
    isThinkingRef.current = false;
  }, []);

  const handleSend = useCallback(
    async (content: string, mode: ChatMode) => {
      const token = getToken();
      if (!token) {
        clearAuth();
        window.location.href = "/login";
        return;
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        mode,
      };

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        reasoning_content: "",
        mode,
      };

      setLocalMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);
      setStreamingMessageId(assistantMessage.id);

      if (mode === "deepseek-reasoner") {
        setIsThinking(true);
        isThinkingRef.current = true;
        thinkingStartRef.current = Date.now();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/chat/${conversationId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content, mode }),
            signal: abortController.signal,
          }
        );

        if (response.status === 401) {
          clearAuth();
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("无法读取响应流");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              const eventType = line.slice(6).trim();

              if (eventType === "done") {
                if (mode === "deepseek-reasoner" && thinkingStartRef.current > 0) {
                  const thinkingSec = Math.round(
                    (Date.now() - thinkingStartRef.current) / 1000
                  );
                  setLocalMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, thinking_seconds: thinkingSec }
                        : m
                    )
                  );
                }
                setIsLoading(false);
                setStreamingMessageId(null);
                setIsThinking(false);
                isThinkingRef.current = false;

                refreshConversationInList(conversationId);
              }

              if (eventType === "content" && isThinkingRef.current) {
                setIsThinking(false);
                isThinkingRef.current = false;
              }

              continue;
            }

            if (line.startsWith("data:")) {
              const raw = line.slice(5).trim();
              if (raw === "[DONE]") continue;

              try {
                const data = JSON.parse(raw);

                if (data.type === "error" && data.content) {
                  setLocalMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: `⚠️ ${data.content}` }
                        : m
                    )
                  );
                } else if (data.type === "reasoning" && data.content) {
                  setLocalMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? {
                            ...m,
                            reasoning_content:
                              (m.reasoning_content || "") + data.content,
                          }
                        : m
                    )
                  );
                } else if (data.type === "content" && data.content) {
                  setLocalMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: m.content + data.content }
                        : m
                    )
                  );
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const errorMsg = err instanceof Error ? err.message : "请求失败";
        setLocalMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: `⚠️ 错误: ${errorMsg}` }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        setStreamingMessageId(null);
        setIsThinking(false);
        isThinkingRef.current = false;
        abortControllerRef.current = null;
      }
    },
    [conversationId, refreshConversationInList]
  );

  if (storeLoading && !initialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">加载会话中...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <MessageList
        messages={displayMessages}
        streamingMessageId={streamingMessageId}
        isThinking={isThinking}
      />
      <ChatInput onSend={handleSend} onStop={handleStop} isLoading={isLoading} />
    </div>
  );
}
