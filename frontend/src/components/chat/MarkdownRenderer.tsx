"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import CodeBlock from "./CodeBlock";
import type { Components } from "react-markdown";

const components: Components = {
  pre({ children }) {
    return <>{children}</>;
  },
  code({ className, children, ...props }) {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono text-foreground" {...props}>
          {children}
        </code>
      );
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  table({ children }) {
    return (
      <div className="my-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-muted/50">{children}</thead>;
  },
  th({ children }) {
    return <th className="border-b border-border px-3 py-2 text-left font-medium">{children}</th>;
  },
  td({ children }) {
    return <td className="border-b border-border px-3 py-2">{children}</td>;
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
        {children}
      </a>
    );
  },
  blockquote({ children }) {
    return <blockquote className="my-2 border-l-3 border-primary/40 pl-3 text-muted-foreground italic">{children}</blockquote>;
  },
  ul({ children }) {
    return <ul className="my-2 list-disc pl-5 space-y-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-2 list-decimal pl-5 space-y-1">{children}</ol>;
  },
  h1({ children }) {
    return <h1 className="mt-4 mb-2 text-xl font-bold">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="mt-3 mb-2 text-lg font-bold">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="mt-3 mb-1 text-base font-semibold">{children}</h3>;
  },
  p({ children }) {
    return <p className="my-1.5 leading-relaxed">{children}</p>;
  },
  hr() {
    return <hr className="my-4 border-border" />;
  },
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
