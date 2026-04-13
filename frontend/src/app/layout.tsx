import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chat - DeepSeek 对话助手",
  description: "基于 DeepSeek 的智能对话系统，支持推理模式与对话模式",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
