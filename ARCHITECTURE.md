# Architecture — SpendLens

## System Diagram

```mermaid
graph TB
    subgraph Browser["Browser (Client)"]
        F[SpendForm\nReact Client Component]
        LC[LeadCapture Form\nReact Client Component]
        AR[AuditResults\nReact Client Component]
    end

    subgraph NextJS["Next.js 14 App Router (Vercel Edge/Node)"]
        HP[/ — page.tsx\nServer Component]
        AP[/audit/uuid — page.tsx\nServer Component]
        AAPI[/api/audit\nRoute Handler]
        LAPI[/api/lead\nRoute Handler]
        AE[audit-engine.ts\nPure TS Functions]
    end

    subgraph External["External APIs"]
        OR[OpenRouter SDK\nClaude 3.5 Haiku]
        RS[Resend API\nTransactional Email]
    end

    subgraph Supabase["Supabase (Postgres + RLS)"]
        AT[(audits table\nPublic read, no PII)]
        LT[(leads table\nService-role only)]
    end

    F -->|POST auditInput + auditResult| AAPI
    AAPI -->|runAudit called client-side first| AE
    AAPI -->|sends prompt| OR
    OR -->|returns synthesis| AAPI
    AAPI -->|INSERT uuid + result + ai_summary| AT
    AAPI -->|returns uuid| F
    F -->|router.push /audit/uuid| AP
    AP -->|SELECT by uuid| AT
    AP --> AR
    AR --> LC
    LC -->|POST email + companyName + role| LAPI
    LAPI -->|INSERT| LT
    LAPI -->|send audit report link| RS
```

---

## Data Flow: Input → Audit Result

1. **User fills SpendForm** (client, `SpendForm/index.tsx`)  
   Selects tools, plan, monthly spend, and seat count. Draft persisted to `localStorage` on every keystroke.

2. **"Run audit" clicked** → `runAudit(input)` executes **in the browser** (pure TS, no network).  
   Returns `AuditResult` with per-tool `ToolRecommendation[]`, `redundancyWarnings[]`, `totalMonthlySavings`, and `isHighSavings`.

3. **POST `/api/audit`** — sends `{ auditInput, auditResult }` to the Next.js Route Handler.  
   - **AI Synthesis:** The handler calls **OpenRouter** with a custom prompt containing the `AuditResult`.
   - **Persistence:** It inserts both blobs and the AI summary into the `audits` table using the Supabase service-role key.  
   - Returns `{ uuid }` (a UUID v4).

4. **Redirect to `/audit/[uuid]`** — Next.js Server Component fetches the row from Supabase anon key (public read, no PII).  
   Renders `AuditResults` (stats + `RecommendationCard` grid) and `LeadCapture` form.

5. **Lead submits email** → POST `/api/lead` → inserts into `leads` table (service-role only, private RLS policy).  
   Optionally fires Resend email with the shareable audit link.

---

## Why This Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| **Framework** | Next.js 14 App Router | Server Components for SEO on result pages; no extra server to manage; Vercel edge deploys trivially |
| **Language** | TypeScript (strict mode) | Audit engine logic is financial — type safety prevents silent data-shape bugs |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Zero runtime CSS, full control, components are owned (copy-paste, not a dependency) |
| **Database** | Supabase (Postgres) | Built-in RLS isolates lead PII from public audit data without extra middleware |
| **Auth** | None (by design) | Value delivered before any sign-up wall. Lead captured after results are shown |
| **Email** | Resend | Generous free tier, simple API, great deliverability |
| **Rate limiting** | Upstash Redis + @upstash/ratelimit | Edge-compatible, serverless-friendly, no cold starts |

---

## Scaling to 10k Audits/Day

At ~10k audits/day the current architecture holds, but these are the first changes:

1. **Rate limiting** — activate the Upstash middleware on `/api/audit` (already wired, just needs env vars). Current free tier handles ~500k requests/day.

2. **Supabase connection pooling** — switch to PgBouncer (Supabase Transaction mode) to avoid exhausting Postgres connections from concurrent serverless invocations.

3. **Result caching** — add `Cache-Control: s-maxage=3600` on `/audit/[uuid]` pages. Results are immutable after creation; Vercel's CDN would serve most reads without hitting Supabase.

4. **Audit engine stays client-side** — the pure TS engine runs in the browser; 10k audits/day means zero server compute for the core logic.

5. **Email queue** — move Resend calls off the request path into a background job (Vercel Cron or Upstash QStash) to avoid P99 latency spikes on `/api/lead`.
