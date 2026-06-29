"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { REGISTERABLE_ROLES, ROLE_LABELS } from "@/lib/access";
import { register } from "@/services/auth";
import { UserRole } from "@/types";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(email.trim(), password, role);
      window.location.href = "/chat";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.replace(/^Inscription failed \(\d+\): /, "")
          : "Inscription impossible."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="admin-eyebrow">IntraBot</p>
        <h1 className="admin-login-title">Inscription</h1>
        <p className="admin-login-subtitle">
          Créez un compte. Votre profil détermine les documents accessibles dans
          le chat.
        </p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label className="admin-login-label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            className="admin-login-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@entreprise.com"
            autoComplete="email"
            required
          />

          <label className="admin-login-label" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            className="admin-login-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label className="admin-login-label" htmlFor="role">
            Profil
          </label>
          <select
            id="role"
            className="admin-login-input"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            {REGISTERABLE_ROLES.map((item) => (
              <option key={item} value={item}>
                {ROLE_LABELS[item]}
              </option>
            ))}
          </select>

          {error && <p className="admin-login-error">{error}</p>}

          <button className="btn-primary admin-login-button" disabled={loading}>
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ?{" "}
          <Link href="/login" className="auth-link">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
