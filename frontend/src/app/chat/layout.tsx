"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useChatStore } from "@/lib/store";
import ToastContainer from "@/components/ui/Toast";

function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setCurrentConversationId } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentId = (() => {
    const match = pathname.match(/\/chat\/(\d+)/);
    return match ? Number(match[1]) : null;
  })();

  const handleSelect = useCallback(
    (id: number) => {
      setCurrentConversationId(id);
      router.push(`/chat/${id}`);
      setSidebarOpen(false);
    },
    [router, setCurrentConversationId]
  );

  const handleNew = useCallback(() => {
    setCurrentConversationId(null);
    router.push("/chat");
    setSidebarOpen(false);
  }, [router, setCurrentConversationId]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            fixed inset-y-12 left-0 z-40 w-64 transition-transform duration-200
            md:relative md:inset-y-0
            ${sidebarOpen ? "md:translate-x-0" : "md:-translate-x-full md:w-0 md:overflow-hidden"}
          `}
        >
          <Sidebar currentId={currentId} onSelect={handleSelect} onNew={handleNew} />
        </div>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function ChatLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ChatLayout>{children}</ChatLayout>
    </AuthGuard>
  );
}
