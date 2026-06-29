"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/access";
import { fetchUsageStats } from "@/services/gateway";
import { UsageStatsResponse, UserRole } from "@/types";

function StatCard({
  label,
  value,
  hint,
  highlight = false,
}: {
  label: string;
  value: string | number;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <div className={`stats-card${highlight ? " stats-card-highlight" : ""}`}>
      <span className="stats-card-label">{label}</span>
      <span className="stats-card-value">{value}</span>
      <span className="stats-card-hint">{hint}</span>
    </div>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<UsageStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?redirect=/stats");
      return;
    }
    const user = getCurrentUser();
    setIsAdmin(user?.role === "admin");

    fetchUsageStats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur de chargement.")
      );
  }, [router]);

  if (error) {
    return (
      <div className="chat-page">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="chat-page">
        <p className="admin-loading">Chargement des statistiques…</p>
      </div>
    );
  }

  const thumbsIcon = stats.satisfaction_rate >= 70 ? "👍" : stats.satisfaction_rate >= 40 ? "👌" : "📊";

  return (
    <div className="chat-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Activité de la plateforme</h1>
          <p className="page-subtitle">
            Découvrez comment IntraBot est utilisé dans votre organisation.
          </p>
        </div>
      </header>

      <div className="admin-panel" style={{ maxWidth: 800, margin: "2rem auto" }}>

        <section className="admin-section">
          <h2 className="admin-section-title">Vue d&apos;ensemble</h2>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <StatCard
              label="Utilisateurs inscrits"
              value={stats.total_users}
              hint="Comptes actifs sur la plateforme"
              highlight
            />
            <StatCard
              label="Retours donnés"
              value={stats.total_feedback}
              hint="Pouces haut + pouces bas"
            />
            <StatCard
              label={`Satisfaction ${thumbsIcon}`}
              value={
                stats.total_feedback > 0
                  ? `${stats.satisfaction_rate}%`
                  : "—"
              }
              hint={
                stats.total_feedback > 0
                  ? `${stats.positive_feedback} 👍 · ${stats.negative_feedback} 👎`
                  : "Pas encore de retours"
              }
              highlight={stats.satisfaction_rate >= 70}
            />
          </div>
        </section>

        {isAdmin && Object.keys(stats.users_by_role).length > 0 && (
          <section className="admin-section">
            <h2 className="admin-section-title">Répartition par rôle</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rôle</th>
                    <th>Nombre d&apos;utilisateurs</th>
                    <th>Part</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.users_by_role)
                    .sort(([, a], [, b]) => b - a)
                    .map(([role, count]) => (
                      <tr key={role}>
                        <td>
                          <span className="status-pill indexed">
                            {ROLE_LABELS[role as UserRole] ?? role}
                          </span>
                        </td>
                        <td>{count}</td>
                        <td>
                          {stats.total_users > 0
                            ? `${Math.round((count / stats.total_users) * 100)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {stats.total_feedback === 0 && (
          <section className="admin-section">
            <p className="admin-empty">
              Pas encore de retours. Encouragez vos collègues à utiliser le chatbot
              et à laisser un pouce après chaque réponse !
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
