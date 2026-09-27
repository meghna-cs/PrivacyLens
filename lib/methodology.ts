export const REVIEW_PRIORITY_METHODOLOGY = `Review priority tells you where to look first — it is
not a judgment of the company. It's assigned from the policy text using a fixed rule, before any
AI-written summary is added:

High
• Highly identifying data (name, government ID, precise location)
• Financial information
• Sensitive account credentials
• Data the policy says is shared with third parties or used for advertising/profiling with few
  stated limits

Medium
• Device or technical information
• Usage/behavioral information
• User-generated content

Low
• Categories where the policy provides little or no specific collection information

"High" means "review this first," not "this company is doing something wrong." PrivacyLens does
not calculate an overall privacy score or rank companies.`;

export const CONFIDENCE_METHODOLOGY = `Evidence confidence is a different concept from review
priority — it's about how directly the policy text supports a finding, not how sensitive the data is:

High confidence — the finding is directly supported by explicit policy language, shown in the
evidence excerpt.
Medium confidence — supported by related but less direct language, or inferred by combining more
than one statement in the policy.
Low confidence — only indirectly suggested by general or vague language.

A "high confidence" label means the text clearly says this — it does not mean PrivacyLens has
verified it against the company's actual practices.`;

export const JURISDICTION_NOTE = `The two lists below come from different places. "What this policy
says" is specific to this company and drawn only from the text you provided. "Privacy rights &
options" is a general reference for the jurisdiction you select, independent of any single
company's policy — it doesn't mean this company's policy specifically grants everything listed.`;

export const CLARITY_NOTE = `"Clear" means the policy provides identifiable information on this
topic — it does not mean the underlying privacy practice is good or favorable. This audit checks
whether something was explained, not whether it should have been done differently.`;
