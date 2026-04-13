"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useChatStore, Conversation } from "@/lib/store";
import { Plus, Trash2, Pencil, Check, X, MessageSquare, Brain, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface SidebarProps {
  currentId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}

function ConversationItem({
  conv, active, onSelect, onRename, onDelete,
}: {
  conv: Conversation; active: boolean; onSelect: () => void;
  onRename: (title: string) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conv.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const saveRename = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== conv.title) {
      onRename(trimmed);
      toast("success", "会话已重命名");
    } else {
      setTitle(conv.title);
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-all duration-200",
        active ? "bg-primary/10 text-accent-foreground glow-border" : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
      )}
      onClick={() => !editing && onSelect()}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-gradient-primary" />}
      {conv.mode === "deepseek-reasoner" ? (
        <Brain className={cn("h-4 w-4 shrink-0", active ? "text-orange-400" : "text-muted-foreground")} />
      ) : (
        <MessageSquare className={cn("h-4 w-4 shrink-0", active ? "text-amber-400" : "text-muted-foreground")} />
      )}
      {editing ? (
        <div className="flex flex-1 items-center gap-1">
          <input ref={inputRef} value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") { setTitle(conv.title); setEditing(false); } }}
            className="flex-1 bg-background border border-primary/30 rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:border-primary/60"
            onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); saveRename(); }} className="text-green-400 hover:text-green-300"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setTitle(conv.title); setEditing(false); }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate">{conv.title}</span>
          <div className="hidden group-hover:flex items-center gap-0.5">
            <button onClick={(e) => { e.stopPropagation(); setEditing(true); }} className="rounded p-0.5 text-muted-foreground hover:text-accent-foreground transition-colors"><Pencil className="h-3 w-3" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="rounded p-0.5 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="h-3 w-3" /></button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Sidebar({ currentId, onSelect, onNew }: SidebarProps) {
  const { conversations, fetchConversations, renameConversation, deleteConversation } = useChatStore();
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteConversation(deleteTarget.id);
    toast("success", "会话已删除");
    setDeleteTarget(null);
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/50 bg-[#110d06]">
      <div className="p-3">
        <button onClick={onNew} className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
          "bg-gradient-primary text-white hover:opacity-90 transition-all duration-200",
          "shadow-[0_0_20px_-5px_rgba(232,135,58,0.4)]"
        )}>
          <Plus className="h-4 w-4" /> 新建对话
        </button>
      </div>
      <div className="px-3 mb-2">
        <div className="flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
          <Sparkles className="h-3 w-3" /> 历史会话
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
              <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground/50">暂无对话记录</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv) => (
              <ConversationItem key={conv.id} conv={conv} active={conv.id === currentId}
                onSelect={() => onSelect(conv.id)}
                onRename={(t) => renameConversation(conv.id, t)}
                onDelete={() => setDeleteTarget(conv)} />
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-border/30 px-4 py-3">
        <p className="text-[10px] text-muted-foreground/40 text-center">Powered by DeepSeek</p>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除会话"
        message={`确定要删除「${deleteTarget?.title || ""}」吗？删除后无法恢复。`}
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </aside>
  );
}
