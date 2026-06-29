"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import StatsCards from "@/components/admin/StatsCards";
import StatusBar from "@/components/ui/StatusBar";
import { checkServicesHealth } from "@/services/gateway";
import { fetchCollectionStats, fetchDocuments } from "@/services/admin";
import { CollectionStats, DocumentSummary, ServiceStatus } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    ingestion: "loading",
    search: "loading",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, documentsData, health] = await Promise.all([
          fetchCollectionStats(),
          fetchDocuments(),
          checkServicesHealth(),
        ]);
        setStats(statsData);
        setDocuments(documentsData.slice(0, 5));
        setServiceStatus(health);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement."
        );
      }
    }

    loadDashboard();
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
        <p className="admin-loading">Chargement du tableau de bord…</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <section className="admin-section">
        <h2 className="admin-section-title">État des services</h2>
        <StatusBar status={serviceStatus} />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Corpus documentaire</h2>
        <StatsCards stats={stats} />
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Documents récents</h2>
          <Link href="/admin/documents" className="admin-link">
            Gérer les documents →
          </Link>
        </div>

        {documents.length === 0 ? (
          <p className="admin-empty">
            Aucun document pour le moment.{" "}
            <Link href="/admin/documents" className="admin-link">
              Ajoutez un fichier
            </Link>{" "}
            pour alimenter le chatbot.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Chunks</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.source}>
                    <td>{doc.source}</td>
                    <td>{doc.chunk_count}</td>
                    <td>
                      <span className={`status-pill ${doc.status}`}>
                        {doc.status === "indexed" ? "Disponible" : "Non traité"}
                      </span>
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
