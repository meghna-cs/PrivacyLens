# PrivacyLens

> Know what they know. Know your options.

PrivacyLens turns long, complicated privacy policies into a clear, actionable dossier that helps users understand what data is being collected, why it is collected, who it is shared with, how long it is retained, what remains unclear, and what rights or next steps are available.

## Links

- 🌐 Live Demo: https://privacy-lens-bb.vercel.app/
- 🎥 Demo Video: https://www.youtube.com/watch?v=MISWJ01PudU
- 🏆 Devpost: https://devpost.com/software/privacylens-biqy56

Built at LexHack 2026.

## What is PrivacyLens?

Privacy policies are often long, technical, and difficult to interpret. PrivacyLens transforms a policy into a structured, plain-language dossier that helps users answer:

- What data is collected?
- Why is it collected?
- Who gets it?
- How long is it kept?
- What remains unclear?
- What rights and options are described?
- What action can I take?

Users can paste a privacy policy directly or provide a URL for analysis.

Instead of giving an overall "privacy score," PrivacyLens focuses on making privacy information understandable, evidence-based, and actionable.

## Features

### 1. What & Why

PrivacyLens identifies the data categories mentioned in a policy and explains:

- What data is collected
- The stated purpose of collection
- Why the information may matter to the user
- A review priority: high, medium, low, or unclear

It also includes a compact data-to-purpose table for quick reference.

### 2. Who Gets It

PrivacyLens maps potential data recipients through an interactive flow. Recipients are clickable and navigate directly to the relevant details.

Each section explains:

- Who receives the data
- What types of data may be involved
- Why the data may be shared
- Supporting policy evidence

### 3. How Long

Retention information is separated into:

- General retention principles
- Specific retention periods explicitly stated in the policy

This prevents general retention language from being misread as a precise policy for every data category.

### 4. What’s Unclear

PrivacyLens performs a structured clarity audit across multiple categories and highlights:

- Areas where the policy is clear
- Areas where information is conditional
- Areas where information is missing or ambiguous
- Questions that may need clarification

Each open question includes a title, the unresolved question, why it remains open, and a priority level.

### 5. Your Rights & Action

PrivacyLens separates two different sources of rights information:

- Company policy: what the policy itself explicitly describes
- Jurisdiction: a general reference based on legal context

The current implementation includes India’s Digital Personal Data Protection Act, 2023 and the DPDP Rules.

The app also includes a request generator that can produce an editable privacy-rights request.

### 6. Evidence, Everywhere

PrivacyLens separates interpretation from source text. Every finding distinguishes between:

- PrivacyLens analysis
- Policy evidence

Each finding includes a confidence level: high, medium, or low.

### 7. Methodology

A dedicated methodology page explains:

- What PrivacyLens analyzes
- What it does not analyze
- How analysis is performed
- Review-priority criteria
- Evidence-confidence criteria
- Clarity criteria
- Jurisdiction handling

### 8. Explain This to Me

Users can click an individual category to receive a short, plain-English explanation powered by Gemini. The explanation is scoped only to the information actually identified in the policy.

### 9. Personalization

Users can choose what matters most to them, such as:

- Location
- Advertising and profiling
- Children’s data
- Financial information
- Third-party sharing
- Retention and deletion

PrivacyLens then reorders and highlights the relevant sections based on those preferences.

## Architecture

```text
User
  │
  ├─ Paste policy
  └─ Provide policy URL
  │
  ▼
Next.js App
  │
  └─ Server-side API routes
       │
       ├─ Analyze policy
       ├─ Explain section
       └─ Draft request
  │
  ▼
Gemini API
  │
  ▼
Structured dossier
```

The Gemini API is called only from server-side API routes, so the API key is never exposed directly to the browser.

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini API
- Next.js API Routes
- Vercel

## Project Structure

```text
app/
  page.tsx                     # Input → dossier state machine
  layout.tsx                   # Fonts and metadata
  methodology/page.tsx         # Methodology page
  api/
    analyze/route.ts           # Policy text/URL → structured dossier
    explain/route.ts           # Plain-language explanation
    draft-request/route.ts     # Rights-request generation

components/
  SiteHeader.tsx              # Branding and navigation
  BackToTop.tsx                # Scroll-to-top button
  Hero.tsx                     # URL / policy text input
  Dossier.tsx                  # Main analysis dossier
  PreferencesPicker.tsx        # Personalization controls
  EvidenceBlock.tsx            # Analysis + evidence blocks
  ExplainModal.tsx             # AI explanation popup
  InfoModal.tsx                # Methodology/jurisdiction information
  ActionPanel.tsx              # Rights + request generator

lib/
  gemini.ts                   # Gemini API client + URL fetching
  types.ts                    # Shared TypeScript types
  dpdpRights.ts               # India DPDP rights reference
  methodology.ts              # Analysis methodology
```

## Local Setup

1. Clone the repository

```bash
git clone https://github.com/arghya29/privacy-lens.git
cd privacy-lens
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```bash
cp .env.example .env.local
```

Then add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

You can obtain a Gemini API key from https://aistudio.google.com/apikey.

Optionally set:

```env
GEMINI_MODEL=gemini-3.8-flash
```

4. Start the development server

```bash
npm run dev
```

Then open http://localhost:3000.

## Deploying to Vercel

1. Push the project to GitHub.
2. Open Vercel and select Add New Project.
3. Import the GitHub repository.
4. Add the environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
5. Deploy.

Alternatively:

```bash
npm install -g vercel
vercel
```

## Deliberately Not Built

PrivacyLens intentionally avoids several features.

- Overall privacy score
- Policy-vs-observed behavior scanning
- Cross-policy comparison
- Multi-jurisdiction rights comparison

## Privacy & Data Handling

PrivacyLens does not use a database. Analysis is generated per request and is not stored by the application.

The Gemini API is accessed through server-side API routes so the API key is never exposed to the browser.

## Limitations

- URL analysis relies on a simple server-side HTML fetch and tag stripping, so policies rendered client-side or protected against bots may not work.
- AI analysis depends on the quality of the provided policy text and the model’s interpretation.
- The DPDP rights reference is a simplified general reference and should not be treated as legal advice.

## Design Philosophy

Privacy policies should not require a law degree to understand.

PrivacyLens is built around a simple idea:

> Know what they know. Know your options.

The goal is not to tell users whether a company is “good” or “bad” with privacy. The goal is to give users enough structured information, evidence, context, and actionable options to make their own decisions.

## Built By

- Arghyadeep Bag — https://github.com/arghya29
- Meghna Dutta — https://github.com/meghna-cs

Built at LexHack 2026.

## Hackathon

- LexHack 2026

## License

This project is licensed under the Apache License 2.0.

See the [LICENSE](LICENSE) file for details.

