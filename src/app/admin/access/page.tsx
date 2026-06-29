"use client";

import { useEffect, useState } from "react";

import { roleHasCategory } from "@/lib/access";
import { fetchAccessPolicy } from "@/services/gateway";
import { AccessPolicyResponse } from "@/types";

export default function AdminAccessPage() {
  const [policy, setPolicy] = useState<AccessPolicyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccessPolicy()
      .then(setPolicy)
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

  if (!policy) {
    return (
      <div className="admin-panel">
        <p className="admin-loading">Chargement de la politique d&apos;accès…</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <section className="admin-section">
        <h2 className="admin-section-title">Matrice d&apos;accès</h2>
        <p className="admin-section-hint">
          Chaque profil utilisateur du chat ne voit que les documents des
          catégories autorisées. Le filtrage est appliqué côté serveur
          (gateway + search).
        </p>

        <div className="admin-table-wrap">
          <table className="admin-table access-matrix">
            <thead>
              <tr>
                <th>Profil</th>
                {policy.categories.map((category) => (
                  <th key={category.id}>{category.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {policy.roles.map((role) => (
                <tr key={role.id}>
                  <td className="doc-name">{role.label}</td>
                  {policy.categories.map((category) => (
                    <td key={category.id} className="access-cell">
                      {roleHasCategory(role, category.id) ? "✓" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Authentification</h2>
        <p className="admin-section-hint">
          Chaque utilisateur se connecte avec son compte. Le rôle est fixé à
          l&apos;inscription (ou attribué au compte admin). Le gateway lit le
          JWT et applique automatiquement les catégories autorisées.
        </p>
      </section>
    </div>
  );
}
