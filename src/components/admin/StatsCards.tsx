import { CollectionStats } from "@/types";

interface Props {
  stats: CollectionStats;
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: "Documents",
      value: stats.document_count,
      hint: `${stats.indexed_document_count} indexés · ${stats.pending_document_count} en attente`,
    },
    {
      label: "Chunks indexés",
      value: stats.chunk_count,
      hint: `Collection ${stats.collection_name}`,
    },
    {
      label: "Indexés",
      value: stats.indexed_document_count,
      hint: "Prêts pour la recherche",
    },
    {
      label: "En attente",
      value: stats.pending_document_count,
      hint: "Fichiers non encore indexés",
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} className="stats-card">
          <span className="stats-card-label">{card.label}</span>
          <span className="stats-card-value">{card.value}</span>
          <span className="stats-card-hint">{card.hint}</span>
        </div>
      ))}
    </div>
  );
}
