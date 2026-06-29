"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?redirect=/admin");
  }, [router]);

  return (
    <div className="admin-page">
      <p className="admin-loading">Redirection vers la connexion…</p>
    </div>
  );
}
