"use client";

import { useCallback, useEffect, useState } from "react";

import DocumentTable from "@/components/admin/DocumentTable";
import UploadZone from "@/components/admin/UploadZone";
import {
  approveDocument,
  deleteDocument,
  fetchDocuments,
  fetchStagingDocuments,
  rejectDocument,
  updateDocumentCategory,
  uploadDocument,
} from "@/services/admin";
import { CATEGORY_LABELS } from "@/lib/access";
import { DocumentCategory, DocumentSummary, StagingDocumentSummary } from "@/types";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [staging, setStaging] = useState<StagingDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busySource, setBusySource] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploadSummary, setUploadSummary] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setError(null);
    const [docs, stagingDocs] = await Promise.all([
      fetchDocuments(),
      fetchStagingDocuments(),
    ]);
    setDocuments(docs);
    setStaging(stagingDocs);
  }, []);

  useEffect(() => {
    loadDocuments()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur de chargement.")
      )
      .finally(() => setLoading(false));
  }, [loadDocuments]);

  async function handleUploadFile(file: File, category: DocumentCategory) {
    setFeedback(null);
    setUploadSummary(null);
    setError(null);

    const result = await uploadDocument(file, category);

    if (result.status === "indexed" && result.chunk_count > 0) {
      setUploadSummary(
        `« ${result.source} » intégré (${result.chunk_count} segment${result.chunk_count > 1 ? "s" : ""}, catégorie ${result.category}).`
      );
    } else {
      throw new Error(
        `« ${result.source} » : aucun segment extrait. Vérifiez le fichier.`
      );
    }

    await loadDocuments();
  }

  async function handleCategoryChange(
    source: string,
    category: DocumentCategory
  ) {
    setBusySource(source);
    setFeedback(null);
    setError(null);

    try {
      await updateDocumentCategory(source, category);
      setFeedback(`Catégorie de « ${source} » mise à jour (${category}).`);
      await loadDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur de mise à jour."
      );
    } finally {
      setBusySource(null);
    }
  }

  async function handleApprove(source: string) {
    setBusySource(source);
    setFeedback(null);
    setError(null);
    try {
      const result = await approveDocument(source);
      setFeedback(
        `« ${source} » approuvé et indexé (${result.chunk_count} segment${result.chunk_count > 1 ? "s" : ""}).`
      );
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'approbation.");
    } finally {
      setBusySource(null);
    }
  }

  async function handleReject(source: string) {
    const confirmed = window.confirm(
      `Rejeter « ${source} » ? Le fichier sera supprimé définitivement.`
    );
    if (!confirmed) return;
    setBusySource(source);
    setFeedback(null);
    setError(null);
    try {
      await rejectDocument(source);
      setFeedback(`« ${source} » rejeté et supprimé.`);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du rejet.");
    } finally {
      setBusySource(null);
    }
  }

  async function handleDelete(source: string) {
    const confirmed = window.confirm(
      `Supprimer « ${source} » ? Il ne sera plus accessible dans le chatbot.`
    );
    if (!confirmed) return;

    setBusySource(source);
    setFeedback(null);
    setError(null);

    try {
      const result = await deleteDocument(source);
      setFeedback(
        `« ${source} » supprimé (${result.chunks_deleted} segment${result.chunks_deleted > 1 ? "s" : ""} retiré${result.chunks_deleted > 1 ? "s" : ""}).`
      );
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de suppression.");
    } finally {
      setBusySource(null);
    }
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <p className="admin-loading">Chargement des documents…</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <section className="admin-section">
        <h2 className="admin-section-title">Ajouter des documents</h2>
        <p className="admin-section-hint">
          Choisissez la catégorie d&apos;accès puis déposez vos fichiers. Seuls
          les profils autorisés pourront les interroger dans le chat.
        </p>
        <UploadZone
          onUploadFile={handleUploadFile}
          disabled={busySource !== null}
        />
      </section>

      {uploadSummary && <p className="admin-feedback">{uploadSummary}</p>}
      {feedback && <p className="admin-feedback">{feedback}</p>}
      {error && <p className="error-message">{error}</p>}

      {staging.length > 0 && (
        <section className="admin-section">
          <h2 className="admin-section-title">
            En attente de validation ({staging.length})
          </h2>
          <p className="admin-section-hint">
            Ces documents ont été soumis par des utilisateurs et attendent votre approbation avant d&apos;être intégrés au chatbot.
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fichier</th>
                  <th>Soumis par</th>
                  <th>Date</th>
                  <th>Catégorie</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staging.map((doc) => (
                  <tr key={doc.source}>
                    <td className="doc-name">{doc.source}</td>
                    <td>{doc.submitted_by}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(doc.submitted_at).toLocaleString("fr-FR")}
                    </td>
                    <td>
                      <span className={`status-pill category-pill category-${doc.category}`}>
                        {CATEGORY_LABELS[doc.category] ?? doc.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn-primary"
                          style={{ fontSize: "0.8rem", padding: "0.25rem 0.75rem", whiteSpace: "nowrap" }}
                          disabled={busySource === doc.source}
                          onClick={() => handleApprove(doc.source)}
                        >
                          {busySource === doc.source ? "…" : "Approuver"}
                        </button>
                        <button
                          className="btn-ghost doc-action doc-action-danger"
                          style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
                          disabled={busySource === doc.source}
                          onClick={() => handleReject(doc.source)}
                        >
                          Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="admin-section">
        <h2 className="admin-section-title">
          Documents ({documents.length})
        </h2>
        <DocumentTable
          documents={documents}
          busySource={busySource}
          onDelete={handleDelete}
          onCategoryChange={handleCategoryChange}
        />
      </section>
    </div>
  );
}
