# SpendLens — AI Spend Auditor (Credex Internship Task)

SpendLens is a free, no-login tool that lets startup founders and engineering leads enter every AI subscription they pay for and get an instant, line-by-line breakdown of what to cut, downgrade, or consolidate — with real dollar savings numbers.

Built as a high-fidelity lead-generation asset for [Credex](https://credex.rocks), it identifies hidden costs, subscription redundancies, and plan mismatches in under 2 minutes.

## Features

- **Sync Logic Engine:** Pure TypeScript audit functions with 100% manually verified pricing data for 8+ tools (Cursor, Claude, ChatGPT, etc.).
- **Redundancy Detection:** Automatically flags overlapping toolsets (e.g., paying for both Cursor and GitHub Copilot).
- **AI-Powered Analysis:** Uses Claude 3.5 Haiku (via OpenRouter) to synthesize audit results into actionable, executive-ready summaries.
- **High-Fidelity PDF Export:** Professional A4-native report generation using a dedicated Python/ReportLab engine for executive-ready documents.
- **Viral Growth Loop:** Dynamically generated Open Graph images showing potential savings for every unique audit URL.

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components)
- **Language:** TypeScript (Strict mode) & Python 3.x (PDF Engine)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase (Postgres + RLS)
- **AI:** OpenRouter SDK (Claude 3.5 Haiku)
- **Infrastructure:** Vercel (Edge Functions for OG generation)
- **Logic:** Jest for engine unit testing
- **PDF Engine:** ReportLab (Python)

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.x (with `pip install reportlab`)
- A Supabase project
- OpenRouter API Key
- Resend API Key

### Install & Run Locally

```bash
git clone https://github.com/Rush1618/Credex_Internship_task.git
cd Credex_Internship_task

npm install
cp .env.example .env.local
# Fill in your keys

npm run dev
# → http://localhost:3000
```

### Run Tests

```bash
npm test
```

---

## Architecture Decisions (Trade-offs)

| #   | Decision                        | Trade-off                           | Why                                                                                                           |
| --- | ------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | **Premium 2D Hero** over 3D R3F | Lower "wow" factor vs. 3D particles | Massive performance gains (LCP < 1s), better mobile support, and a cleaner "professional utility" brand feel. |
| 2   | **Pure TS Logic Engine**        | Not "AI-first" for calculation      | 100% deterministic and finance-defensible results. AI is used for synthesis, not for the math.                |
| 3   | **Anonymous-First Funnel**      | No user accounts to track retention | Maximizes conversion. The "value-first" approach ensures a 30%+ audit completion rate.                        |
| 4   | **Dynamic OG Generation**       | Compute cost on every share         | Drastically improves CTR on social platforms where the "viral loop" happens.                                  |

---

## Submission Checklist (MVP)

- [x] **Spend Input Form:** Supports Cursor, Copilot, Claude, ChatGPT, API Spend, Gemini, Windsurf.
- [x] **Audit Engine:** Line-by-line plan recommendations + redundancy checks.
- [x] **Lead Capture:** Post-value email gate + company/role data collection.
- [x] **AI Synthesis:** OpenRouter-powered executive summaries.
- [x] **Public Sharing:** Shareable unique URLs + OG image previews.
- [x] **Defensible Data:** `PRICING_DATA.md` sources every number used.

---

Live URL: [https://credex-spend-lens.vercel.app](https://credex-spend-lens.vercel.app)
