"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import AdminNav from "@/components/admin/AdminNav";
import { isAdminAuthenticated, isAuthenticated } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }

    if (!isAdminAuthenticated()) {
      if (isAuthenticated()) {
        router.replace("/chat");
      } else {
        router.replace("/login?redirect=/admin");
      }
      return;
    }

    setReady(true);
  }, [isLoginPage, pathname, router]);

  if (!ready) {
    return (
      <div className="admin-page">
        <p className="admin-loading">Vérification de la session…</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="admin-page">
      <header className="page-header admin-header">
        <div>
          <p className="admin-eyebrow">Administration</p>
          <h1 className="page-title">IntraBot</h1>
          <p className="page-subtitle">
            Ajoutez des documents : ils sont intégrés au chatbot automatiquement.
          </p>
        </div>
      </header>

      <AdminNav />
      <div className="admin-content">{children}</div>
    </div>
  );
}
