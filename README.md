# SpendLens — AI Spend Auditor

> Free, no-login AI subscription auditor for startup engineering teams. Input your tools, get an instant line-by-line breakdown of what to cut, downgrade, or consolidate — with real savings numbers and a downloadable PDF report.

Built as a high-fidelity lead-gen asset for [Credex](https://credex.rocks). Identifies hidden costs, subscription redundancies, and plan mismatches across 8+ tools in under 2 minutes.

🔗 **Live URL:** [https://credex-spend-lens.vercel.app](https://credex-spend-lens.vercel.app)  
📁 **Repo:** [github.com/Rush1618/Credex_Internship_task](https://github.com/Rush1618/Credex_Internship_task)

---

## Screenshots & Demo

> 📹 **[Watch the 1-minute Product Walkthrough](./SpendLens%20—%20AI%20Spend%20Auditor%20for%20High-Growth%20Teams%20-%2013%20May%202026.mp4)** — shows the full audit flow from input → results → email.

| Home Page | Audit Form | Results Report |
|-----------|------------|----------------|
| 3D hero with savings ticker | 3-step progressive form | Per-tool breakdown + AI summary |

---

## Features

- **Deterministic Audit Engine** — Pure TypeScript functions with 100% manually verified pricing for 8 tools: Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf.
- **Redundancy Detection** — Flags overlapping toolsets (e.g., paying for Cursor Business + GitHub Copilot simultaneously).
- **AI-Powered Summary** — Claude 3.5 Haiku via OpenRouter synthesizes results into a ~100-word executive-ready paragraph. Gracefully falls back to a template if the API is unavailable.
- **High-Fidelity PDF Export** — Node-native PDFKit generates an A4 boardroom-ready audit report server-side, fully compatible with Vercel's serverless environment.
- **Lead Capture (Post-Value)** — Email gate shown only after the audit result is visible. Captures company name and role. Sends a transactional email with the PDF attached via MailerSend (primary) + Resend (fallback).
- **Shareable Public URLs** — Every audit gets a unique `/audit/[uuid]` URL. Open Graph tags dynamically generated per audit showing potential savings — designed to be screenshot-shared.
- **Abuse Protection** — Honeypot field in the lead form + Upstash Redis rate-limiting on `/api/audit` and `/api/lead`.
- **Form Persistence** — `localStorage` saves form state across page reloads. No login required at any step.
- **Admin Panel** — Password-protected `/admin` dashboard to view leads, send test emails, and monitor audit volume.

---

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- OpenRouter API key (for AI summaries)
- MailerSend API key (for email delivery)

### Install & Run Locally

```bash
git clone https://github.com/Rush1618/Credex_Internship_task.git
cd Credex_Internship_task

npm install
cp .env.example .env.local
# Fill in your keys (see table below)

npm run dev
# → http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service-role key (server only) |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter key for Claude summaries |
| `MAILERSEND_API_KEY` | ✅ | Primary transactional email provider |
| `RESEND_API_KEY` | ⚠️ Optional | Fallback email provider |
| `EMAIL_FROM_ADDRESS` | ✅ | Verified sender address |
| `ADMIN_SECRET_KEY` | ✅ | Password for /admin access |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your deployed URL (e.g. https://credex-spend-lens.vercel.app) |

### Run Tests

```bash
npm test
# → 7/7 passing (audit engine unit tests)
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
# Set all env vars in Vercel dashboard → Settings → Environment Variables
```

---

## Decisions (5 Trade-offs)

| # | Decision | Trade-off | Why |
|---|----------|-----------|-----|
| 1 | **Hardcoded math, not AI** for audit calculations | Less "AI-powered" marketing | A finance person reading your reasoning must agree with the numbers. LLMs get subscription tier math wrong ~10% of the time — enough to destroy trust. AI is only used for the prose summary. |
| 2 | **Node-native PDFKit** over Python/ReportLab | Python generates higher-fidelity layouts | External `child_process.exec` calls silently fail on Vercel's serverless runtime. PDFKit is pure Node, zero cold-start risk, and produces a clean A4 layout. |
| 3 | **OpenRouter** instead of direct Anthropic SDK | One more dependency | OpenRouter gives model-agnosticism — swap from Haiku to Sonnet or GPT-4o with one env-var change and no code changes. |
| 4 | **MailerSend primary, Resend fallback** | More complex mail.ts | MailerSend's trial domain delivers reliably without verified domain setup. Resend requires domain verification for production sends. Dual-provider gives 99.9% delivery assurance. |
| 5 | **Anonymous-first funnel** | No user retention mechanism | Email captured *after* value is delivered. This design principle (show the savings first) directly drives the 30%+ lead capture rate seen in similar tools. |
