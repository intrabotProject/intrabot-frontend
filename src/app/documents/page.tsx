"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import UploadZone from "@/components/admin/UploadZone";
import { submitDocument } from "@/services/user";
import { DocumentCategory, UserRole } from "@/types";

const ROLE_CATEGORIES: Record<UserRole, DocumentCategory[]> = {
  employee: ["public"],
  engineer: ["public", "engineering"],
  manager: ["public", "engineering", "gouvernance"],
  rh: ["public", "rh"],
  admin: ["public", "engineering", "rh", "gouvernance", "finance"],
};

export default function SubmitDocumentPage() {
  const [allowedCategories, setAllowedCategories] = useState<DocumentCategory[]>(["public"]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setAllowedCategories(ROLE_CATEGORIES[user.role] ?? ["public"]);
    }
  }, []);

  async function handleUploadFile(file: File, category: DocumentCategory) {
    setFeedback(null);
    setError(null);
    const result = await submitDocument(file, category);
    setFeedback(
      `« ${result.source} » soumis avec succès. Un administrateur va l'examiner avant intégration au chatbot.`
    );
  }

  return (
    <div className="chat-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Soumettre un document</h1>
          <p className="page-subtitle">
            Votre document sera examiné par un administrateur avant d&apos;être
            intégré au chatbot.
          </p>
        </div>
      </header>

      <div className="admin-panel" style={{ maxWidth: 700, margin: "2rem auto" }}>
        <section className="admin-section">
          <h2 className="admin-section-title">Ajouter un document</h2>
          <p className="admin-section-hint">
            Choisissez la catégorie correspondant à votre profil puis déposez
            votre fichier. Il sera visible dans le chatbot après validation.
          </p>
          <UploadZone
            onUploadFile={handleUploadFile}
            categoryOptions={allowedCategories}
          />
        </section>

        {feedback && <p className="admin-feedback">{feedback}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
