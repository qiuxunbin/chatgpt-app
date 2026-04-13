"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { registerApi, fetchMe, setToken, setStoredUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (username: string, password: string) => {
    const token = await registerApi(username, password);
    setToken(token);
    const user = await fetchMe(token);
    setStoredUser(user);
    router.push("/chat");
  };

  return <AuthForm mode="register" onSubmit={handleRegister} />;
}
