import { SourceChunk } from "@/types";

interface Props {
  sources: SourceChunk[];
}

function scoreColor(score: number) {
  if (score >= 0.85) return "score-high";
  if (score >= 0.65) return "score-mid";
  return "score-low";
}

export default function SourceList({ sources }: Props) {
  if (!sources.length) return null;

  return (
    <div className="source-list">
      <p className="source-heading">Sources ({sources.length})</p>
      {sources.map((s) => (
        <div key={s.chunk_id} className="source-card">
          <div className="source-card-header">
            <span className="source-filename" title={s.filename}>
              {s.filename}
            </span>
            <span className={`source-score ${scoreColor(s.similarity_score)}`}>
              {Math.round(s.similarity_score * 100)}%
            </span>
          </div>
          <p className="source-excerpt">{s.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
