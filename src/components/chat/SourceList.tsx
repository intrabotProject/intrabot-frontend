"use client";

import { useState } from "react";
import { SourceChunk } from "@/types";

interface Props {
  sources: SourceChunk[];
}

export default function SourceList({ sources }: Props) {
  const [open, setOpen] = useState(false);

  if (!sources.length) return null;

  return (
    <div className="source-list">
      <button
        type="button"
        className="source-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="source-toggle-icon">{open ? "▾" : "▸"}</span>
        {open ? "Masquer" : "Voir"} les sources consultées ({sources.length})
      </button>

      {open && (
        <div className="source-cards">
          {sources.map((s) => (
            <div key={s.chunk_id} className="source-card">
              <p className="source-filename">{s.filename}</p>
              <p className="source-excerpt">{s.excerpt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
