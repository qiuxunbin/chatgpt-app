"use client";

import { useState, FormEvent } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Zap, ArrowRight, AlertCircle } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (username: string, password: string) => Promise<void>;
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("请填写用户名和密码");
      return;
    }
    if (!isLogin && password.length < 6) {
      setError("密码至少需要 6 个字符");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(username.trim(), password);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const resp = err as { response?: { data?: { detail?: string } } };
        setError(resp.response?.data?.detail || "操作失败，请重试");
      } else {
        setError("网络错误，请检查连接");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-full items-center justify-center px-4 bg-grid">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/[0.07] blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-[0_0_40px_-10px_rgba(232,135,58,0.6)] animate-float">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">{isLogin ? "欢迎回来" : "创建账号"}</h1>
          <p className="mt-1 text-sm text-muted-foreground/60">
            {isLogin ? "登录以继续使用 DeepSeek AI" : "注册开始使用 DeepSeek AI"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-6 glow-border backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-medium text-muted-foreground mb-1.5">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入用户名"
                autoComplete="username"
                className={cn(
                  "w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 text-sm text-foreground",
                  "focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_-5px_rgba(232,135,58,0.3)]",
                  "placeholder:text-muted-foreground/40 transition-all"
                )}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-muted-foreground mb-1.5">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "输入密码" : "至少 6 个字符"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={cn(
                  "w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 text-sm text-foreground",
                  "focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_-5px_rgba(232,135,58,0.3)]",
                  "placeholder:text-muted-foreground/40 transition-all"
                )}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white",
                "bg-gradient-primary hover:opacity-90 transition-all duration-200",
                "shadow-[0_0_20px_-5px_rgba(232,135,58,0.5)]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  {isLogin ? "登录" : "注册"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground/50">
          {isLogin ? "还没有账号？" : "已有账号？"}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="ml-1 text-primary/80 hover:text-primary transition-colors font-medium"
          >
            {isLogin ? "立即注册" : "去登录"}
          </Link>
        </p>
      </div>
    </div>
  );
}
