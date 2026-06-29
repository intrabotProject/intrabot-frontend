"use client";

import { useCallback, useEffect, useState } from "react";

import DocumentTable from "@/components/admin/DocumentTable";
import UploadZone from "@/components/admin/UploadZone";
import {
  deleteDocument,
  fetchDocuments,
  updateDocumentCategory,
  uploadDocument,
} from "@/services/admin";
import { DocumentCategory, DocumentSummary } from "@/types";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busySource, setBusySource] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploadSummary, setUploadSummary] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setError(null);
    const data = await fetchDocuments();
    setDocuments(data);
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
