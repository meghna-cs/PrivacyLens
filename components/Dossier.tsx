"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AnalysisResult, InterestId } from "@/lib/types";
import PreferencesPicker from "./PreferencesPicker";
import ExplainModal from "./ExplainModal";
import InfoModal from "./InfoModal";
import EvidenceBlock from "./EvidenceBlock";
import ActionPanel from "./ActionPanel";
import {
  REVIEW_PRIORITY_METHODOLOGY,
  CONFIDENCE_METHODOLOGY,
  JURISDICTION_NOTE,
  CLARITY_NOTE
} from "@/lib/methodology";

const SECTIONS = [
  { id: "what", label: "What & why" },
  { id: "who", label: "Who gets it" },
  { id: "retention", label: "How long" },
  { id: "unclear", label: "What's unclear" },
  { id: "rights", label: "Your rights & actions" }
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const RISK_STYLES: Record<string, string> = {
  high: "border-rose text-rose",
  medium: "border-amber text-amber",
  low: "border-moss text-moss",
  unclear: "border-ink/30 text-ink/50"
};

const AUDIT_STAMP: Record<string, string> = {
  clear: "text-moss",
  conditional: "text-amber",
  not_identified: "text-ink/45",
  unclear: "text-rose"
};

const AUDIT_LABEL: Record<string, string> = {
  clear: "clear",
  conditional: "conditional",
  not_identified: "not identified",
  unclear: "unclear"
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "priority: high",
  medium: "priority: medium",
  low: "priority: low"
};

function RiskDot({ risk }: { risk: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        risk === "high"
          ? "bg-rose"
          : risk === "medium"
          ? "bg-amber"
          : risk === "low"
          ? "bg-moss"
          : "bg-ink/30"
      }`}
    />
  );
}

const INTEREST_TO_CATEGORY: Record<InterestId, string[]> = {
  location: ["location"],
  advertising: ["advertising", "profiling", "marketing"],
  children: ["children", "minor", "child"],
  financial: ["financial", "payment", "banking"],
  sharing: [],
  retention: []
};

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "";
  }
}

function PrivacyAtGlance({
  result,
  onJump
}: {
  result: AnalysisResult;
  onJump: (id: SectionId) => void;
}) {
  const rightsCount = result.policyRights.filter((r) => r.supported === "yes").length;
  const questionCount = result.openQuestions.length;
  const paragraph = `${result.companyName}'s policy identifies ${result.categories.length} data ${
    result.categories.length === 1 ? "category" : "categories"
  }, ${result.thirdParties.length} recipient ${
    result.thirdParties.length === 1 ? "group" : "groups"
  }, ${result.retention.classification} retention information, and ${rightsCount} policy-described ${
    rightsCount === 1 ? "right" : "rights"
  }. ${
    questionCount > 0
      ? `${questionCount} open ${questionCount === 1 ? "question was" : "questions were"} identified${
          result.openQuestions[0] ? `, including "${result.openQuestions[0].title}"` : ""
        }.`
      : "No additional open questions were identified."
  }`;

  const cards: { title: string; big: string; detail: string; jump: SectionId }[] = [
    {
      title: "Data collected",
      big: `${result.categories.length} ${result.categories.length === 1 ? "category" : "categories"}`,
      detail: result.categories.map((c) => c.label).join(", ") || "None identified",
      jump: "what"
    },
    {
      title: "Data sharing",
      big: `${result.thirdParties.length} ${result.thirdParties.length === 1 ? "group" : "groups"}`,
      detail: result.thirdParties.map((t) => t.recipientType).join(", ") || "No sharing identified",
      jump: "who"
    },
    {
      title: "Retention",
      big: `${result.retention.classification} retention`,
      detail: result.retention.generalPrinciple,
      jump: "retention"
    },
    {
      title: "Open questions",
      big: `${questionCount} ${questionCount === 1 ? "open question" : "open questions"}`,
      detail: result.openQuestions[0]?.title || "None identified",
      jump: "unclear"
    }
  ];

  return (
    <div className="border-b hairline pb-5">
      <h3 className="mb-2 font-serif text-lg font-semibold text-ink">Privacy at a glance</h3>
      <p className="mb-4 font-sans text-sm text-ink/80">{paragraph}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.title}
            onClick={() => onJump(c.jump)}
            className="rounded border hairline bg-paper-dim/30 p-3 text-left transition-colors hover:border-seal"
          >
            <p className="font-sans text-[10px] font-medium uppercase tracking-wide text-ink/55">{c.title}</p>
            <p className="mt-0.5 font-serif text-base font-bold capitalize text-ink">{c.big}</p>
            <p className="mt-1 line-clamp-2 font-sans text-xs text-ink/70">{c.detail}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SnapshotStrip({
  result,
  onJump
}: {
  result: AnalysisResult;
  onJump: (id: SectionId) => void;
}) {
  const stats: { label: string; value: string | number; jump: SectionId }[] = [
    { label: "data categories", value: result.categories.length, jump: "what" },
    { label: "recipient categories", value: result.thirdParties.length, jump: "who" },
    { label: "retention", value: result.retention.classification, jump: "retention" },
    {
      label: "rights this policy describes",
      value: result.policyRights.filter((r) => r.supported === "yes").length,
      jump: "rights"
    },
    { label: "open questions", value: result.openQuestions.length, jump: "unclear" }
  ];
  return (
    <div className="grid grid-cols-2 gap-3 border-b hairline pb-5 sm:grid-cols-5">
      {stats.map((s) => (
        <button
          key={s.label}
          onClick={() => onJump(s.jump)}
          className="rounded text-left transition-opacity hover:opacity-70"
        >
          <p className="font-serif text-2xl font-semibold text-ink">{s.value}</p>
          <p className="font-sans text-[11px] font-medium uppercase tracking-wide text-ink/60 underline decoration-dotted underline-offset-2">
            {s.label}
          </p>
        </button>
      ))}
    </div>
  );
}

export default function Dossier({
  result,
  onReset
}: {
  result: AnalysisResult;
  onReset: () => void;
}) {
  const [activeSection, setActiveSection] = useState<SectionId>("what");
  const [interests, setInterests] = useState<InterestId[]>([]);
  const [explainTarget, setExplainTarget] = useState<{ term: string; context: string } | null>(
    null
  );
  const [infoModal, setInfoModal] = useState<"priority" | "confidence" | "jurisdiction" | "clarity" | null>(
    null
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  function scrollToSection(id: SectionId) {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      { rootMargin: "-110px 0px -65% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [result]);

  const orderedCategories = useMemo(() => {
    if (interests.length === 0) return result.categories;
    const keywords = interests.flatMap((i) => INTEREST_TO_CATEGORY[i]);
    const matches = (label: string) => keywords.some((k) => label.toLowerCase().includes(k));
    const prioritized = result.categories.filter((c) => matches(c.label));
    const rest = result.categories.filter((c) => !matches(c.label));
    return [...prioritized, ...rest];
  }, [interests, result.categories]);

  const availableRights = useMemo(() => {
    const seen = new Set<string>();
    const fromPolicy = result.policyRights
      .filter((r) => r.supported === "yes")
      .filter((r) => {
        if (seen.has(r.rightType)) return false;
        seen.add(r.rightType);
        return true;
      })
      .map((r) => ({
        id: r.rightType,
        label: r.applicability === "global" ? r.name : `${r.name} (region may apply)`
      }));
    return fromPolicy.length > 0 ? fromPolicy : [{ id: "access", label: "Request my data" }];
  }, [result.policyRights]);

  const dataPurposeRows = result.categories.map((category) => ({
    categoryId: category.id,
    data: category.label,
    purpose: category.purposes.join(", ") || "Not identified in the analyzed policy"
  }));

  const dataRecipientRows = result.thirdParties.map((tp, index) => ({
    recipientId: index,
    data: tp.dataInvolved.join(", ") || "Not specified",
    recipient: tp.recipientType
  }));

  const topOpenQuestion = result.openQuestions[0];

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <div className="mb-5 flex items-start justify-between gap-4 border-b hairline pb-5">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-ink/45">Dossier</p>
          <h1 className="font-serif text-2xl font-semibold text-ink">{result.companyName}</h1>
          <p className="mt-2 max-w-xl font-sans text-sm text-ink/80">{result.summary}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 font-sans text-xs text-ink/40">
            {result.policyVersionNote && <span>Policy version: {result.policyVersionNote}</span>}
            {result.analyzedAt && <span>Analyzed: {formatDate(result.analyzedAt)}</span>}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <PrivacyAtGlance result={result} onJump={scrollToSection} />
      </div>

      {topOpenQuestion && (
        <button
          onClick={() => scrollToSection("unclear")}
          className="mb-5 block w-full rounded border border-amber/40 bg-amber/5 px-4 py-3 text-left transition-colors hover:border-amber"
        >
          <p className="font-sans text-xs font-medium text-amber">
            ⚠ {result.openQuestions.length}{" "}
            {result.openQuestions.length === 1 ? "open question" : "open questions"} — {topOpenQuestion.title}
          </p>
          <p className="mt-1 font-sans text-xs text-ink/55">
            {topOpenQuestion.question} · View in &quot;What&apos;s unclear&quot; ↓
          </p>
        </button>
      )}

      <div className="mb-5">
        <SnapshotStrip result={result} onJump={scrollToSection} />
      </div>

      <PreferencesPicker
        selected={interests}
        onChange={setInterests}
        onJump={(sectionId) => scrollToSection(sectionId as SectionId)}
      />

      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        {/* Mobile: sticky horizontal nav */}
        <nav className="sticky top-0 z-30 -mx-6 flex gap-1 overflow-x-auto border-b hairline bg-paper/95 px-6 py-2 backdrop-blur sm:hidden">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 font-sans text-xs ${
                activeSection === s.id
                  ? "border-seal bg-seal text-paper"
                  : "hairline text-ink/55"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Desktop: sticky vertical nav */}
        <nav className="hidden shrink-0 sm:sticky sm:top-16 sm:flex sm:h-fit sm:w-48 sm:flex-col sm:gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              data-active={activeSection === s.id}
              onClick={() => scrollToSection(s.id)}
              className={`folder-tab whitespace-nowrap rounded-sm px-3 py-2 text-left font-sans text-sm ${
                activeSection === s.id ? "bg-paper-dim font-medium text-ink" : "text-ink/55 hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-12">
          {/* WHAT & WHY */}
          <section
            id="what"
            ref={(el) => {
              sectionRefs.current.what = el;
            }}
            className="scroll-mt-20 space-y-4"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">What &amp; why</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setInfoModal("priority")}
                className="font-sans text-xs text-seal-dark hover:underline"
              >
                ⓘ How review priority is determined
              </button>
              <button
                onClick={() => setInfoModal("confidence")}
                className="font-sans text-xs text-seal-dark hover:underline"
              >
                ⓘ How confidence is determined
              </button>
            </div>

            {orderedCategories.map((cat) => (
              <div
                key={cat.id}
                id={`category-${cat.id}`}
                className={`border-l-2 pl-4 ${RISK_STYLES[cat.risk] || RISK_STYLES.unclear}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <RiskDot risk={cat.risk} />
                  <button
                    onClick={() =>
                      setExplainTarget({
                        term: cat.label,
                        context: `Items: ${cat.items.join(", ") || "none identified"}. Purposes: ${
                          cat.purposes.join(", ") || "none stated"
                        }. ${cat.aiSummary}`
                      })
                    }
                    className="font-sans text-sm font-semibold text-ink hover:underline"
                  >
                    {cat.label}
                  </button>
                  <span className="font-sans text-[11px] font-medium uppercase tracking-wide text-ink/60">
                    review priority: {cat.risk}
                  </span>
                </div>
                {cat.items.length > 0 && (
                  <p className="mt-1 font-sans text-sm text-ink/85">
                    <span className="font-medium text-ink/65">Data identified: </span>
                    {cat.items.join(", ")}
                  </p>
                )}
                {cat.purposes.length > 0 && (
                  <p className="mt-1 font-sans text-xs text-ink/75">
                    <span className="font-medium text-ink/65">Stated purposes: </span>
                    {cat.purposes.join(", ")}
                  </p>
                )}
                {cat.whyThisMatters && (
                  <p className="mt-1.5 font-sans text-xs text-ink/75">
                    <span className="font-medium text-ink/65">Why this matters: </span>
                    {cat.whyThisMatters}
                  </p>
                )}
                <div className="mt-2">
                  <EvidenceBlock
                    aiSummary={cat.aiSummary}
                    policyEvidence={cat.policyEvidence}
                    confidence={cat.confidence}
                  />
                </div>
              </div>
            ))}

            {dataPurposeRows.length > 0 && (
              <div className="pt-2">
                <h3 className="mb-2 font-serif text-sm font-semibold text-ink">
                  Data → purpose, at a glance
                </h3>
                <div className="overflow-x-auto rounded border hairline">
                  <table className="w-full font-sans text-xs">
                    <thead>
                      <tr className="border-b hairline bg-paper-dim/40 text-left text-ink/65">
                        <th className="px-3 py-2 font-medium">Data</th>
                        <th className="px-3 py-2 font-medium">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataPurposeRows.map((row, i) => (
                        <tr
                          key={i}
                          role="link"
                          aria-label={`View ${row.data} analysis and stated purpose`}
                          tabIndex={0}
                          onClick={() =>
                            document
                              .getElementById(`category-${row.categoryId}`)
                              ?.scrollIntoView({ behavior: "smooth", block: "center" })
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              document
                                .getElementById(`category-${row.categoryId}`)
                                ?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                          className="cursor-pointer border-b hairline last:border-0 hover:bg-paper-dim/40 focus:bg-paper-dim/40 focus:outline-none"
                        >
                          <td className="px-3 py-2 text-ink/85">{row.data}</td>
                          <td className="px-3 py-2 text-ink/75">{row.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* WHO GETS IT */}
          <section
            id="who"
            ref={(el) => {
              sectionRefs.current.who = el;
            }}
            className="scroll-mt-20 space-y-4"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">Who gets it</h2>
            <div className="flex flex-col items-center gap-2 border hairline bg-paper-dim/30 py-6 font-sans text-sm">
              <span className="rounded border hairline px-3 py-1">You</span>
              <span className="text-ink/30">↓</span>
              <span className="rounded border border-seal px-3 py-1 text-seal-dark">
                {result.companyName}
              </span>
              <span className="text-ink/30">↓</span>
              <div className="flex flex-wrap justify-center gap-2">
                {result.thirdParties.length === 0 && (
                  <span className="rounded border hairline px-3 py-1 text-ink/50">
                    No third-party sharing identified
                  </span>
                )}
                {result.thirdParties.map((tp, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      document
                        .getElementById(`recipient-${i}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="rounded border hairline px-3 py-1 hover:border-seal hover:text-seal-dark"
                  >
                    {tp.recipientType}
                  </button>
                ))}
              </div>
            </div>
            <ul className="space-y-4">
              {result.thirdParties.map((tp, i) => (
                <li key={i} id={`recipient-${i}`} className="scroll-mt-20 border-l-2 border-amber pl-4">
                  <p className="font-sans text-sm font-semibold text-ink">{tp.recipientType}</p>
                  <p className="mt-0.5 font-sans text-xs text-ink/75">{tp.purpose}</p>
                  {tp.dataInvolved.length > 0 && (
                    <p className="mt-1 font-sans text-xs text-ink/70">
                      Data potentially involved: {tp.dataInvolved.join(", ")}
                    </p>
                  )}
                  <div className="mt-2">
                    <EvidenceBlock
                      aiSummary={tp.aiSummary}
                      policyEvidence={tp.policyEvidence}
                      confidence={tp.confidence}
                    />
                  </div>
                </li>
              ))}
            </ul>

            {dataRecipientRows.length > 0 && (
              <div className="pt-2">
                <h3 className="mb-2 font-serif text-sm font-semibold text-ink">
                  Data → recipient, at a glance
                </h3>
                <div className="overflow-x-auto rounded border hairline">
                  <table className="w-full font-sans text-xs">
                    <thead>
                      <tr className="border-b hairline bg-paper-dim/40 text-left text-ink/65">
                        <th className="px-3 py-2 font-medium">Data</th>
                        <th className="px-3 py-2 font-medium">Recipient</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataRecipientRows.map((row, i) => (
                        <tr
                          key={i}
                          role="link"
                          aria-label={`View ${row.recipient} explanation`}
                          tabIndex={0}
                          onClick={() =>
                            document
                              .getElementById(`recipient-${row.recipientId}`)
                              ?.scrollIntoView({ behavior: "smooth", block: "center" })
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              document
                                .getElementById(`recipient-${row.recipientId}`)
                                ?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                          className="cursor-pointer border-b hairline last:border-0 hover:bg-paper-dim/40 focus:bg-paper-dim/40 focus:outline-none"
                        >
                          <td className="px-3 py-2 text-ink/85">{row.data}</td>
                          <td className="px-3 py-2 text-ink/75">{row.recipient}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* HOW LONG */}
          <section
            id="retention"
            ref={(el) => {
              sectionRefs.current.retention = el;
            }}
            className="scroll-mt-20 space-y-4"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">How long</h2>
            <div className="border-l-2 border-seal pl-4">
              <span
                className={`stamp ${
                  result.retention.classification === "specific"
                    ? "text-moss"
                    : result.retention.classification === "conditional"
                    ? "text-amber"
                    : "text-rose"
                }`}
              >
                {result.retention.classification === "conditional"
                  ? "Conditional retention"
                  : result.retention.classification}
              </span>
              <p className="mt-2 font-sans text-xs text-ink/45">General principle</p>
              <div className="mt-1">
                <EvidenceBlock
                  aiSummary={result.retention.generalPrinciple}
                  policyEvidence={result.retention.policyEvidence}
                  confidence={result.retention.confidence}
                />
              </div>

              {result.retention.categoryBreakdown.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 font-sans text-xs text-ink/45">Specific periods identified</p>
                  <div className="overflow-x-auto rounded border hairline">
                    <table className="w-full font-sans text-xs">
                      <thead>
                        <tr className="border-b hairline bg-paper-dim/40 text-left text-ink/65">
                          <th className="px-3 py-2 font-medium">Category</th>
                          <th className="px-3 py-2 font-medium">Retention</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.retention.categoryBreakdown.map((row, i) => (
                          <tr key={i} className="border-b hairline last:border-0">
                            <td className="px-3 py-2 text-ink/85">{row.category}</td>
                            <td className="px-3 py-2 text-ink/75">{row.retention}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="mt-3 font-sans text-xs text-ink/50">
                  No category-specific retention periods were identified — the policy only states
                  its general principle above.
                </p>
              )}

              {result.retention.classification === "conditional" && (
                <p className="mt-3 font-sans text-xs text-ink/50">
                  Specific retention periods are provided for some categories, while other data is
                  retained according to the purposes and conditions described in the policy.
                </p>
              )}
            </div>
          </section>

          {/* WHAT'S UNCLEAR */}
          <section
            id="unclear"
            ref={(el) => {
              sectionRefs.current.unclear = el;
            }}
            className="scroll-mt-20 space-y-4"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">What&apos;s unclear</h2>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-serif text-base font-semibold text-ink">Clarity audit</h3>
                <button
                  onClick={() => setInfoModal("clarity")}
                  className="font-sans text-xs text-seal-dark hover:underline"
                >
                  ⓘ what &quot;clear&quot; means
                </button>
              </div>
              <p className="mb-3 font-sans text-xs text-ink/50">
                {result.clarityAudit.filter((c) => c.status === "clear").length} of{" "}
                {result.clarityAudit.length} areas clear
                {result.retention.classification === "conditional"
                  ? ` · Retention is conditional because ${
                      result.retention.categoryBreakdown.length > 0
                        ? "specific periods are only provided for some categories"
                        : "the policy describes retention by purpose or conditions rather than one universal period"
                    }.`
                  : " · a fixed checklist, not a summary."}
              </p>
              <div className="divide-y hairline border-y hairline">
                {result.clarityAudit.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-3">
                    <div>
                      <p className="font-sans text-sm font-medium text-ink">{item.category}</p>
                      <p className="mt-0.5 font-sans text-xs text-ink/75">{item.note}</p>
                    </div>
                    <span className={`stamp shrink-0 ${AUDIT_STAMP[item.status]}`}>
                      {AUDIT_LABEL[item.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-1 font-serif text-base font-semibold text-ink">Open questions</h3>
              <p className="mb-3 font-sans text-xs text-ink/50">
                {result.openQuestions.length} identified
              </p>
              {result.openQuestions.length === 0 ? (
                <p className="font-sans text-sm text-ink/75">
                  No additional ambiguity noted beyond the audit above.
                </p>
              ) : (
                <div className="space-y-3">
                  {result.openQuestions.map((q, i) => (
                    <div key={i} className="border-l-2 border-rose/50 pl-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-sans text-sm font-semibold text-ink">{q.title}</p>
                        <span className="font-sans text-[11px] font-medium uppercase tracking-wide text-ink/60">
                          {PRIORITY_LABEL[q.priority]}
                        </span>
                      </div>
                      <p className="mt-1 font-sans text-sm text-ink/85">{q.question}</p>
                      <p className="mt-1 font-sans text-xs text-ink/70">
                        <span className="font-medium text-ink/65">Why this remains open: </span>
                        {q.whyOpen}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* RIGHTS & ACTION */}
          <section
            id="rights"
            ref={(el) => {
              sectionRefs.current.rights = el;
            }}
            className="scroll-mt-20 space-y-8"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">Your rights &amp; actions</h2>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="font-serif text-base font-semibold text-ink">
                  What {result.companyName}&apos;s policy says you can do
                </h3>
                <button
                  onClick={() => setInfoModal("jurisdiction")}
                  className="font-sans text-xs text-seal-dark hover:underline"
                >
                  ⓘ why this is separate
                </button>
              </div>
              {result.policyRights.length === 0 ? (
                <p className="font-sans text-sm text-ink/50">
                  The policy text didn&apos;t clearly describe any specific rights or controls.
                </p>
              ) : (
                <ul className="space-y-3">
                  {result.policyRights.map((r, i) => (
                    <li key={i} className="border-l-2 border-seal/40 pl-4">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1">
                          <span className="flex items-center gap-2">
                            <span
                              className={`stamp ${
                                r.supported === "yes"
                                  ? "text-moss"
                                  : r.supported === "no"
                                  ? "text-rose"
                                  : "text-ink/50"
                              }`}
                            >
                              {r.supported}
                            </span>
                            <span className="font-sans text-sm font-medium text-ink">{r.name}</span>
                          </span>
                          <span className="font-sans text-sm text-ink/45 group-open:hidden">+</span>
                          <span className="hidden font-sans text-sm text-ink/45 group-open:inline">−</span>
                        </summary>
                        {r.applicability !== "global" && (
                          <p className="mt-1 font-sans text-xs text-amber">
                            {r.applicability === "regional"
                              ? "Policy ties this to a specific region/law — applicability may depend on where you are."
                              : "The policy doesn't specify who this applies to — applicability may depend on region."}
                          </p>
                        )}
                        <div className="mt-1.5">
                          <EvidenceBlock
                            aiSummary={r.aiSummary}
                            policyEvidence={r.policyEvidence}
                            confidence={r.confidence}
                          />
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <ActionPanel
              companyName={result.companyName}
              availableRights={availableRights}
              openQuestions={result.openQuestions}
            />
          </section>
        </div>
      </div>

      {explainTarget && (
        <ExplainModal
          term={explainTarget.term}
          context={explainTarget.context}
          onClose={() => setExplainTarget(null)}
        />
      )}

      {infoModal === "priority" && (
        <InfoModal
          title="How review priority is determined"
          text={REVIEW_PRIORITY_METHODOLOGY}
          onClose={() => setInfoModal(null)}
        />
      )}
      {infoModal === "confidence" && (
        <InfoModal
          title="How confidence is determined"
          text={CONFIDENCE_METHODOLOGY}
          onClose={() => setInfoModal(null)}
        />
      )}
      {infoModal === "jurisdiction" && (
        <InfoModal
          title="Policy rights vs. jurisdiction rights"
          text={JURISDICTION_NOTE}
          onClose={() => setInfoModal(null)}
        />
      )}
      {infoModal === "clarity" && (
        <InfoModal
          title="What 'clear' means"
          text={CLARITY_NOTE}
          onClose={() => setInfoModal(null)}
        />
      )}
    </div>
  );
}
