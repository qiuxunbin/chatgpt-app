import { create } from "zustand";
import { api } from "./api";
import { Message, ChatMode } from "@/types/chat";

export interface Conversation {
  id: number;
  title: string;
  mode: ChatMode;
  created_at: string;
  updated_at: string;
}

interface ConversationDetail extends Conversation {
  messages: Message[];
}

interface ChatStore {
  conversations: Conversation[];
  currentConversationId: number | null;
  messages: Message[];
  loading: boolean;

  fetchConversations: () => Promise<void>;
  createConversation: (mode?: ChatMode) => Promise<number>;
  deleteConversation: (id: number) => Promise<void>;
  renameConversation: (id: number, title: string) => Promise<void>;
  loadConversation: (id: number) => Promise<void>;
  setCurrentConversationId: (id: number | null) => void;
  setMessages: (messages: Message[]) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  addMessage: (message: Message) => void;
  refreshConversationInList: (id: number) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  loading: false,

  fetchConversations: async () => {
    try {
      const res = await api.get("/api/conversations");
      set({ conversations: res.data });
    } catch {
      // silently fail
    }
  },

  createConversation: async (mode: ChatMode = "deepseek-chat") => {
    const res = await api.post("/api/conversations", { title: "新对话", mode });
    const conv: Conversation = res.data;
    set((s) => ({ conversations: [conv, ...s.conversations] }));
    return conv.id;
  },

  deleteConversation: async (id: number) => {
    await api.delete(`/api/conversations/${id}`);
    const state = get();
    set({
      conversations: state.conversations.filter((c) => c.id !== id),
      ...(state.currentConversationId === id
        ? { currentConversationId: null, messages: [] }
        : {}),
    });
  },

  renameConversation: async (id: number, title: string) => {
    await api.put(`/api/conversations/${id}`, { title });
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, title } : c
      ),
    }));
  },

  loadConversation: async (id: number) => {
    set({ loading: true, currentConversationId: id, messages: [] });
    try {
      const res = await api.get(`/api/conversations/${id}`);
      const detail: ConversationDetail = res.data;
      const msgs: Message[] = detail.messages.map((m) => ({
        id: String(m.id),
        role: m.role as "user" | "assistant",
        content: m.content,
        reasoning_content: m.reasoning_content || undefined,
        mode: detail.mode,
      }));
      set({ messages: msgs, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),

  refreshConversationInList: async (id: number) => {
    try {
      const res = await api.get(`/api/conversations/${id}`);
      const conv: Conversation = res.data;
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === id ? { ...c, title: conv.title, updated_at: conv.updated_at } : c
        ),
      }));
    } catch {
      // ignore
    }
  },
}));
