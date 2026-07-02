"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { login } from "@/services/auth";

export default function LoginPage() {
  const [redirectTo, setRedirectTo] = useState("/chat");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTo(params.get("redirect") ?? "/chat");
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      window.location.href = redirectTo;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.replace(/^Connexion failed \(\d+\): /, "")
          : "Connexion impossible."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="admin-eyebrow">IntraBot</p>
        <h1 className="admin-login-title">Connexion</h1>
        <p className="admin-login-subtitle">
          Connectez-vous pour accéder au chat documentaire selon votre profil.
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
            autoComplete="current-password"
            required
          />

          {error && <p className="admin-login-error">{error}</p>}

          <button className="btn-primary admin-login-button" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ?{" "}
          <Link href="/register" className="auth-link">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
