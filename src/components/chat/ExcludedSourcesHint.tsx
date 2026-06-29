"use client";

import { SourceChunk } from "@/types";
import SourceList from "./SourceList";

interface Props {
  excluded: SourceChunk[];
  minScore: number;
  onLowerThreshold?: (suggested: number) => void;
}

export default function ExcludedSourcesHint({
  excluded,
  minScore,
  onLowerThreshold,
}: Props) {
  if (excluded.length === 0) return null;

  const bestScore = Math.max(...excluded.map((item) => item.similarity_score));
  const suggested = Math.max(0.1, Math.floor(bestScore * 20) / 20 - 0.05);

  return (
    <div className="excluded-hint">
      <p className="excluded-hint-text">
        {excluded.length === 1
          ? "1 passage trouvé"
          : `${excluded.length} passages trouvés`}{" "}
        mais exclus par votre seuil de pertinence ({Math.round(minScore * 100)}
        %). Meilleur score : {Math.round(bestScore * 100)} %.
      </p>
      {onLowerThreshold && (
        <button
          type="button"
          className="btn-ghost excluded-hint-btn"
          onClick={() => onLowerThreshold(suggested)}
        >
          Baisser le seuil à {suggested.toFixed(2)}
        </button>
      )}
      <SourceList sources={excluded} />
    </div>
  );
}
