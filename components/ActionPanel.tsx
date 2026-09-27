"use client";

import { useMemo, useState } from "react";
import type { OpenQuestion } from "@/lib/types";
import { DPDP_RIGHTS, DPDP_NOTE } from "@/lib/dpdpRights";

interface RightOption {
  id: string;
  label: string;
}

const JURISDICTION_OPTIONS: RightOption[] = [
  { id: "grievance", label: "Raise a privacy grievance" }
];

const NEXT_STEPS = [
  "Review the draft below and adjust anything that doesn't fit your situation.",
  "Submit it through the company's available privacy or support channel.",
  "Keep a copy of your request and note the date you sent it.",
  "Follow up if you don't hear back within a reasonable time."
];

export default function ActionPanel({
  companyName,
  availableRights,
  openQuestions
}: {
  companyName: string;
  availableRights: RightOption[];
  openQuestions: OpenQuestion[];
}) {
  const options = useMemo(
    () => [...availableRights, ...JURISDICTION_OPTIONS],
    [availableRights]
  );

  const [rightType, setRightType] = useState(options[0]?.id || "access");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [jurisdiction, setJurisdiction] = useState("India (DPDP Act)");
  const [extraDetails, setExtraDetails] = useState("");
  const [includeOpenQuestions, setIncludeOpenQuestions] = useState(openQuestions.length > 0);
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedLabel = options.find((o) => o.id === rightType)?.label || rightType;

  // For a deletion-type request in particular, surfacing an open question the
  // analyzer already found (e.g. residual backups/logs) makes the draft
  // noticeably more useful than a generic template.
  const relevantQuestion =
    (rightType === "erasure" || rightType === "grievance") && includeOpenQuestions
      ? openQuestions[0]
      : undefined;

  const openQuestionRequest = relevantQuestion
    ? rightType === "erasure" &&
      /residual|backups?|logs?|delet/i.test(`${relevantQuestion.title} ${relevantQuestion.question}`)
      ? "Please also clarify whether any residual logs, backups, or other retained copies of my personal data remain following deletion, and, if so, the applicable retention period."
      : `Please also address the following open question identified in the policy analysis: ${relevantQuestion.question}`
    : "";

  async function generate() {
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const combinedDetails = [
        extraDetails.trim(),
        openQuestionRequest
      ]
        .filter(Boolean)
        .join(" ");

      const res = await fetch("/api/draft-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rightType: selectedLabel,
          companyName,
          userName,
          userEmail,
          jurisdiction,
          extraDetails: combinedDetails
        })
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setDraft(data.draft);
    } catch {
      setError("Couldn't generate a draft right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-t hairline pt-6">
        <h3 className="mb-1 font-serif text-lg font-semibold text-ink">
          Privacy rights & options in India
        </h3>
        <p className="mb-4 font-sans text-xs text-ink/50">{DPDP_NOTE}</p>
        <p className="mb-4 font-sans text-xs text-ink/60">
          A right described by applicable law is not necessarily a right explicitly granted by the
          company&apos;s policy.
        </p>
        <ul className="space-y-3">
          {DPDP_RIGHTS.map((r) => (
            <li key={r.id} className="border-l-2 border-seal/50 pl-3">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1">
                  <span className="font-sans text-sm font-medium text-ink">{r.name}</span>
                  <span className="font-sans text-sm text-ink/45 group-open:hidden">+</span>
                  <span className="hidden font-sans text-sm text-ink/45 group-open:inline">−</span>
                </summary>
                <p className="pb-1 font-sans text-sm text-ink/65">{r.description}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t hairline pt-6">
        <h3 className="mb-3 font-serif text-lg font-semibold text-ink">
          Draft a request to {companyName}
        </h3>
        <p className="mb-3 font-sans text-xs text-ink/50">
          The options below are drawn from what {companyName}&apos;s own policy describes, plus a
          general jurisdiction-level grievance option that applies regardless of what the policy
          says.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block font-sans text-xs text-ink/60">
            What do you want to request?
            <select
              value={rightType}
              onChange={(e) => setRightType(e.target.value)}
              className="mt-1 w-full rounded border hairline bg-paper-dim/50 px-3 py-2 font-sans text-sm text-ink"
            >
              <optgroup label={`Based on ${companyName}'s policy`}>
                {availableRights.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Based on jurisdiction">
                {JURISDICTION_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="block font-sans text-xs text-ink/60">
            Jurisdiction context
            <input
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="mt-1 w-full rounded border hairline bg-paper-dim/50 px-3 py-2 font-sans text-sm text-ink"
            />
          </label>
          <label className="block font-sans text-xs text-ink/60">
            Your name (optional)
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 w-full rounded border hairline bg-paper-dim/50 px-3 py-2 font-sans text-sm text-ink"
            />
          </label>
          <label className="block font-sans text-xs text-ink/60">
            Your email (optional)
            <input
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="mt-1 w-full rounded border hairline bg-paper-dim/50 px-3 py-2 font-sans text-sm text-ink"
            />
          </label>
          <label className="block font-sans text-xs text-ink/60 sm:col-span-2">
            Anything else to include (optional)
            <textarea
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border hairline bg-paper-dim/50 px-3 py-2 font-sans text-sm text-ink"
            />
          </label>
        </div>

        {openQuestions.length > 0 && (rightType === "erasure" || rightType === "grievance") && (
          <label className="mt-3 flex items-start gap-2 font-sans text-xs text-ink/60">
            <input
              type="checkbox"
              checked={includeOpenQuestions}
              onChange={(e) => setIncludeOpenQuestions(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Also include the analysis question: &quot;{openQuestions[0].title}&quot;
            </span>
          </label>
        )}

        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 rounded bg-seal px-5 py-2 font-sans text-sm font-medium text-paper hover:bg-seal-dark disabled:opacity-50"
        >
          {loading ? "Drafting…" : draft ? "Regenerate" : "Generate draft"}
        </button>

        {error && <p className="mt-3 font-sans text-sm text-rose">{error}</p>}

        {draft && (
          <div className="mt-5 border hairline bg-paper-dim/40 p-4">
            <p className="mb-2 font-sans text-xs font-medium text-ink/50">
              Your draft — feel free to edit it before sending
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={10}
              className="w-full resize-y rounded border hairline bg-paper px-3 py-2 font-sans text-sm text-ink/85"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(draft);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="rounded border hairline px-3 py-1.5 font-sans text-xs text-ink/70 hover:border-seal hover:text-seal"
              >
                {copied ? "Copied" : "Copy draft"}
              </button>
              <button
                onClick={generate}
                disabled={loading}
                className="rounded border hairline px-3 py-1.5 font-sans text-xs text-ink/70 hover:border-seal hover:text-seal"
              >
                Regenerate
              </button>
              <button
                onClick={() => setDraft(null)}
                className="rounded border hairline px-3 py-1.5 font-sans text-xs text-ink/70 hover:border-rose hover:text-rose"
              >
                Start over
              </button>
            </div>
            <p className="mt-2 font-sans text-xs text-ink/40">
              This is a starting draft, not legal advice — review it before sending.
            </p>

            <div className="mt-5 border-t hairline pt-4">
              <p className="mb-2 font-sans text-xs font-medium text-ink/50">What happens next</p>
              <ol className="list-decimal space-y-1 pl-4 font-sans text-xs text-ink/60">
                {NEXT_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
