"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/chat", label: "Recherche", icon: "⌕" },
  { href: "/ingestion", label: "Ingestion", icon: "↑" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">IB</span>
        <span className="logo-text">IntraBot</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${pathname === href ? "active" : ""}`}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="footer-text">Université Paris Dauphine</span>
        <span className="footer-sub">2025 – 2026</span>
      </div>
    </aside>
  );
}
