"use client";

import { useState, useCallback, ReactNode } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { toast } from "@/components/ui/Toast";

interface CodeBlockProps {
  className?: string;
  children?: ReactNode;
}

export default function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace(/^language-/, "") || "";

  const getTextContent = (node: ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (!node) return "";
    if (Array.isArray(node)) return node.map(getTextContent).join("");
    if (typeof node === "object" && node !== null && "props" in node) {
      const el = node as { props: { children?: ReactNode } };
      return getTextContent(el.props.children);
    }
    return "";
  };

  const handleCopy = useCallback(() => {
    const text = getTextContent(children);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast("success", "代码已复制");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  return (
    <div className="group/code relative my-3 rounded-xl border border-border/40 overflow-hidden glow-border-hover transition-all">
      <div className="flex items-center justify-between bg-white/[0.02] px-3 py-1.5 text-xs border-b border-border/30">
        <div className="flex items-center gap-1.5 text-muted-foreground/60">
          <Terminal className="h-3 w-3" />
          <span>{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.05] transition-all"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-400" />
              <span className="text-green-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed bg-[#0d0d1a]">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
