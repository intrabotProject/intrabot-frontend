"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord", icon: "▦" },
  { href: "/admin/documents", label: "Documents", icon: "▤" },
  { href: "/admin/users", label: "Utilisateurs", icon: "◎" },
  { href: "/admin/feedback", label: "Retours", icon: "★" },
  { href: "/admin/access", label: "Accès", icon: "⛨" },
  { href: "/admin/system", label: "Système", icon: "◉" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav">
      {ADMIN_NAV.map(({ href, label, icon }) => {
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
          </Link>
        );
      })}
    </nav>
  );
}
