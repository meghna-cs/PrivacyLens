"use client";

import { useEffect, useState } from "react";

export default function ExplainModal({
  term,
  context,
  onClose
}: {
  term: string;
  context: string;
  onClose: () => void;
}) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setExplanation(null);
    setError(null);
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term, context })
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setExplanation(data.explanation);
      })
      .catch(() => !cancelled && setError("Couldn't load an explanation right now."));
    return () => {
      cancelled = true;
    };
  }, [term, context]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-w-md rounded border hairline bg-paper p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="font-serif text-lg font-semibold text-ink">{term}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink/50 hover:text-ink"
          >
            ✕
          </button>
        </div>
        {!explanation && !error && (
          <p className="font-sans text-sm text-ink/50">Thinking this through…</p>
        )}
        {error && <p className="font-sans text-sm text-rose">{error}</p>}
        {explanation && (
          <p className="font-sans text-sm leading-relaxed text-ink/85">{explanation}</p>
        )}
      </div>
    </div>
  );
}
