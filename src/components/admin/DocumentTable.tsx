"use client";

import { CATEGORY_LABELS } from "@/lib/access";
import { DocumentCategory, DocumentSummary } from "@/types";

interface Props {
  documents: DocumentSummary[];
  busySource: string | null;
  onDelete: (source: string) => void;
  onCategoryChange: (source: string, category: DocumentCategory) => void;
}

const CATEGORY_OPTIONS: DocumentCategory[] = [
  "public",
  "engineering",
  "rh",
  "gouvernance",
  "finance",
];

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function statusLabel(status: DocumentSummary["status"]): string {
  return status === "indexed" ? "Disponible" : "Non traité";
}

export default function DocumentTable({
  documents,
  busySource,
  onDelete,
  onCategoryChange,
}: Props) {
  if (documents.length === 0) {
    return (
      <p className="admin-empty">
        Aucun document pour le moment. Déposez un fichier ci-dessus : il sera
        analysé et ajouté au chatbot automatiquement.
      </p>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Catégorie</th>
            <th>Taille</th>
            <th>Segments</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const isBusy = busySource === doc.source;
            const category = doc.category ?? "public";

            return (
              <tr key={doc.source}>
                <td className="doc-name">{doc.source}</td>
                <td>
                  <select
                    className="top-k-select doc-category-select"
                    value={category}
                    disabled={isBusy}
                    onChange={(e) =>
                      onCategoryChange(
                        doc.source,
                        e.target.value as DocumentCategory
                      )
                    }
                    aria-label={`Catégorie de ${doc.source}`}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {CATEGORY_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{formatFileSize(doc.file_size_bytes)}</td>
                <td>{doc.chunk_count}</td>
                <td>
                  <span className={`status-pill ${doc.status}`}>
                    {statusLabel(doc.status)}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-ghost doc-action doc-action-danger"
                    disabled={isBusy}
                    onClick={() => onDelete(doc.source)}
                  >
                    {isBusy ? "…" : "Supprimer"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
