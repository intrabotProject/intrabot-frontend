"use client";

import { useRef, useState } from "react";

import { CATEGORY_LABELS } from "@/lib/access";
import { isSupportedDocument } from "@/services/admin";
import { DocumentCategory } from "@/types";

export interface UploadProgress {
  current: number;
  total: number;
  fileName: string;
}

interface Props {
  onUploadFile: (file: File, category: DocumentCategory) => Promise<void>;
  disabled?: boolean;
}

const CATEGORY_OPTIONS: DocumentCategory[] = [
  "public",
  "engineering",
  "rh",
  "gouvernance",
  "finance",
];

export default function UploadZone({ onUploadFile, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [category, setCategory] = useState<DocumentCategory>("public");

  async function handleFiles(fileList: FileList | File[]) {
    setError(null);
    const files = Array.from(fileList);
    const supported = files.filter(isSupportedDocument);
    const rejected = files.length - supported.length;

    if (supported.length === 0) {
      setError(
        "Aucun format supporté. Utilisez PDF, DOCX, PPTX, HTML, MD ou TXT."
      );
      return;
    }

    setUploading(true);
    const failures: string[] = [];

    for (let index = 0; index < supported.length; index += 1) {
      const file = supported[index];
      setProgress({
        current: index + 1,
        total: supported.length,
        fileName: file.name,
      });

      try {
        await onUploadFile(file, category);
      } catch (err) {
        failures.push(
          err instanceof Error ? err.message : `Échec pour ${file.name}`
        );
      }
    }

    setUploading(false);
    setProgress(null);

    if (failures.length > 0) {
      setError(failures.join(" · "));
    } else if (rejected > 0) {
      setError(
        `${supported.length} fichier(s) traité(s). ${rejected} ignoré(s) (format non supporté).`
      );
    }
  }

  async function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length > 0) await handleFiles(files);
    event.target.value = "";
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;

    const files = event.dataTransfer.files;
    if (files.length > 0) await handleFiles(files);
  }

  const progressPercent = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="upload-zone-wrap">
      <div className="upload-category-row">
        <label htmlFor="upload-category" className="top-k-label">
          Catégorie d&apos;accès
        </label>
        <select
          id="upload-category"
          className="top-k-select"
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          disabled={disabled || uploading}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {CATEGORY_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`upload-zone ${dragging ? "dragging" : ""} ${
          disabled || uploading ? "disabled" : ""
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!disabled && !uploading) inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="upload-input"
          accept=".pdf,.docx,.pptx,.html,.md,.txt"
          multiple
          onChange={handleInputChange}
          disabled={disabled || uploading}
        />
        {uploading && progress ? (
          <>
            <div className="spinner upload-spinner" aria-label="Traitement en cours" />
            <p className="upload-title">
              Traitement {progress.current}/{progress.total} — {progress.fileName}
            </p>
            <div className="upload-progress-track">
              <div
                className="upload-progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="upload-subtitle">
              Analyse, découpage et intégration au chatbot…
            </p>
          </>
        ) : (
          <>
            <p className="upload-title">Déposer un ou plusieurs documents</p>
            <p className="upload-subtitle">
              PDF, DOCX, PPTX, HTML, MD, TXT — catégorie : {CATEGORY_LABELS[category]}
            </p>
          </>
        )}
      </div>
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}
