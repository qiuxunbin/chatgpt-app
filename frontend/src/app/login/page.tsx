"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { loginApi, fetchMe, setToken, setStoredUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (username: string, password: string) => {
    const token = await loginApi(username, password);
    setToken(token);
    const user = await fetchMe(token);
    setStoredUser(user);
    router.push("/chat");
  };

  return <AuthForm mode="login" onSubmit={handleLogin} />;
}
