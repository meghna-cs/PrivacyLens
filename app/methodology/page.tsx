import SiteHeader from "@/components/SiteHeader";
import {
  REVIEW_PRIORITY_METHODOLOGY,
  CONFIDENCE_METHODOLOGY
} from "@/lib/methodology";

const STEPS = [
  "Extract the policy text (from a pasted excerpt or a fetched URL)",
  "Identify the data categories it discusses",
  "Map the stated purpose for each category",
  "Identify third-party recipient categories",
  "Identify retention statements — general principle and any category-specific periods",
  "Identify rights or controls the policy itself describes",
  "Run a fixed seven-category clarity audit",
  "Flag genuine open questions that don't fit the audit categories",
  "Attach a short evidence excerpt to every finding",
  "Assign a confidence level to every finding"
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader showNewSearch={false} />
      <div className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-serif text-3xl font-semibold text-ink">Methodology</h1>
        <p className="mt-3 font-sans text-sm text-ink/70">
          PrivacyLens turns a privacy policy into a structured dossier using Google's Gemini
          model, guided by a fixed schema and a set of rules aimed at keeping every finding
          traceable back to the source text.
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-ink">What PrivacyLens analyzes</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 font-sans text-sm text-ink/75">
            <li>Data categories collected and their stated purposes</li>
            <li>Third-party recipient categories and what data may reach them</li>
            <li>Retention principles and any category-specific periods</li>
            <li>Rights and controls the policy itself describes, and whether they read as global or region-specific</li>
            <li>Advertising, profiling, and automated decision-making, where addressed</li>
            <li>A fixed clarity audit across seven topics, plus any other open questions</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-ink">What it does not do</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 font-sans text-sm text-ink/75">
            <li>Independently verify a company's actual data practices</li>
            <li>Determine legal compliance with any law or regulation</li>
            <li>Guarantee completeness — a policy can omit things this tool won't know to ask about</li>
            <li>Provide legal advice, or calculate an overall "privacy score"</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-ink">How an analysis runs</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 font-sans text-sm text-ink/75">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-ink">Review priority</h2>
          <p className="mt-3 whitespace-pre-line font-sans text-sm leading-relaxed text-ink/75">
            {REVIEW_PRIORITY_METHODOLOGY}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-ink">Evidence confidence</h2>
          <p className="mt-3 whitespace-pre-line font-sans text-sm leading-relaxed text-ink/75">
            {CONFIDENCE_METHODOLOGY}
          </p>
        </section>

        <section className="mt-10 border-t hairline pt-6">
          <p className="font-sans text-xs text-ink/45">
            Policy evidence excerpts are short quotations from the text you provided, shown
            separately from PrivacyLens's own analysis so the two are never mistaken for each
            other. Everything on this page describes the current version of the tool and may
            change as it develops.
          </p>
        </section>
      </div>
    </main>
  );
}
