"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchStagingCount } from "@/services/admin";

const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord", icon: "▦" },
  { href: "/admin/documents", label: "Documents", icon: "▤", showBadge: true },
  { href: "/admin/users", label: "Utilisateurs", icon: "◎" },
  { href: "/admin/feedback", label: "Retours", icon: "★" },
  { href: "/admin/access", label: "Accès", icon: "⛨" },
  { href: "/admin/system", label: "Système", icon: "◉" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchStagingCount()
      .then((data) => setPendingCount(data.count))
      .catch(() => setPendingCount(0));
  }, [pathname]);

  return (
    <nav className="admin-nav">
      {ADMIN_NAV.map(({ href, label, icon, showBadge }) => {
        const isActive =
          href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`admin-nav-item ${isActive ? "active" : ""}`}
          >
            <span className="admin-nav-icon">{icon}</span>
            <span>{label}</span>
            {showBadge && pendingCount > 0 && (
              <span className="admin-nav-badge">{pendingCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
