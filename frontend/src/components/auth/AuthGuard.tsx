"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, getStoredUser, clearAuth, fetchMe, setStoredUser, AuthUser } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      clearAuth();
      router.replace("/login");
      return;
    }

    const cached = getStoredUser();
    if (cached) {
      setUser(cached);
      setChecked(true);
      return;
    }

    fetchMe(token)
      .then((u) => {
        setStoredUser(u);
        setUser(u);
        setChecked(true);
      })
      .catch(() => {
        clearAuth();
        router.replace("/login");
      });
  }, [router, pathname]);

  if (!checked || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">验证身份中...</p>
      </div>
    );
  }

  return <>{children}</>;
}
