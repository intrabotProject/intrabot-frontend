"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getCurrentUser,
  isAdminAuthenticated,
  isAuthenticated,
} from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/access";
import { logout } from "@/services/auth";

const NAV = [
  { href: "/chat", label: "Recherche", icon: "⌕", requiresAuth: true },
  { href: "/documents", label: "Soumettre", icon: "↑", requiresAuth: true, hideForAdmin: true },
  { href: "/stats", label: "Activité", icon: "◈", requiresAuth: true },
  { href: "/admin", label: "Administration", icon: "⚙", requiresAdmin: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = mounted ? getCurrentUser() : null;
  const loggedIn = mounted && isAuthenticated();
  const showAdmin = mounted && isAdminAuthenticated();

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">IB</span>
        <span className="logo-text">IntraBot</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.filter((item) => {
          if (item.requiresAdmin && !showAdmin) return false;
          if (item.hideForAdmin && showAdmin) return false;
          if (item.requiresAuth && !loggedIn) return false;
          return true;
        }).map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${
                href === "/admin"
                  ? pathname.startsWith("/admin")
                    ? "active"
                    : ""
                  : pathname === href
                  ? "active"
                  : ""
              }`}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </Link>
          )
        )}
      </nav>

      <div className="sidebar-user">
        {loggedIn && user ? (
          <>
            <p className="sidebar-user-email">{user.email}</p>
            <p className="sidebar-user-role">{ROLE_LABELS[user.role]}</p>
            <button className="sidebar-auth-btn" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="sidebar-auth-btn">
              Connexion
            </Link>
            <Link href="/register" className="sidebar-auth-link">
              Inscription
            </Link>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <span className="footer-text">Université Paris Dauphine</span>
        <span className="footer-sub">2025 – 2026</span>
      </div>
    </aside>
  );
}
