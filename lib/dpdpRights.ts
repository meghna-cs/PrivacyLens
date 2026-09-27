export interface DpdpRight {
  id: string;
  name: string;
  description: string;
}

/**
 * General reference summary of rights described under India's Digital
 * Personal Data Protection Act, 2023 and the DPDP Rules, 2025.
 * This is static reference material, independent of any single company's
 * policy — always shown alongside the policy-specific findings.
 * This is a simplified guide, not legal advice.
 */
export const DPDP_RIGHTS: DpdpRight[] = [
  {
    id: "know",
    name: "Right to know",
    description:
      "You can ask a company for a summary of what personal data it holds about you and what it's being used for."
  },
  {
    id: "access",
    name: "Right to access",
    description:
      "You can request a copy of the personal data a company has collected about you, along with related processing details."
  },
  {
    id: "correction",
    name: "Right to correction & updating",
    description:
      "You can ask a company to correct inaccurate data or update outdated information it holds about you."
  },
  {
    id: "erasure",
    name: "Right to erasure",
    description:
      "You can request deletion of your personal data once it's no longer needed for the purpose it was collected for, subject to legal exceptions."
  },
  {
    id: "grievance",
    name: "Right to grievance redressal",
    description:
      "Companies must provide a way to raise privacy complaints, and you can escalate unresolved issues to the Data Protection Board of India."
  },
  {
    id: "nominate",
    name: "Right to nominate",
    description:
      "In specified circumstances, such as incapacity or death, you can nominate another person to exercise your data rights on your behalf."
  }
];

export const DPDP_NOTE =
  "General reference for this jurisdiction, based on India's DPDP Act, 2023 and its 2025 Rules — not legal advice, and not a claim about what any specific company's policy grants.";
