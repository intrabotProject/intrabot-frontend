"use client";

import { useEffect, useState } from "react";

import { fetchFeedbackStats } from "@/services/admin";
import { FeedbackStatsResponse } from "@/types";

export default function AdminFeedbackPage() {
  const [stats, setStats] = useState<FeedbackStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbackStats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur de chargement.")
      );
  }, []);

  if (error) {
    return (
      <div className="admin-panel">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-panel">
        <p className="admin-loading">Chargement des retours…</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <section className="admin-section">
        <h2 className="admin-section-title">Qualité des réponses</h2>
        <p className="admin-section-hint">
          Retours 👍/👎 envoyés par les utilisateurs depuis le chat. Utile pour
          repérer les questions mal couvertes par la documentation.
        </p>

        <div className="feedback-stats-grid">
          <div className="feedback-stat-card">
            <p className="feedback-stat-value">{stats.total}</p>
            <p className="feedback-stat-label">Total</p>
          </div>
          <div className="feedback-stat-card positive">
            <p className="feedback-stat-value">{stats.positive}</p>
            <p className="feedback-stat-label">👍 Utiles</p>
          </div>
          <div className="feedback-stat-card negative">
            <p className="feedback-stat-value">{stats.negative}</p>
            <p className="feedback-stat-label">👎 Pas utiles</p>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Derniers retours</h2>
        {stats.recent.length === 0 ? (
          <p className="admin-empty">Aucun retour pour le moment.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Retour</th>
                  <th>Question</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.created_at).toLocaleString("fr-FR")}
                    </td>
                    <td>{item.value === "up" ? "👍" : "👎"}</td>
                    <td className="doc-name">
                      {item.question ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
