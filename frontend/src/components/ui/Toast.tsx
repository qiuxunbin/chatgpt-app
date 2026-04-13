"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  content: string;
}

let addToastFn: ((msg: Omit<ToastMessage, "id">) => void) | null = null;

export function toast(type: ToastMessage["type"], content: string) {
  addToastFn?.({ type, content });
}

function ToastItem({ msg, onRemove }: { msg: ToastMessage; onRemove: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onRemove, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle className="h-4 w-4 text-green-400" />,
    error: <XCircle className="h-4 w-4 text-red-400" />,
    info: <Info className="h-4 w-4 text-amber-400" />,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-border/50 bg-card/90 backdrop-blur-sm px-4 py-3 shadow-lg transition-all duration-300",
        "glow-border",
        exiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
      )}
    >
      {icons[msg.type]}
      <span className="text-sm text-foreground flex-1">{msg.content}</span>
      <button onClick={() => { setExiting(true); setTimeout(onRemove, 300); }} className="text-muted-foreground hover:text-foreground transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { ...msg, id }]);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <ToastItem key={t.id} msg={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
