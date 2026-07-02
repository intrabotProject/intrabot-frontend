"use client";

import { useEffect, useState } from "react";

import { ROLE_LABELS, REGISTERABLE_ROLES } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { fetchUsers, updateUserRole } from "@/services/admin";
import { AdminUserListItem, UserRole } from "@/types";

const ASSIGNABLE_ROLES: UserRole[] = [...REGISTERABLE_ROLES, "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur de chargement.")
      );
  }, []);

  async function handleRoleChange(userId: string, role: UserRole) {
    setBusyId(userId);
    setFeedback(null);
    setError(null);

    try {
      await updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role } : user))
      );
      setFeedback("Rôle mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    } finally {
      setBusyId(null);
    }
  }

  if (error && users.length === 0) {
    return (
      <div className="admin-panel">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <section className="admin-section">
        <h2 className="admin-section-title">Comptes utilisateurs</h2>
        <p className="admin-section-hint">
          Modifiez le profil d&apos;accès de chaque compte. En production, ces
          rôles viendraient du SSO ; ici l&apos;administrateur peut les corriger.
        </p>

        {feedback && <p className="admin-feedback">{feedback}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Profil</th>
                <th>Inscription</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const isBusy = busyId === user.id;

                return (
                  <tr key={user.id}>
                    <td className="doc-name">
                      {user.email}
                      {isSelf && (
                        <span className="admin-badge">Vous</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="top-k-select doc-category-select"
                        value={user.role}
                        disabled={isSelf || isBusy}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value as UserRole)
                        }
                      >
                        {ASSIGNABLE_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString("fr-FR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
