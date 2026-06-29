"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, isAuthenticated } from "@/lib/auth";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?redirect=/chat");
      return;
    }

    setUserId(getCurrentUser()?.id ?? null);
    setReady(true);
  }, [router]);

  if (!ready || !userId) {
    return (
      <div className="chat-page">
        <p className="admin-loading">Vérification de la session…</p>
      </div>
    );
  }

  return <div key={userId}>{children}</div>;
}
