"use client";

import { useEffect, useState } from "react";

import StatusBar from "@/components/ui/StatusBar";
import { clearAdminApiKey } from "@/lib/auth";
import { fetchCollectionStats } from "@/services/admin";
import { checkServicesHealth } from "@/services/gateway";
import { CollectionStats, ServiceStatus } from "@/types";
import { useRouter } from "next/navigation";

export default function AdminSystemPage() {
  const router = useRouter();
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    ingestion: "loading",
    search: "loading",
  });
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [gatewayUrl, setGatewayUrl] = useState("");

  useEffect(() => {
    setGatewayUrl(
      process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000"
    );

    async function load() {
      const [health, collectionStats] = await Promise.all([
        checkServicesHealth(),
        fetchCollectionStats(),
      ]);
      setServiceStatus(health);
      setStats(collectionStats);
    }

    load();
  }, []);

  function handleLogout() {
    clearAdminApiKey();
    router.replace("/admin/login");
  }

  return (
    <div className="admin-panel">
      <section className="admin-section">
        <h2 className="admin-section-title">Supervision</h2>
        <StatusBar status={serviceStatus} />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Configuration</h2>
        <div className="admin-info-grid">
          <div className="admin-info-item">
            <span className="admin-info-label">Gateway</span>
            <code className="inline-code">{gatewayUrl}</code>
          </div>
          {stats && (
            <>
              <div className="admin-info-item">
                <span className="admin-info-label">Collection Chroma</span>
                <code className="inline-code">{stats.collection_name}</code>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Chunks indexés</span>
                <span>{stats.chunk_count}</span>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Session</h2>
        <p className="admin-empty">
          La clé API admin est stockée en session navigateur et envoyée via
          l'en-tête <code className="inline-code">X-API-Key</code>.
        </p>
        <button className="btn-ghost admin-logout" onClick={handleLogout}>
          Se déconnecter
        </button>
      </section>
    </div>
  );
}
