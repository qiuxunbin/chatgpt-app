"use client";

import { useRouter } from "next/navigation";
import { getStoredUser, clearAuth } from "@/lib/auth";
import { LogOut, Zap, PanelLeftClose, PanelLeft } from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="glass relative z-20 flex h-12 items-center justify-between border-b border-border/50 px-4">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-1.5 text-muted-foreground hover:text-primary transition-colors"
            title={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-gradient">DeepSeek AI</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] font-bold text-white">
              {user.username[0].toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground">{user.username}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
          title="退出登录"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
