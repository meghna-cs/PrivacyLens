import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini, fetchPageText } from "@/lib/gemini";
import { CLARITY_AUDIT_CATEGORIES } from "@/lib/types";
import type { AnalysisResult } from "@/lib/types";

export const maxDuration = 60;

const evidenceFields = {
  aiSummary: {
    type: "string",
    description: "Plain-language paraphrase, in your own words, of what the policy says."
  },
  policyEvidence: {
    type: "string",
    description:
      "A short excerpt (under 30 words) taken from the actual policy text that supports this finding. Empty string if nothing was found."
  },
  confidence: {
    type: "string",
    enum: ["high", "medium", "low"],
    description:
      "'high' if the policy states this explicitly, 'medium' if reasonably implied, 'low' if only indirectly suggested."
  }
};

const SCHEMA = {
  type: "object",
  properties: {
    companyName: { type: "string" },
    summary: {
      type: "string",
      description: "One or two plain-language sentences summarizing the overall data practices."
    },
    policyVersionNote: {
      type: "string",
      description:
        "The policy's own stated 'last updated' or 'effective' date, verbatim if present, else an empty string. Never put dates or version info anywhere else in the output."
    },
    categories: {
      type: "array",
      description:
        "Data categories the policy discusses. You MUST always include an entry for 'Financial information' and an entry for 'Children's data'. For Children's data, inspect the entire source for age limits, prohibitions, and statements about knowingly collecting or processing data about children. If the policy says use/access by children is prohibited or that child data is not knowingly collected, summarize that policy statement and include supporting evidence even when no child data collection is described. Only use the not-identified summary when there is no relevant statement at all. Attribute every claim to the policy.",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          risk: {
            type: "string",
            enum: ["low", "medium", "high", "unclear"],
            description:
              "Fixed rule: 'high' for identity/financial/precise-location/sensitive data or anything shared with third parties or used for advertising with few limits; 'medium' for behavioral/device data with narrower use; 'low' for narrowly collected and used data; 'unclear' if the policy doesn't say enough. This is a review-priority signal, not a risk verdict about the company."
          },
          items: { type: "array", items: { type: "string" } },
          purposes: { type: "array", items: { type: "string" } },
          whyThisMatters: {
            type: "string",
            description:
              "One factual, non-alarmist sentence on what this category practically means for the user — distinct from the policy's stated purpose. E.g. 'This can reveal how you interact with the service, including pages visited and device characteristics.' Empty string if the category has no items identified."
          },
          ...evidenceFields
        },
        required: [
          "id",
          "label",
          "risk",
          "items",
          "purposes",
          "whyThisMatters",
          "aiSummary",
          "policyEvidence",
          "confidence"
        ]
      }
    },
    thirdParties: {
      type: "array",
      items: {
        type: "object",
        properties: {
          recipientType: { type: "string" },
          purpose: { type: "string" },
          dataInvolved: {
            type: "array",
            items: { type: "string" },
            description: "Short list of data categories the policy suggests may reach this recipient."
          },
          ...evidenceFields
        },
        required: ["recipientType", "purpose", "dataInvolved", "aiSummary", "policyEvidence", "confidence"]
      }
    },
    retention: {
      type: "object",
      properties: {
        classification: {
          type: "string",
          enum: ["specific", "conditional", "unclear"]
        },
        generalPrinciple: {
          type: "string",
          description:
            "The policy's overall retention principle in plain language, e.g. 'Personal data is retained no longer than necessary for the purposes it was collected for and to meet legal obligations.'"
        },
        categoryBreakdown: {
          type: "array",
          description:
            "Per-category retention notes where the policy gives them. Use short category labels (e.g. 'Identity verification data', 'Account data', 'Device data'). If the policy gives no category-specific detail, return an empty array rather than inventing one — the UI will note that no universal period was found.",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              retention: { type: "string" }
            },
            required: ["category", "retention"]
          }
        },
        policyEvidence: evidenceFields.policyEvidence,
        confidence: evidenceFields.confidence
      },
      required: ["classification", "generalPrinciple", "categoryBreakdown", "policyEvidence", "confidence"]
    },
    policyRights: {
      type: "array",
      description:
        "Rights or controls the POLICY ITSELF describes (e.g. access, correction, deletion, opt-out of a specific practice). Do not include general statutory rights that the policy doesn't mention — those are handled separately.",
      items: {
        type: "object",
        properties: {
          rightType: {
            type: "string",
            enum: ["access", "correction", "erasure", "optout", "other"],
            description: "Canonical category this right falls under, for grouping in the UI."
          },
          name: {
            type: "string",
            description: "Short display name as the policy frames it, e.g. 'Opt-out of targeted advertising'."
          },
          supported: { type: "string", enum: ["yes", "no", "unclear"] },
          applicability: {
            type: "string",
            enum: ["global", "regional", "unspecified"],
            description:
              "'global' only if the policy states this applies to all users everywhere; 'regional' if the policy ties it to a specific law/region (e.g. a CCPA-style sale/sharing opt-out, GDPR-specific rights); 'unspecified' if the policy doesn't say who it applies to."
          },
          ...evidenceFields
        },
        required: [
          "rightType",
          "name",
          "supported",
          "applicability",
          "aiSummary",
          "policyEvidence",
          "confidence"
        ]
      }
    },
    clarityAudit: {
      type: "array",
      description: `Exactly seven entries, one for each of these fixed categories in this order: ${CLARITY_AUDIT_CATEGORIES.join(
        ", "
      )}. This is a checklist, not a summary — always include all seven even when everything is clear.`,
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: [...CLARITY_AUDIT_CATEGORIES] },
          status: {
            type: "string",
            enum: ["clear", "conditional", "not_identified", "unclear"],
            description:
              "'clear' = policy clearly describes this; 'conditional' = described but with conditions/exceptions; 'not_identified' = policy doesn't appear to address this at all; 'unclear' = mentioned but ambiguous. 'Clear' describes how explicit the policy is, not whether the practice is good."
          },
          note: { type: "string", description: "One short sentence explaining the status." }
        },
        required: ["category", "status", "note"]
      }
    },
    openQuestions: {
      type: "array",
      description:
        "Genuinely ambiguous or gap-flagging points that don't fit neatly into the clarityAudit categories above. Only include real, specific open questions — never dates, version numbers, or company facts. Empty array if none.",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short label, e.g. 'Deletion & backups'." },
          question: {
            type: "string",
            description: "The actual open question, phrased as a question, e.g. 'How are deletion requests handled for residual logs or backups that may persist after account deletion?'"
          },
          whyOpen: {
            type: "string",
            description: "One sentence on why the policy leaves this unresolved."
          },
          priority: {
            type: "string",
            enum: ["high", "medium", "low"],
            description: "How useful/important it would be for the user to get this resolved — not a judgment of the company."
          }
        },
        required: ["title", "question", "whyOpen", "priority"]
      }
    }
  },
  required: [
    "companyName",
    "summary",
    "policyVersionNote",
    "categories",
    "thirdParties",
    "retention",
    "policyRights",
    "clarityAudit",
    "openQuestions"
  ]
};

