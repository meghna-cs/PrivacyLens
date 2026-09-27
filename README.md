## Build at 
- LexHack 2026 Hackathon
## Build by
- Arghyadeep Bag (@arghya29)
- Meghna Dutta (@meghna-cs)

# PrivacyLens

"Know what they know. Know your options."

Paste a privacy policy (or point PrivacyLens at a URL), and it produces a
plain-language dossier: what data is collected and why, who it's shared
with, how long it's kept, what's left unclear, and — the differentiating
part — what rights you have and a ready-to-edit draft request you can send.

This was scoped from a hackathon research memo (see the reasoning behind
what's built vs. skipped below). It deliberately does **not** try to be a
privacy-policy summarizer, a policy comparison tool, or a tracker scanner —
those spaces are already well covered by ToS;DR, ProPolisis, the Harvard
Transparency Hub, and Blacklight/εxodus respectively. It focuses on turning
a policy into something actionable for the person reading it.

## What's built

0. **A continuous, navigable dossier** — all five sections render on one
   scrollable page with a sticky section nav (vertical sidebar on desktop,
   horizontal scroll bar on mobile) that highlights the section you're in
   and jumps on click. A "Privacy at a glance" summary and a set of
   clickable headline stats sit at the top, both of which scroll you
   straight to the relevant section — along with the category chips, which
   now do the same. A small "+ New search" and a "Methodology" link live in
   a persistent site header, and a "↑ Top" button appears once you've
   scrolled.
1. **What & why** — data categories the policy mentions (always including
   Financial information and Children's data, explicitly marked "not
   identified" when the policy is silent on them), the stated purpose for
   each, a plain-language "why this matters" note, and a rule-based
   **review priority** (high / medium / low / unclear) — deliberately not
   called "attention," since that read as a risk judgment of the company.
   A compact "data → purpose" table sits at the end of the section.
2. **Who gets it** — a flow diagram whose recipient boxes are clickable and
   jump to the matching detail card, a breakdown of what data each
   recipient may receive and why, and a "data → recipient" table.
3. **How long** — retention split into a general principle and any
   category-specific periods the policy actually gives, so "specific"
   classification doesn't imply every category has a specific period.
4. **What's unclear** — a fixed seven-category clarity audit with an
   explicit "what 'clear' means" explainer (it describes the text, not the
   practice), plus structured open-question cards (title, question, why
   it's open, and a priority reflecting how useful it'd be to resolve —
   not a judgment of the company). The top open question is surfaced right
   below the header, before you have to scroll for it.
5. **Your rights & action**, split into two clearly separate things:
   - what *this company's policy itself* describes, each tagged with
     whether it's global or region-specific, and
   - a general jurisdiction reference (India's DPDP Act 2023 / 2025
     Rules), shown independently.
   The request generator groups its dropdown into "Based on {company}'s
   policy" vs. "Based on jurisdiction," auto-suggests including an open
   question the analysis flagged when relevant (e.g. asking about backups
   on a deletion request), and produces an **editable** draft with copy,
   regenerate, and start-over controls, followed by a short "what happens
   next" checklist.
6. **Evidence, everywhere** — every finding separates "PrivacyLens
   analysis" from "Policy evidence," with its own confidence level
   (high/medium/low) and a dedicated methodology explainer, kept visually
   and conceptually distinct from review priority.
7. **A methodology page** (`/methodology`) — what PrivacyLens analyzes,
   what it doesn't do, how an analysis runs, and the review-priority and
   confidence criteria spelled out in full.
8. **Explain this to me** — click any category to get a short, plain-English
   explanation via Gemini, scoped strictly to what was actually found.
9. **Personalization** — pick what you care about and the dossier reorders
   and jumps to the relevant section.

### Deliberately left out (see the research memo)

- An overall privacy score or a "good/bad" verdict — too subjective to
  defend.
- Policy-vs-observed-behavior scanning (à la Blacklight) — needs real
  browser-based tracker detection infrastructure, not just an LLM call;
  intentionally deferred until the analysis/evidence/rights layer above is
  solid, per the v2 review.
- Cross-policy comparison and historical policy-change tracking — Harvard's
  Transparency Hub already does this at scale.
- A full multi-jurisdiction rights picker (EU/US/etc.) — only India's DPDP
  is implemented for now; the UI is structured so more can be added later
  without touching the policy-analysis side.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Google Gemini API for analysis, plain-language explanations, and draft
  request generation — called only from server-side API routes, so your
  API key is never exposed to the browser
- No database — everything is generated per request; nothing is stored

## Local setup

```bash
npm install
cp .env.example .env.local
# edit .env.local and add your GEMINI_API_KEY (from https://aistudio.google.com/apikey)
npm run dev
```

Visit http://localhost:3000.

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, "Add New Project" → import the repo (Next.js is auto-detected).
3. Under **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` — your Gemini API key
   - `GEMINI_MODEL` — optional, defaults to `gemini-3.8-flash`
4. Deploy. No other configuration is required.

Alternatively, from the project folder:

```bash
npm i -g vercel
vercel
```

and follow the prompts (it will ask you to set the same environment
variables).

## Project structure

```
app/
  page.tsx              # input → dossier state machine
  layout.tsx            # fonts, metadata
  methodology/page.tsx   # static methodology page
  api/
    analyze/route.ts     # policy text/URL → structured JSON dossier
    explain/route.ts      # plain-language explanation of one item
    draft-request/route.ts # generates a draft rights-request email
components/
  SiteHeader.tsx          # branding, methodology link, "+ New search"
  BackToTop.tsx           # floating scroll-to-top button
  Hero.tsx              # URL / paste-text input
  Dossier.tsx           # continuous-scroll dossier with sticky scroll-spy nav
  PreferencesPicker.tsx # "what matters to you" chips that jump + reorder
  EvidenceBlock.tsx      # AI summary + confidence + policy-evidence toggle
  ExplainModal.tsx       # on-demand AI explanation popup
  InfoModal.tsx          # static (non-AI) methodology/jurisdiction popups
  ActionPanel.tsx        # DPDP rights reference + editable draft-request generator
lib/
  gemini.ts             # Gemini API client + URL text fetcher
  types.ts              # shared TypeScript types
  dpdpRights.ts          # static India DPDP Act rights reference
  methodology.ts         # static text for review priority, confidence, jurisdiction, clarity
```

## Notes and honest limitations

- URL fetching does a simple server-side HTML fetch + tag-strip. Sites that
  render their policy via client-side JavaScript, or that block bots, won't
  work — paste the text instead in that case.
- The analysis is only as good as the policy text and the model's reading
  of it. It's a starting point for understanding your options, not a
  substitute for reading the policy or getting legal advice — the app says
  this in its footer and in the rights panel on purpose.
- The DPDP rights reference is a simplified, general summary and will need
  a review pass against the current Rules before being presented as
  authoritative in a real submission.
