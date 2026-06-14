"use client";

import { ServiceStatus } from "@/types";

interface Props {
  status: ServiceStatus;
}

const labels: Record<string, string> = {
  ingestion: "Ingestion",
  search: "Recherche",
};

function Dot({ state }: { state: "ok" | "error" | "loading" }) {
  if (state === "loading")
    return <span className="status-dot loading" aria-label="Chargement" />;
  if (state === "ok")
    return <span className="status-dot ok" aria-label="Opérationnel" />;
  return <span className="status-dot error" aria-label="Erreur" />;
}

export default function StatusBar({ status }: Props) {
  return (
    <div className="status-bar">
      {(["ingestion", "search"] as const).map((key) => (
        <div key={key} className="status-item">
          <Dot state={status[key]} />
          <span className="status-label">{labels[key]}</span>
          <span className={`status-text ${status[key]}`}>
            {status[key] === "loading"
              ? "Vérification…"
              : status[key] === "ok"
              ? "Opérationnel"
              : "Indisponible"}
          </span>
        </div>
      ))}
    </div>
  );
}