const SYSTEM_INSTRUCTION = `You are a careful, neutral privacy-policy analyst producing a structured
dossier for a consumer-facing tool. Follow these rules exactly:

- Never invent facts. If the policy doesn't clearly address something, say so explicitly rather
  than guessing.
- For every finding, separate "aiSummary" (your own plain-language paraphrase) from
  "policyEvidence" (a short, under-30-word excerpt of the actual source text). Never put a date,
  version number, or unrelated fact into policyEvidence or aiSummary fields — those belong only in
  "policyVersionNote".
- Always attribute findings to the policy rather than stating them as independently established
  facts, especially negative/absence findings. Prefer phrasing like "the policy states that..." or
  "the policy describes..." over a bare declarative claim.
- The overall summary and every aiSummary must make clear that the statement is what the analyzed
  policy says or describes. Never imply PrivacyLens independently verified enforcement or actual
  company practices.
- "whyThisMatters" is written for the user, not paraphrased from the policy — it explains the
  practical relevance of a data category factually and calmly, without alarmist language and
  without implying anything about how the company actually behaves.
- Do not compute or state an overall privacy score or a verdict like "this company is good/bad for
  privacy." Stay descriptive. "risk"/review-priority levels and clarity-audit "clear" statuses
  describe the text, never the company's conduct.
- For "policyRights", set "applicability" carefully: only use "global" if the policy states the
  right applies to all users everywhere. Region-specific mechanisms — e.g. a "sale/sharing"
  opt-out that echoes CCPA/CPRA language, or a right the policy frames as being for a specific
  jurisdiction (EU/GDPR, California, etc.) — must be marked "regional", even if the policy doesn't
  explicitly restrict who can use it. Use "unspecified" if the policy simply doesn't say.
- For "thirdParties", populate "dataInvolved" with the specific data categories the policy
  suggests may reach that recipient type, drawn from what's already described elsewhere in the
  policy.
- For "retention", separate the policy's general retention principle from any category-specific
  periods it gives. Don't invent per-category periods that aren't in the text — an empty
  "categoryBreakdown" is fine and expected when the policy only states a general principle.
- "categories" must always include entries for "Financial information" and "Children's data" even
  when the policy says nothing about them. For children's data, do not say "no specific information"
  if the policy contains an age-related prohibition or a statement about knowingly collecting or
  processing children's data; accurately summarize and cite that statement without implying
  independently verified enforcement.
- "policyRights" covers ONLY what THIS policy itself describes. Do not list generic statutory
  rights the policy text doesn't actually mention — a separate, jurisdiction-based rights list is
  shown elsewhere in the product, and mixing the two would misrepresent what the company committed
  to versus what a law generally provides.
- "clarityAudit" must always contain exactly the seven fixed categories provided in the schema, in
  order, each with its own status — this is a checklist, not a free-text summary. A conclusion of
  "everything is clear" must be an explicit status per category, never a missing array.
- "openQuestions" entries must be genuine, specific gaps — give each one a short title, the
  question itself, why it's left open, and a priority reflecting how useful it would be to resolve,
  not how serious a problem it represents.
- Output must be valid JSON matching the schema exactly, with no extra commentary.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { policyText, url } = body as { policyText?: string; url?: string };

    let sourceText = policyText?.trim() || "";

    if (!sourceText && url) {
      sourceText = await fetchPageText(url);
    }

    if (!sourceText || sourceText.length < 200) {
      return NextResponse.json(
        {
          error:
            "Please paste the privacy policy text (at least a few paragraphs) or provide a working URL to one."
        },
        { status: 400 }
      );
    }

    const prompt = `Analyze the following privacy policy text and produce the structured dossier
