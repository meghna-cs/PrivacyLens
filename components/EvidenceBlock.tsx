const CONFIDENCE_LABEL: Record<string, string> = {
  high: "high confidence",
  medium: "medium confidence",
  low: "low confidence"
};

export default function EvidenceBlock({
  aiSummary,
  policyEvidence,
  confidence
}: {
  aiSummary: string;
  policyEvidence: string;
  confidence: string;
}) {
  return (
    <div>
      <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-ink/60">
        PrivacyLens analysis
      </p>
      <p className="font-sans text-sm text-ink/85">{aiSummary}</p>
      <details className="mt-1.5 group">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 font-sans text-xs text-seal-dark hover:underline">
          <span className="transition-transform group-open:rotate-90">›</span>
          View policy evidence
          <span className="ml-1 font-medium text-ink/60">
            &middot; evidence confidence: {CONFIDENCE_LABEL[confidence] || confidence}
          </span>
        </summary>
        <div className="mt-2 border-l-2 border-ink/25 bg-paper-dim/70 py-2 pl-3">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-ink/60">
            Policy evidence
          </p>
          <blockquote className="mt-1 font-sans text-sm italic leading-relaxed text-ink/75">
            {policyEvidence?.trim()
              ? `"${policyEvidence.trim()}"`
              : "No specific excerpt was available for this finding."}
          </blockquote>
        </div>
      </details>
    </div>
  );
}
