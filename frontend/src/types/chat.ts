export type ChatMode = "deepseek-chat" | "deepseek-reasoner";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning_content?: string;
  mode?: ChatMode;
  created_at?: string;
  /** Elapsed thinking time in seconds (set after reasoning completes) */
  thinking_seconds?: number;
}