described in your instructions.

PRIVACY POLICY TEXT:
"""
${sourceText.slice(0, 50000)}
"""`;

    const raw = await generateWithGemini(prompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseSchema: SCHEMA,
      thinkingLevel: "medium"
    });

    let parsed: AnalysisResult;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "The analysis came back in an unexpected format. Please try again." },
        { status: 502 }
      );
    }

    const childCategory = parsed.categories.find((category) =>
      /children|child|minor/i.test(`${category.id} ${category.label}`)
    );
    const ageUseRestriction = sourceText.match(
      /\b(?:any\s+)?use or access by anyone under the age of (\d+)\s+is prohibited\b/i
    );
    const noKnowinglyCollect = sourceText.match(
      /\bdo not knowingly collect or process\b[^.]{0,160}\bfrom (?:persons|individuals) under (?:the age of )?(\d+)\b/i
    );
    if (childCategory && (ageUseRestriction || noKnowinglyCollect)) {
      const policyStatements = [
        ageUseRestriction &&
          `that use or access by individuals under ${ageUseRestriction[1]} is prohibited`,
        noKnowinglyCollect &&
          `that it does not knowingly collect or process personal data from individuals under ${noKnowinglyCollect[1]}`
      ].filter(Boolean);
      childCategory.aiSummary = `The analyzed policy states ${policyStatements.join(
        " and "
      )}. These are the policy's stated age restrictions and collection position; PrivacyLens has not independently verified enforcement.`;
    }

    parsed.analyzedAt = new Date().toISOString();

    return NextResponse.json({ result: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
