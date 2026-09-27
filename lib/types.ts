export type RiskLevel = "low" | "medium" | "high" | "unclear";
export type Confidence = "high" | "medium" | "low";
export type ClarityStatus = "clear" | "conditional" | "not_identified" | "unclear";
export type RightType = "access" | "correction" | "erasure" | "optout" | "other";
export type Priority = "high" | "medium" | "low";

/**
 * Every substantive finding carries three separate things, kept visually
 * distinct in the UI so nothing reads as an unsupported claim:
 * - aiSummary: the model's plain-language paraphrase
 * - policyEvidence: a short excerpt of the actual policy text it's based on
 * - confidence: how directly the policy text supports the finding
 */
export interface DataCategory {
  id: string;
  label: string;
  /** Renamed "attention" -> "review priority" in the UI: signals where to
   * look first, not a judgment about the company. */
  risk: RiskLevel;
  items: string[];
  purposes: string[];
  aiSummary: string;
  /** Plain, non-alarmist explanation of practical relevance to the user —
   * distinct from the policy's own stated purpose. */
  whyThisMatters: string;
  policyEvidence: string;
  confidence: Confidence;
}

export interface ThirdPartyShare {
  recipientType: string;
  purpose: string;
  /** Data categories the policy suggests may reach this recipient. */
  dataInvolved: string[];
  aiSummary: string;
  policyEvidence: string;
  confidence: Confidence;
}

export interface RetentionCategoryBreakdown {
  category: string;
  retention: string;
}

export interface RetentionInfo {
  classification: "specific" | "conditional" | "unclear";
  /** The policy's general retention principle, in plain language. */
  generalPrinciple: string;
  /** Per-category retention notes, where the policy gives them — so
   * "specific" doesn't imply every category has a specific period. */
  categoryBreakdown: RetentionCategoryBreakdown[];
  policyEvidence: string;
  confidence: Confidence;
}

export interface PolicyRight {
  rightType: RightType;
  name: string;
  supported: "yes" | "no" | "unclear";
  /** Whether the policy presents this as available everywhere, tied to a
   * specific region/law, or doesn't say. */
  applicability: "global" | "regional" | "unspecified";
  aiSummary: string;
  policyEvidence: string;
  confidence: Confidence;
}

/** One row of the fixed clarity audit — always the same categories, so
 * "nothing unclear" is an explicit, checked conclusion rather than an
 * absence of output. */
export interface ClarityAuditItem {
  category: string;
  status: ClarityStatus;
  note: string;
}

export interface OpenQuestion {
  title: string;
  question: string;
  whyOpen: string;
  priority: Priority;
}

export interface AnalysisResult {
  companyName: string;
  summary: string;
  /** The policy's own stated last-updated/effective date, if present. */
  policyVersionNote: string;
  categories: DataCategory[];
  thirdParties: ThirdPartyShare[];
  retention: RetentionInfo;
  policyRights: PolicyRight[];
  clarityAudit: ClarityAuditItem[];
  openQuestions: OpenQuestion[];
  /** Set client-side when the result is received, not by the model. */
  analyzedAt?: string;
}

export const CLARITY_AUDIT_CATEGORIES = [
  "Data collected",
  "Purpose of collection",
  "Third-party sharing",
  "Retention",
  "Advertising & profiling",
  "User rights & controls",
  "Automated decision-making"
] as const;

export const INTEREST_OPTIONS = [
  { id: "location", label: "Location", section: "what" },
  { id: "advertising", label: "Advertising & profiling", section: "what" },
  { id: "children", label: "Children's data", section: "what" },
  { id: "financial", label: "Financial information", section: "what" },
  { id: "sharing", label: "Third-party sharing", section: "who" },
  { id: "retention", label: "Retention & deletion", section: "retention" }
] as const;

export type InterestId = (typeof INTEREST_OPTIONS)[number]["id"];
