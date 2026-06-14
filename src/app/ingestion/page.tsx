"use client";

import { useState } from "react";
import { IngestResponse } from "@/types";

type IngestState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; result: IngestResponse }
  | { phase: "error"; message: string };

export default function IngestionPage() {
  const [state, setState] = useState<IngestState>({ phase: "idle" });

  async function handleIngest() {
    setState({ phase: "running" });
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `Erreur serveur (${res.status})`);
      }
      const result: IngestResponse = await res.json();
      setState({ phase: "done", result });
    } catch (err) {
      setState({
        phase: "error",
        message:
          err instanceof Error ? err.message : "Erreur inattendue.",
      });
    }
  }

  function handleReset() {
    setState({ phase: "idle" });
  }

  return (
    <div className="ingestion-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Ingestion de documents</h1>
          <p className="page-subtitle">
            Lance le traitement des documents présents dans{" "}
            <code className="inline-code">data/docs/</code> sur le serveur.
          </p>
        </div>
      </header>

      <div className="ingestion-content">
        {/* Info card */}
        <div className="info-card">
          <h2 className="info-card-title">Comment ça fonctionne</h2>
          <ol className="pipeline-steps">
            <li>
              <span className="step-num">1</span>
              <div>
                <strong>Lecture</strong> — Les fichiers PDF et Word du dossier{" "}
                <code className="inline-code">data/docs/</code> sont chargés.
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div>
                <strong>Parsing & chunking</strong> — Chaque document est
                découpé en segments sémantiques via Docling.
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div>
                <strong>Vectorisation</strong> — Les segments sont convertis en
                vecteurs d'embeddings (Mistral).
              </div>
            </li>
            <li>
              <span className="step-num">4</span>
              <div>
                <strong>Indexation</strong> — Les vecteurs sont stockés dans
                ChromaDB pour la recherche sémantique.
              </div>
            </li>
          </ol>
        </div>

        {/* Action zone */}
        <div className="action-card">
          {state.phase === "idle" && (
            <>
              <p className="action-hint">
                Assurez-vous que les documents sont bien déposés dans le dossier
                source avant de lancer l'ingestion.
              </p>
              <button className="btn-primary" onClick={handleIngest}>
                Lancer l'ingestion
              </button>
            </>
          )}

          {state.phase === "running" && (
            <div className="running-state">
              <div className="spinner" aria-label="Traitement en cours" />
              <p className="running-label">Ingestion en cours…</p>
              <p className="running-sub">
                Cette opération peut prendre plusieurs minutes selon le volume
                documentaire.
              </p>
            </div>
          )}

          {state.phase === "done" && (
            <div className="done-state">
              <div className="done-icon">✓</div>
              <p className="done-title">Ingestion terminée</p>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-value">
                    {state.result.files_processed}
                  </span>
                  <span className="result-label">fichiers traités</span>
                </div>
                <div className="result-item">
                  <span className="result-value">
                    {state.result.chunks_indexed}
                  </span>
                  <span className="result-label">segments indexés</span>
                </div>
                <div className="result-item">
                  <span className="result-value">
                    {state.result.total_in_collection}
                  </span>
                  <span className="result-label">total en base</span>
                </div>
              </div>
              <button className="btn-ghost" onClick={handleReset}>
                Nouvelle ingestion
              </button>
            </div>
          )}

          {state.phase === "error" && (
            <div className="error-state">
              <div className="error-icon">!</div>
              <p className="error-title">L'ingestion a échoué</p>
              <p className="error-message">{state.message}</p>
              <button className="btn-primary" onClick={handleReset}>
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
